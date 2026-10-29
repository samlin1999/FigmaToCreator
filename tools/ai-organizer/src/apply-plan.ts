import type {
  AgentNodeHint,
  AgentOrganizePlan,
  AgentVirtualContainer,
  ContainerRole,
  IRDocumentLike,
  IRNodeLike,
  IRRect,
  LayoutHint,
  WidgetHint,
} from '../../../shared/agent-plan-types';
import { applyButtonGroupMinBounds } from './button-group-bounds';
import {
  applyGenericNamesToLeaves,
  ensureBtnInName,
  isButtonAnnotatedText,
  isButtonHint,
  mergeNameWithOriginalTokens,
} from './infer-node-names';
import { sanitizeNodeName } from './normalize-plan';
import type { CustomGuideOverrides } from '../../../shared/custom-guide-overrides';
import {
  agentNodeLegend,
  collectAgentContextRows,
  stringifyAgentNodes,
  type AgentContextRow,
} from '../../../shared/agent-prompt-format';
import { useCompactOrganizePrompt } from '../../../shared/organize-prompt-config';
import { BUTTON_GROUP_MIN_SIZE } from './button-group-bounds';

function cloneNode(node: IRNodeLike): IRNodeLike {
  return {
    ...node,
    children: node.children.map(cloneNode),
  };
}

function indexNodes(root: IRNodeLike, map = new Map<string, IRNodeLike>()): Map<string, IRNodeLike> {
  map.set(root.figmaId, root);
  for (const c of root.children) indexNodes(c, map);
  return map;
}

