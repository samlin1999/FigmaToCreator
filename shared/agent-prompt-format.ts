import type { IRNodeLike, IRRect } from './agent-plan-types';
import { isFigmaUserGroup, leafToUserGroupMap } from './figma-group-preserve';
import {
  agentNodeTextMaxChars,
  customGuideMaxChars,
  useCompactAgentNodes,
} from './organize-prompt-config';

export const AGENT_NODE_LEGEND_COMPACT =
  '節點欄位：i=figmaId,n=name,ft=figmaType,t=type,r=[x,y,w,h],c=[relCenter 0~1],ar=areaRatio,tx=text,g=1 Figma Group,lk=lockedInUserGroupId';

export const AGENT_NODE_LEGEND_VERBOSE =
  '節點欄位：figmaId,name,figmaType,type,absRect,relCenter,areaRatio,text,isUserGroup,lockedInUserGroupId';

export interface AgentContextRow {
  figmaId: string;
  name: string;
  figmaType: string;
  type: string;
  absRect: IRRect;
  relCenter: { x: number; y: number };
  areaRatio: number;
  text?: string;
  isUserGroup?: boolean;
  lockedInUserGroupId?: string;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function truncateText(text: string | undefined, max: number): string | undefined {
  if (!text) return undefined;
  const t = text.replace(/\s+/g, ' ').trim();
  if (!t) return undefined;
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** 收集 included 節點（略過 VIRTUAL）供 Agent 使用 */
export function collectAgentContextRows(root: IRNodeLike, pageAbs: IRRect): AgentContextRow[] {
  const leafToGroup = leafToUserGroupMap(root);
  const rows: AgentContextRow[] = [];
  const textMax = agentNodeTextMaxChars();

  function walk(node: IRNodeLike) {
    if (node.included === false) return;
    const isVirtual = node.figmaType === 'VIRTUAL' || node.figmaId.startsWith('vc_');
    if (!isVirtual) {
      const cx = node.absRect.x + node.absRect.width / 2;
      const cy = node.absRect.y + node.absRect.height / 2;
      const lockedInUserGroupId = leafToGroup.get(node.figmaId);
      const isUserGroup = isFigmaUserGroup(node);
      const row: AgentContextRow = {
        figmaId: node.figmaId,
        name: node.name,
        figmaType: node.figmaType ?? '',
        type: node.type,
        absRect: {
          x: Math.round(node.absRect.x),
          y: Math.round(node.absRect.y),
          width: Math.round(node.absRect.width),
          height: Math.round(node.absRect.height),
        },
        relCenter: {
          x: round3(pageAbs.width > 0 ? (cx - pageAbs.x) / pageAbs.width : 0),
          y: round3(pageAbs.height > 0 ? (cy - pageAbs.y) / pageAbs.height : 0),
        },
        areaRatio: round3(
          pageAbs.width * pageAbs.height > 0
            ? (node.absRect.width * node.absRect.height) / (pageAbs.width * pageAbs.height)
            : 0,
        ),
      };
      const tx = truncateText(node.text, textMax);
      if (tx) row.text = tx;
      if (isUserGroup) row.isUserGroup = true;
      if (lockedInUserGroupId) row.lockedInUserGroupId = lockedInUserGroupId;
      rows.push(row);
    }
    for (const c of node.children) walk(c);
  }
  for (const c of root.children) walk(c);
  return rows;
}

function rowToCompact(row: AgentContextRow): Record<string, unknown> {
  const out: Record<string, unknown> = {
    i: row.figmaId,
    n: row.name,
    ft: row.figmaType,
    t: row.type,
    r: [row.absRect.x, row.absRect.y, row.absRect.width, row.absRect.height],
    c: [row.relCenter.x, row.relCenter.y],
  };
  if (row.areaRatio > 0.001) out.ar = row.areaRatio;
  if (row.text) out.tx = row.text;
  if (row.isUserGroup) out.g = 1;
  if (row.lockedInUserGroupId) out.lk = row.lockedInUserGroupId;
  return out;
}

/** 序列化節點列表（預設緊湊單行 JSON） */
export function stringifyAgentNodes(
  rows: AgentContextRow[],
  pretty = false,
  forceVerbose = false,
): string {
  if (!forceVerbose && useCompactAgentNodes()) {
    const compact = rows.map(rowToCompact);
    return pretty ? JSON.stringify(compact, null, 2) : JSON.stringify(compact);
  }
  const verbose = rows.map((row) => ({
    figmaId: row.figmaId,
    name: row.name,
    figmaType: row.figmaType,
    type: row.type,
    absRect: row.absRect,
    relCenter: row.relCenter,
    areaRatio: row.areaRatio,
    ...(row.text ? { text: row.text } : {}),
    ...(row.isUserGroup ? { isUserGroup: true } : {}),
    ...(row.lockedInUserGroupId ? { lockedInUserGroupId: row.lockedInUserGroupId } : {}),
  }));
  return pretty ? JSON.stringify(verbose, null, 2) : JSON.stringify(verbose);
}

export function agentNodeLegend(forceVerbose = false): string {
  if (forceVerbose || !useCompactAgentNodes()) return AGENT_NODE_LEGEND_VERBOSE;
  return AGENT_NODE_LEGEND_COMPACT;
}

/** 截斷使用者 .md，保留開頭與結尾以利讀到表格／清單 */
export function truncateCustomGuideMarkdown(markdown: string, maxChars = customGuideMaxChars()): string {
  const body = markdown.trim();
  if (body.length <= maxChars) return body;
  const head = Math.floor(maxChars * 0.65);
  const tail = maxChars - head - 48;
  return (
    `${body.slice(0, head)}\n\n…[中間省略 ${body.length - head - tail} 字，完整規則已截斷以節省 token]…\n\n${body.slice(-tail)}`
  );
}

/** 粗估 token（約 4 字元 / token） */
export function estimatePromptTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
