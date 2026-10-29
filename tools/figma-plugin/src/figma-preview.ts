/** 將 organized IR 同步到 Figma 圖層（虛擬 Frame + 重排 parent，absRect 不變） */

export interface IRRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IRNodePreview {
  figmaId: string;
  name: string;
  figmaType?: string;
  rect: IRRect;
  absRect?: IRRect;
  children?: IRNodePreview[];
}

interface MoveRecord {
  nodeId: string;
  nodeName: string;
  parentId: string;
  parentName: string;
  index: number;
  x: number;
  y: number;
}

export interface PreviewDiff {
  nodeId: string;
  nodeName: string;
  fromParent: string;
  toParent: string;
}

export interface PreviewSession {
  pageId: string;
  virtualFrameIds: string[];
  moves: MoveRecord[];
  diffs: PreviewDiff[];
}

const sessionStack: PreviewSession[] = [];
const VIRTUAL_FRAME_PREFIX = '[FTC] ';

function isVirtualNode(node: IRNodePreview): boolean {
  return node.figmaType === 'VIRTUAL' || node.figmaId.startsWith('vc_') || node.name.startsWith(VIRTUAL_FRAME_PREFIX);
}

function isVirtualFrame(node: BaseNode): node is FrameNode {
  return node.type === 'FRAME' && node.name.startsWith(VIRTUAL_FRAME_PREFIX);
}

function nodeDepth(node: BaseNode): number {
  let depth = 0;
  let cursor: BaseNode | null = node;
  while (cursor?.parent) {
    depth++;
    cursor = cursor.parent;
  }
  return depth;
}

function visualAbsoluteXY(node: SceneNode): { x: number; y: number } {
  const withBounds = node as SceneNode & { absoluteBoundingBox?: Rect | null };
  if (withBounds.absoluteBoundingBox) {
    return { x: withBounds.absoluteBoundingBox.x, y: withBounds.absoluteBoundingBox.y };
  }
  const t = node.absoluteTransform;
  return { x: t[0][2], y: t[1][2] };
}

function unwrapVirtualFrames(page: PageNode): boolean {
  const frames = page
    .findAll((n) => isVirtualFrame(n))
    .filter((n): n is FrameNode => n.type === 'FRAME');
  if (frames.length === 0) return false;

  frames.sort((a, b) => nodeDepth(b) - nodeDepth(a));
  for (const frame of frames) {
    if (frame.removed) continue;
    const children = [...frame.children];
    for (const child of children) {
      const abs = visualAbsoluteXY(child);
      page.appendChild(child);
      if ('x' in child) {
        (child as LayoutMixin).x = abs.x;
        (child as LayoutMixin).y = abs.y;
      }
    }
    frame.remove();
  }
  return true;
}

/** 整理前採集 Figma 原始繪製順序（越小越在底層） */
function buildPaintOrderMap(page: PageNode): Map<string, number> {
  const map = new Map<string, number>();
  let order = 0;
  const walk = (parent: BaseNode & ChildrenMixin): void => {
    const children = parent.children as readonly SceneNode[];
    for (const child of children) {
      order += 1;
      map.set(child.id, order);
      if ('children' in child) walk(child as BaseNode & ChildrenMixin);
    }
  };
  walk(page);
  return map;
}

function paintIndexForIRNode(node: IRNodePreview, paintOrder: Map<string, number>): number {
  if (!isVirtualNode(node)) {
    return paintOrder.get(node.figmaId) ?? Number.MAX_SAFE_INTEGER;
  }
  let min = Number.MAX_SAFE_INTEGER;
  const walk = (n: IRNodePreview): void => {
    if (!isVirtualNode(n)) {
      const v = paintOrder.get(n.figmaId);
      if (v !== undefined) min = Math.min(min, v);
      return;
    }
    for (const c of n.children ?? []) walk(c);
  };
  walk(node);
  return min;
}

/** Figma appendChild 需 back-first；依原始圖層順序排序，避免 AI/heuristic 子節點順序不一致 */
function sortChildrenForFigmaAppend(
  children: IRNodePreview[],
  paintOrder: Map<string, number>,
): IRNodePreview[] {
  return [...children].sort(
    (a, b) => paintIndexForIRNode(a, paintOrder) - paintIndexForIRNode(b, paintOrder),
  );
}

