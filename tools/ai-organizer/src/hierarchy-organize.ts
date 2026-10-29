import type { AgentOrganizePlan, IRDocumentLike, IRNodeLike } from '../../../shared/agent-plan-types';
import { applyAgentPlan, validateAgentPlan } from './apply-plan';

interface HierarchyNode {
  name: string;
  figmaId: string | null;
  children: HierarchyNode[];
}

function byYThenX(a: IRNodeLike, b: IRNodeLike): number {
  const dy = (a?.rect?.y ?? 0) - (b?.rect?.y ?? 0);
  if (dy !== 0) return dy;
  return (a?.rect?.x ?? 0) - (b?.rect?.x ?? 0);
}

function flattenNodes(node: IRNodeLike): IRNodeLike[] {
  const out: IRNodeLike[] = [];
  const walk = (n: IRNodeLike): void => {
    out.push(n);
    for (const child of n.children ?? []) walk(child);
  };
  walk(node);
  return out;
}

function asNode(name: string, source: IRNodeLike | null = null, children: HierarchyNode[] = []): HierarchyNode {
  return {
    name,
    figmaId: source?.figmaId ?? null,
    children,
  };
}

function pairByIndex(
  listA: IRNodeLike[],
  listB: IRNodeLike[],
  itemName: string,
  aName: string,
  bName: string,
): HierarchyNode[] {
  const pairs: HierarchyNode[] = [];
  const count = Math.min(listA.length, listB.length);
  for (let i = 0; i < count; i += 1) {
    pairs.push(
      asNode(`${itemName}_${String(i + 1).padStart(2, '0')}`, null, [
        asNode(aName, listA[i]),
        asNode(bName, listB[i]),
      ]),
    );
  }
  return pairs;
}

function tripleByIndex(
  aList: IRNodeLike[],
  bList: IRNodeLike[],
  cList: IRNodeLike[],
  itemName: string,
  aName: string,
  bName: string,
  cName: string,
): HierarchyNode[] {
  const items: HierarchyNode[] = [];
  const count = Math.min(aList.length, bList.length, cList.length);
  for (let i = 0; i < count; i += 1) {
    items.push(
      asNode(`${itemName}_${String(i + 1).padStart(2, '0')}`, null, [
        asNode(aName, aList[i]),
        asNode(bName, bList[i]),
        asNode(cName, cList[i]),
      ]),
    );
  }
  return items;
}

function detectLikelyGeometryCorruption(ir: IRDocumentLike): string | null {
  const all = flattenNodes(ir.root).filter((n) => n.included !== false);
  const tabGroup = all.find((n) => n.name === 'tab_group' && n.figmaType !== 'VIRTUAL');
  const panelChat = all.find((n) => n.name === 'panel_chat' && n.figmaType !== 'VIRTUAL');
  if (!tabGroup || !panelChat) return null;

  // 正常情況下 panel_chat 應包住 tab_group；若 panel_chat 左邊界大於 tab_group 很多，通常是 parse 汙染。
  const leftGap = panelChat.absRect.x - tabGroup.absRect.x;
  if (leftGap > Math.max(panelChat.absRect.width * 0.3, 64)) {
    return `panel_chat 左邊界異常偏右（gap=${leftGap.toFixed(1)}）`;
  }

  // 若 root 寬度遠大於 panel_chat，且 tab/text 落在 root 最左邊，也代表已展開污染。
  const rootW = ir.root.absRect.width;
  const panelW = panelChat.absRect.width;
  if (rootW > panelW * 1.5) {
    return `root 寬度異常（root=${rootW.toFixed(1)}, panel_chat=${panelW.toFixed(1)}）`;
  }
  return null;
}

