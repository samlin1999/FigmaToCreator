import type {
  AgentOrganizePlan,
  AgentVirtualContainer,
  IRDocumentLike,
  LayoutHint,
} from '../../../shared/agent-plan-types';
import { enforceGroupPreservationInPlan } from '../../../shared/figma-group-preserve';
import {
  collectIncludedLeaves,
  enforceButtonNamesInPlan,
  fillMissingHintNames,
  mergeNameWithOriginalTokens,
} from './infer-node-names';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Cocos / 檔名安全：空白→底線、移除非法字元 */
export function sanitizeNodeName(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return trimmed
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function unwrapPlan(raw: unknown): Record<string, unknown> {
  if (!isRecord(raw)) {
    throw new Error('AI 回傳不是 JSON 物件');
  }
  const keys = ['AgentOrganizePlan', 'agentOrganizePlan', 'plan', 'result', 'data'];
  for (const key of keys) {
    if (isRecord(raw[key])) return raw[key];
  }
  return raw;
}

function indexFigmaIds(root: IRDocumentLike['root']): Set<string> {
  const ids = new Set<string>();
  function walk(n: IRDocumentLike['root']): void {
    if (n.figmaType !== 'VIRTUAL' && !n.figmaId.startsWith('vc_')) {
      ids.add(n.figmaId);
    }
    for (const c of n.children) walk(c);
  }
  walk(root);
  return ids;
}

/** 修正 AI 常見格式問題，並剔除無效 figmaId 引用 */
export function normalizeAgentPlan(raw: unknown, ir: IRDocumentLike): AgentOrganizePlan {
  const src = unwrapPlan(raw);
  const validIds = indexFigmaIds(ir.root);
  const vcIds = new Set<string>();

  const virtualContainers: AgentVirtualContainer[] = Array.isArray(src.virtualContainers)
    ? src.virtualContainers.filter(isRecord).map((vc) => {
        const id = String(vc.id ?? '');
        vcIds.add(id);
        const children = Array.isArray(vc.children)
          ? vc.children.map(String).filter((cid) => validIds.has(cid) || cid.startsWith('vc_'))
          : [];
        const vcName = sanitizeNodeName(String(vc.name ?? id)) || id;
        return {
          id,
          name: vcName,
          containerRole:
            (vc.containerRole as AgentVirtualContainer['containerRole']) ?? 'custom',
          layout: isRecord(vc.layout)
            ? { mode: (vc.layout.mode as LayoutHint['mode']) ?? 'absolute' }
            : { mode: 'absolute' as const },
          children,
          organizeHint: typeof vc.organizeHint === 'string' ? vc.organizeHint : undefined,
        };
      })
    : [];

  for (const vc of virtualContainers) {
    vc.children = vc.children.filter((cid) => validIds.has(cid) || vcIds.has(cid));
  }

  const originalLeafNames = new Map<string, string>();
  for (const leaf of collectIncludedLeaves(ir.root)) {
    originalLeafNames.set(leaf.figmaId, leaf.name);
  }

  const nodeHints: AgentOrganizePlan['nodeHints'] = {};
  if (isRecord(src.nodeHints)) {
    for (const [figmaId, hintRaw] of Object.entries(src.nodeHints)) {
      if (!validIds.has(figmaId)) continue;
      if (!isRecord(hintRaw)) continue;
      const nameRaw = typeof hintRaw.name === 'string' ? sanitizeNodeName(hintRaw.name) : '';
      const mergedName = nameRaw
        ? mergeNameWithOriginalTokens(originalLeafNames.get(figmaId) ?? '', nameRaw)
        : '';
      nodeHints[figmaId] = {
        figmaId,
        ...(mergedName ? { name: mergedName } : {}),
        containerRole: hintRaw.containerRole as AgentOrganizePlan['nodeHints'][string]['containerRole'],
        widget: isRecord(hintRaw.widget) ? (hintRaw.widget as AgentOrganizePlan['nodeHints'][string]['widget']) : undefined,
        layout: isRecord(hintRaw.layout)
          ? { mode: (hintRaw.layout.mode as 'none') ?? 'none' }
          : undefined,
        organizeHint: typeof hintRaw.organizeHint === 'string' ? hintRaw.organizeHint : undefined,
        type: typeof hintRaw.type === 'string' ? hintRaw.type : undefined,
      };
    }
  }

  const virtualRootChildren = isRecord(src.virtualRoot) && Array.isArray(src.virtualRoot.children)
    ? src.virtualRoot.children.map(String).filter((id) => vcIds.has(id) || validIds.has(id))
    : virtualContainers.map((v) => v.id);

  fillMissingHintNames(nodeHints, ir);
  const leafMap = new Map<string, IRDocumentLike['root']>();
  for (const leaf of collectIncludedLeaves(ir.root)) {
    leafMap.set(leaf.figmaId, leaf);
  }
  enforceButtonNamesInPlan(nodeHints, leafMap, virtualContainers);

  const plan: AgentOrganizePlan = {
    version: '1.0',
    organizer: src.organizer === 'heuristic-agent'
      ? 'heuristic-agent'
      : src.organizer === 'cursor-agent'
        ? 'cursor-agent'
        : 'ai-agent',
    preserveVisual: true,
    summary: typeof src.summary === 'string' ? src.summary : 'AI Agent 整理',
    nodeHints,
    virtualRoot: { children: virtualRootChildren },
    virtualContainers,
  };

  if (!plan.virtualContainers?.length || !plan.virtualRoot?.children?.length) {
    throw new Error(
      'AI 回傳缺少 virtualContainers / virtualRoot。請重跑 Cursor Agent，或改用 --heuristic。',
    );
  }

  return enforceGroupPreservationInPlan(plan, ir.root);
}

export function isOrganizedIR(ir: IRDocumentLike): boolean {
  if (ir.organizedBy) return true;
  return (ir.root.children ?? []).some(
    (c) => c.figmaType === 'VIRTUAL' || c.figmaId.startsWith('vc_'),
  );
}