function localPositionFor(
  node: IRNodePreview,
  parentAbs: { x: number; y: number },
): { x: number; y: number; width: number; height: number } {
  if (node.absRect) {
    return {
      x: node.absRect.x - parentAbs.x,
      y: node.absRect.y - parentAbs.y,
      width: node.absRect.width,
      height: node.absRect.height,
    };
  }
  return {
    x: node.rect.x,
    y: node.rect.y,
    width: node.rect.width,
    height: node.rect.height,
  };
}

function flattenRealNodesWithAbs(node: IRNodePreview, out: IRNodePreview[] = []): IRNodePreview[] {
  if (!isVirtualNode(node) && node.absRect) out.push(node);
  for (const child of node.children ?? []) flattenRealNodesWithAbs(child, out);
  return out;
}

async function reconcileAbsolutePositions(
  irRoot: IRNodePreview,
): Promise<{ driftCount: number; driftMax: number }> {
  const targets = flattenRealNodesWithAbs(irRoot);
  let driftCount = 0;
  let driftMax = 0;
  for (const irNode of targets) {
    const figmaNode = (await figma.getNodeByIdAsync(irNode.figmaId)) as SceneNode | null;
    if (!figmaNode || !('x' in figmaNode) || !irNode.absRect) continue;

    const now = visualAbsoluteXY(figmaNode);
    const dx = now.x - irNode.absRect.x;
    const dy = now.y - irNode.absRect.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0.1) {
      (figmaNode as LayoutMixin).x -= dx;
      (figmaNode as LayoutMixin).y -= dy;
      driftCount += 1;
      driftMax = Math.max(driftMax, dist);
    }
  }
  return { driftCount, driftMax };
}

function recordMove(node: SceneNode, session: PreviewSession): void {
  if (session.moves.some((m) => m.nodeId === node.id)) return;
  const parent = node.parent;
  if (!parent || !('children' in parent)) return;
  const siblings = parent.children as readonly SceneNode[];
  session.moves.push({
    nodeId: node.id,
    nodeName: node.name,
    parentId: parent.id,
    parentName: parent.name,
    index: siblings.indexOf(node),
    x: 'x' in node ? (node as LayoutMixin).x : 0,
    y: 'y' in node ? (node as LayoutMixin).y : 0,
  });
}

function createVirtualFrame(
  node: IRNodePreview,
  parent: BaseNode & ChildrenMixin,
  parentAbs: { x: number; y: number },
): FrameNode {
  const frame = figma.createFrame();
  frame.name = `${VIRTUAL_FRAME_PREFIX}${node.name}`;
  frame.layoutMode = 'NONE';
  frame.clipsContent = false;
  frame.fills = [];
  frame.strokes = [];
  frame.strokeWeight = 0;
  frame.dashPattern = [];
  parent.appendChild(frame);
  const target = localPositionFor(node, parentAbs);
  frame.resize(Math.max(target.width, 1), Math.max(target.height, 1));
  frame.x = target.x;
  frame.y = target.y;
  return frame;
}

async function syncIRNodeToFigma(
  node: IRNodePreview,
  parent: BaseNode & ChildrenMixin,
  session: PreviewSession,
  parentAbs: { x: number; y: number },
  paintOrder: Map<string, number>,
): Promise<void> {
  if (isVirtualNode(node)) {
    const frame = createVirtualFrame(node, parent, parentAbs);
    session.virtualFrameIds.push(frame.id);
    const nextParentAbs = node.absRect
      ? { x: node.absRect.x, y: node.absRect.y }
      : { x: parentAbs.x + node.rect.x, y: parentAbs.y + node.rect.y };
    for (const child of sortChildrenForFigmaAppend(node.children ?? [], paintOrder)) {
      await syncIRNodeToFigma(child, frame, session, nextParentAbs, paintOrder);
    }
    return;
  }

  const figmaNode = (await figma.getNodeByIdAsync(node.figmaId)) as SceneNode | null;
  if (!figmaNode) {
    throw new Error(`找不到 Figma 節點「${node.name}」（${node.figmaId}）`);
  }

  recordMove(figmaNode, session);
  const targetLayerName = node.name?.trim();
  if (targetLayerName && figmaNode.name !== targetLayerName) {
    figmaNode.name = targetLayerName;
  }
  const fromParent = figmaNode.parent?.name ?? 'Unknown';
  parent.appendChild(figmaNode);
  const toParent = parent.name;
  if (fromParent !== toParent) {
    session.diffs.push({
      nodeId: figmaNode.id,
      nodeName: figmaNode.name,
      fromParent,
      toParent,
    });
  }
  if ('x' in figmaNode) {
    const target = localPositionFor(node, parentAbs);
    (figmaNode as LayoutMixin).x = target.x;
    (figmaNode as LayoutMixin).y = target.y;
  }

  const children = node.children ?? [];
  if (children.length > 0) {
    if (!('children' in figmaNode)) {
      throw new Error(`節點「${node.name}」不是容器，無法掛載子節點`);
    }
    const parentNode = figmaNode as BaseNode & ChildrenMixin;
    const nextParentAbs = node.absRect
      ? { x: node.absRect.x, y: node.absRect.y }
      : { x: parentAbs.x + node.rect.x, y: parentAbs.y + node.rect.y };
    for (const child of sortChildrenForFigmaAppend(children, paintOrder)) {
      await syncIRNodeToFigma(child, parentNode, session, nextParentAbs, paintOrder);
    }
  }
}