function unionAbsRect(rects: IRRect[]): IRRect {
  if (!rects.length) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const r of rects) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.width);
    maxY = Math.max(maxY, r.y + r.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function applyHintToNode(node: IRNodeLike, hint?: AgentNodeHint): void {
  if (!hint) return;
  if (hint.name) {
    let nextName = sanitizeNodeName(hint.name);
    if (nextName) nextName = mergeNameWithOriginalTokens(node.name, nextName);
    if (nextName && isButtonHint(hint, node)) nextName = ensureBtnInName(nextName);
    if (nextName) node.name = nextName;
  } else if (isButtonHint(hint, node)) {
    node.name = ensureBtnInName(mergeNameWithOriginalTokens(node.name, node.name));
  }
  if (hint.type) {
    // TEXT 節點維持 label，避免 AI 誤標為 button 導致 Prefab 略過 Label 元件
    if (node.figmaType === 'TEXT' || node.text) {
      node.type = 'label';
    } else {
      node.type = hint.type;
    }
  }
  if (hint.containerRole) node.containerRole = hint.containerRole;
  if (hint.layout) node.layout = hint.layout;
  if (hint.widget) node.widget = hint.widget;
  if (hint.organizeHint) node.organizeHint = hint.organizeHint;
}

function buildVirtualNode(
  vc: AgentVirtualContainer,
  nodeMap: Map<string, IRNodeLike>,
  vcMap: Map<string, AgentVirtualContainer>,
  parentAbs: IRRect,
  nodeHints: Record<string, AgentNodeHint>,
  guideOverrides?: CustomGuideOverrides,
): IRNodeLike | null {
  const childNodes: IRNodeLike[] = [];
  for (const childId of vc.children) {
    const figmaNode = nodeMap.get(childId);
    if (figmaNode) {
      const cloned = cloneNode(figmaNode);
      applyHintToNode(cloned, nodeHints[childId]);
      childNodes.push(cloned);
      continue;
    }
    const nested = vcMap.get(childId);
    if (nested) {
      const built = buildVirtualNode(nested, nodeMap, vcMap, parentAbs, nodeHints, guideOverrides);
      if (built) childNodes.push(built);
    }
  }

  if (!childNodes.length) return null;

  let absRect = unionAbsRect(childNodes.map((n) => n.absRect));
  const btnMin = guideOverrides?.buttonGroupMinSize ?? BUTTON_GROUP_MIN_SIZE;
  absRect = applyButtonGroupMinBounds(absRect, vc, childNodes, nodeHints, btnMin);
  return {
    figmaId: vc.id,
    name: isButtonAnnotatedText(`${vc.organizeHint ?? ''} ${vc.name}`)
      ? ensureBtnInName(vc.name)
      : vc.name,
    figmaType: 'VIRTUAL',
    type: 'container',
    rect: {
      x: absRect.x - parentAbs.x,
      y: absRect.y - parentAbs.y,
      width: absRect.width,
      height: absRect.height,
    },
    absRect,
    visible: true,
    included: true,
    containerRole: vc.containerRole,
    layout: vc.layout,
    organizeHint: vc.organizeHint ?? `虛擬容器：${vc.name}`,
    children: childNodes.map((n) => ({
      ...n,
      rect: {
        x: n.absRect.x - absRect.x,
        y: n.absRect.y - absRect.y,
        width: n.absRect.width,
        height: n.absRect.height,
      },
    })),
  };
}

/** 將 Agent 計畫合併進 IR，absRect 不變 */
export function applyAgentPlan(
  ir: IRDocumentLike,
  plan: AgentOrganizePlan,
  options?: { guideOverrides?: CustomGuideOverrides },
): IRDocumentLike {
  const result = cloneNode(ir.root);
  const doc: IRDocumentLike = {
    ...ir,
    preserveVisual: true,
    organizedBy: plan.organizer,
    agentSummary: plan.summary,
    root: result,
  };

  const namedByHint = new Set<string>();
  for (const [figmaId, hint] of Object.entries(plan.nodeHints)) {
    if (hint?.name?.trim()) namedByHint.add(figmaId);
  }

  const nodeMap = indexNodes(result);
  for (const figmaId of Object.keys(plan.nodeHints)) {
    const hint = plan.nodeHints[figmaId];
    const node = nodeMap.get(figmaId);
    if (node && hint) applyHintToNode(node, { ...hint, figmaId });
  }

  if (!plan.virtualRoot?.children?.length || !plan.virtualContainers?.length) {
    applyGenericNamesToLeaves(result, ir.root, { skipFigmaIds: namedByHint });
    return doc;
  }

  const vcMap = new Map<string, AgentVirtualContainer>(
    plan.virtualContainers.map((v): [string, AgentVirtualContainer] => [v.id, v]),
  );
  const pageAbs = result.absRect;
  const newChildren: IRNodeLike[] = [];

  for (const childId of plan.virtualRoot.children) {
    const figmaNode = nodeMap.get(childId);
    if (figmaNode) {
      const cloned = cloneNode(figmaNode);
      applyHintToNode(cloned, plan.nodeHints[childId]);
      newChildren.push(cloned);
      continue;
    }
    const vc = vcMap.get(childId);
    if (vc) {
      const built = buildVirtualNode(vc, nodeMap, vcMap, pageAbs, plan.nodeHints, options?.guideOverrides);
      if (built) newChildren.push(built);
    }
  }

  if (newChildren.length) {
    result.children = newChildren.map((n) => ({
      ...n,
      rect: {
        x: n.absRect.x - pageAbs.x,
        y: n.absRect.y - pageAbs.y,
        width: n.absRect.width,
        height: n.absRect.height,
      },
    }));
  }

  applyGenericNamesToLeaves(result, ir.root, { skipFigmaIds: namedByHint });
  return doc;
}

/** @deprecated 請用 collectAgentContextRows；保留給舊呼叫端 */
export function flattenForAgentContext(root: IRNodeLike, pageAbs: IRRect): object[] {
  return collectAgentContextRows(root, pageAbs) as object[];
}

function formatAgentNodesBlock(rows: AgentContextRow[], pretty: boolean, forceVerbose = false): string {
  return `${agentNodeLegend(forceVerbose)}\nnodes=${stringifyAgentNodes(rows, pretty, forceVerbose)}`;
}

function pageMetaLines(ir: IRDocumentLike, pageAbs: IRRect): string {
  const pageName = (ir.source as { pageName?: string }).pageName ?? ir.root.name;
  return `page="${pageName}" size=${ir.designSize.width}x${ir.designSize.height} absRect=[${Math.round(pageAbs.x)},${Math.round(pageAbs.y)},${Math.round(pageAbs.width)},${Math.round(pageAbs.height)}]`;
}

/** 驗證 Agent Plan 是否可套用至 IR（figmaId 存在、virtual 容器引用有效） */
export function validateAgentPlan(
  ir: IRDocumentLike,
  plan: AgentOrganizePlan,
): { ok: true } | { ok: false; errors: string[] } {
  const nodeMap = indexNodes(ir.root);
  const errors: string[] = [];
  const vcIds = new Set((plan.virtualContainers ?? []).map((v) => v.id));

  for (const [figmaId] of Object.entries(plan.nodeHints)) {
    if (!nodeMap.has(figmaId)) errors.push(`nodeHints 引用不存在的 figmaId: ${figmaId}`);
  }

  for (const vc of plan.virtualContainers ?? []) {
    for (const childId of vc.children) {
      if (!nodeMap.has(childId) && !vcIds.has(childId)) {
        errors.push(`virtualContainers["${vc.id}"] 引用未知 id: ${childId}`);
      }
    }
  }

  for (const childId of plan.virtualRoot?.children ?? []) {
    if (!nodeMap.has(childId) && !vcIds.has(childId)) {
      errors.push(`virtualRoot 引用未知 id: ${childId}`);
    }
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}

/** 示意圖模式：強調依附圖圈選區分組，避免只輸出 BackgroundLayer */
export function buildReferenceAgentPrompt(
  ir: IRDocumentLike,
  options?: { referenceImageName?: string; prettyNodes?: boolean; full?: boolean },
): string {
  const pageAbs = ir.root.absRect;
  const rows = collectAgentContextRows(ir.root, pageAbs);
  const imageName = options?.referenceImageName ?? 'reference';
  const compact = !options?.full && useCompactOrganizePrompt();
  const pretty = options?.prettyNodes ?? !compact;

  if (compact) {
    return (
      `# Task: IR + image "${imageName}" → AgentOrganizePlan JSON only\n` +
      `${pageMetaLines(ir, pageAbs)}\n` +
      'Vision: each circled/boxed zone = one virtual container (≥ zone count); map nodes by r/c vs image; no single BackgroundLayer for all; Group g=1 use group i in virtualContainers; every leaf needs nodeHints.name (btn in name if button).\n' +
      `${formatAgentNodesBlock(rows, pretty, false)}`
    );
  }

  return `# Figma Page 階層整理（IR + 示意圖圈選區）

## 最高優先（必做）
1. **先看附圖**（${imageName}）中的手繪圈選/框選區；每一個圈 = 一個 virtual container。
2. 將下方節點依 absRect / relCenter（0~1）對應進各圈選區。
3. **禁止**只建立單一 BackgroundLayer 塞全部節點；附圖 N 個圈 → 至少 N 個語意容器。
4. 不得修改 leaf absRect。Group 不可拆散；lk 節點禁止單獨分配。
5. 每個葉節點 nodeHints.name 必填；按鈕名含 btn。

## Page
${pageMetaLines(ir, pageAbs)}

${formatAgentNodesBlock(rows, true, true)}

## 輸出
只輸出 AgentOrganizePlan JSON，figmaId 來自 nodes。`;
}

export function buildAgentPrompt(
  ir: IRDocumentLike,
  options?: { prettyNodes?: boolean; full?: boolean },
): string {
  const pageAbs = ir.root.absRect;
  const rows = collectAgentContextRows(ir.root, pageAbs);
  const compact = !options?.full && useCompactOrganizePrompt();
  const pretty = options?.prettyNodes ?? !compact;

  if (compact) {
    return (
      '# Task: organize IR → AgentOrganizePlan JSON only\n' +
      `${pageMetaLines(ir, pageAbs)}\n` +
      '2~4 virtual containers; every leaf nodeHints.name; optional widget/layout per Skill; Group g=1 intact.\n' +
      `${formatAgentNodesBlock(rows, pretty, false)}`
    );
  }

  return `# Figma Page 階層整理（AI Agent）

## 目標
畫面不變（不改 absRect）；虛擬容器 + 語意命名 + 可選 widget/layout。

## Page
${pageMetaLines(ir, pageAbs)}

${formatAgentNodesBlock(rows, true, true)}

## 輸出
只輸出 AgentOrganizePlan JSON；figmaId 來自 nodes；每葉節點 nodeHints.name 必填；Group 不可拆。`;
}

export type { AgentOrganizePlan, WidgetHint, LayoutHint, ContainerRole };