export function buildHierarchyFromIR(ir: IRDocumentLike): HierarchyNode {
  const allNodes = flattenNodes(ir.root);
  const byName = (name: string): IRNodeLike[] =>
    allNodes.filter((n) => n?.name === name && n.included !== false).sort(byYThenX);
  const first = (name: string): IRNodeLike | null => byName(name)[0] ?? null;

  const panelChat = first('panel_chat') ?? ir.root ?? null;
  const panelChatBg = first('panel_chat_bg') ?? null;
  const tabGroupBg = first('tab_group');
  const panelTitleBg = first('panel_title');
  const panelInputBg = first('panel_input');

  const tabs = byName('tab');
  const tabTexts = byName('tab_text');
  const messages = byName('message');
  const heads = byName('head');
  const messageTexts = byName('message_text');

  const tabItems = pairByIndex(tabs, tabTexts, 'tab_item', 'tab', 'tab_text');
  const messageItems = tripleByIndex(
    messages,
    heads,
    messageTexts,
    'message_item',
    'message',
    'head',
    'message_text',
  );

  return asNode('panel_chat', panelChat, [
    asNode('panel_chat_bg', panelChatBg ?? panelChat),
    asNode('tab_group', tabGroupBg, [asNode('tab_group_bg', tabGroupBg), ...tabItems]),
    asNode('panel_title', panelTitleBg, [
      asNode('panel_title_bg', panelTitleBg),
      asNode('title', first('title')),
    ]),
    asNode('message_list', null, messageItems),
    asNode('panel_input', panelInputBg, [
      asNode('panel_input_bg', panelInputBg),
      asNode('input', first('input')),
      asNode('edit_text', first('edit_text')),
    ]),
  ]);
}

function roleFromName(name: string): AgentOrganizePlan['nodeHints'][string]['containerRole'] {
  if (name.includes('bg') || name.includes('background')) return 'background';
  if (name.includes('title') || name.includes('header')) return 'header';
  if (name.includes('input') || name.includes('footer')) return 'footer';
  if (name.includes('message') || name.includes('content')) return 'content';
  return 'custom';
}

export function hierarchyToPlan(
  hierarchy: HierarchyNode,
  summary: string,
): AgentOrganizePlan {
  const nodeHints: AgentOrganizePlan['nodeHints'] = {};
  const virtualContainers: NonNullable<AgentOrganizePlan['virtualContainers']> = [];
  let vcSeq = 1;

  const walk = (node: HierarchyNode, path: string[]): string | null => {
    const nextPath = [...path, node.name];
    const childRefs = (node.children ?? [])
      .map((child) => walk(child, nextPath))
      .filter((id): id is string => Boolean(id));

    if (node.figmaId) {
      nodeHints[node.figmaId] = {
        figmaId: node.figmaId,
        name: node.name,
        containerRole: roleFromName(node.name.toLowerCase()),
        organizeHint: `Hierarchy path: ${nextPath.join(' > ')}`,
      };
      // 葉節點才直接回 figmaId；有子節點時由子節點承接，避免父子同時入樹造成重排偏移。
      if (childRefs.length === 0) return node.figmaId;
    }

    const vcId = `vc_ref_${vcSeq++}`;
    // Preview 會將 virtual children 反向 append（back-first），
    // 因此這裡需先存成 front-first，避免背景層被蓋到最上面。
    const mergedChildren = Array.from(new Set(childRefs)).reverse();
    if (mergedChildren.length === 0) return null;
    virtualContainers.push({
      id: vcId,
      name: node.name,
      containerRole: roleFromName(node.name.toLowerCase()) ?? 'custom',
      children: mergedChildren,
      organizeHint: `Reference hierarchy container: ${nextPath.join(' > ')}`,
    });
    return vcId;
  };

  const rootRef = walk(hierarchy, []);
  return {
    version: '1.0',
    organizer: 'cursor-agent',
    preserveVisual: true,
    summary,
    nodeHints,
    virtualRoot: { children: rootRef ? [rootRef] : [] },
    virtualContainers,
  };
}

export function organizeWithReferenceHierarchy(
  ir: IRDocumentLike,
  referenceImageName?: string,
): { hierarchy: HierarchyNode; plan: AgentOrganizePlan; organized: IRDocumentLike } {
  const corruption = detectLikelyGeometryCorruption(ir);
  if (corruption) {
    throw new Error(
      `偵測到來源 IR 座標異常：${corruption}。請先在 Figma 還原/清除 [FTC] 預覽後重新解析 Page，再執行 AI 整理。`,
    );
  }
  const hierarchy = buildHierarchyFromIR(ir);
  const summary = referenceImageName
    ? `根據 IR 與示意圖(${referenceImageName})生成 hierarchy`
    : '根據 IR 生成 hierarchy';
  const plan = hierarchyToPlan(hierarchy, summary);
  const valid = validateAgentPlan(ir, plan);
  if (!valid.ok) {
    const errors = 'errors' in valid ? valid.errors : ['unknown'];
    throw new Error(`reference hierarchy plan 驗證失敗：${errors.join('；')}`);
  }
  const organized = applyAgentPlan(ir, plan);
  return { hierarchy, plan, organized };
}