/** 將 organized IR 的 root.children 套用到 Page 圖層 */
export async function applyOrganizedPreview(
  page: PageNode,
  irRoot: IRNodePreview,
): Promise<{ moved: number; virtualFrames: number; diffs: PreviewDiff[]; driftCount: number; driftMax: number }> {
  const paintOrder = buildPaintOrderMap(page);
  // 每次新預覽前都先完整還原，避免狀態累積造成整理效果劣化。
  const cleared = await clearOrganizedPreview('all');
  if (!cleared) {
    // plugin reload 後若 session 遺失，主動清理殘留 [FTC] 容器，避免重複包裹。
    unwrapVirtualFrames(page);
  }

  const session: PreviewSession = {
    pageId: page.id,
    virtualFrameIds: [],
    moves: [],
    diffs: [],
  };

  const children = irRoot.children ?? [];
  for (const child of sortChildrenForFigmaAppend(children, paintOrder)) {
    await syncIRNodeToFigma(child, page, session, { x: 0, y: 0 }, paintOrder);
  }
  const drift = await reconcileAbsolutePositions(irRoot);

  sessionStack.push(session);
  return {
    moved: session.moves.length,
    virtualFrames: session.virtualFrameIds.length,
    diffs: session.diffs,
    driftCount: drift.driftCount,
    driftMax: drift.driftMax,
  };
}

/** 還原預覽前的 parent 與位置，刪除虛擬 Frame */
export async function clearOrganizedPreview(scope: 'latest' | 'all' = 'all'): Promise<boolean> {
  if (sessionStack.length === 0) {
    return false;
  }

  const targets =
    scope === 'all'
      ? [...sessionStack].reverse()
      : [sessionStack[sessionStack.length - 1]];
  if (scope === 'all') sessionStack.length = 0;
  else sessionStack.pop();

  for (const session of targets) {
    for (const move of [...session.moves].reverse()) {
      const node = (await figma.getNodeByIdAsync(move.nodeId)) as SceneNode | null;
      const parent = (await figma.getNodeByIdAsync(move.parentId)) as (BaseNode & ChildrenMixin) | null;
      if (!node || !parent || !('appendChild' in parent)) continue;

      const siblings = parent.children as SceneNode[];
      const index = Math.min(move.index, siblings.length);
      parent.insertChild(index, node);
      if (move.nodeName && node.name !== move.nodeName) {
        node.name = move.nodeName;
      }
      if ('x' in node) {
        (node as LayoutMixin).x = move.x;
        (node as LayoutMixin).y = move.y;
      }
    }

    for (const frameId of session.virtualFrameIds) {
      const frame = await figma.getNodeByIdAsync(frameId);
      if (frame) frame.remove();
    }
  }

  if (scope === 'all') {
    const pageId = targets[0]?.pageId;
    const page = pageId ? ((await figma.getNodeByIdAsync(pageId)) as PageNode | null) : null;
    if (page) unwrapVirtualFrames(page);
  }

  return true;
}

export function hasActivePreview(): boolean {
  return sessionStack.length > 0;
}

export function getPreviewSessionCount(): number {
  return sessionStack.length;
}
