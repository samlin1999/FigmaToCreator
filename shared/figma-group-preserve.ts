import type { AgentOrganizePlan, IRNodeLike } from './agent-plan-types';

/** Figma 使用者手動 Group（Ctrl+G） */
export function isFigmaUserGroup(node: IRNodeLike): boolean {
  return node.figmaType === 'GROUP' || node.type === 'group';
}

export function collectIncludedLeavesUnder(node: IRNodeLike): IRNodeLike[] {
  const out: IRNodeLike[] = [];
  const walk = (n: IRNodeLike): void => {
    if (n.included === false) return;
    const isVirtual = n.figmaType === 'VIRTUAL' || n.figmaId.startsWith('vc_');
    if (!isVirtual && !(n.children?.length)) out.push(n);
    for (const c of n.children ?? []) walk(c);
  };
  walk(node);
  return out;
}

export interface OrganizeUnit {
  /** 整理時的最小單位：葉節點或整個 Group 子樹 */
  node: IRNodeLike;
  leaves: IRNodeLike[];
  isUserGroup: boolean;
}

/**
 * 將 Page 下節點拆成整理單位：Figma Group 整組不可拆散。
 */
export function collectOrganizeUnits(root: IRNodeLike): OrganizeUnit[] {
  const units: OrganizeUnit[] = [];

  const walk = (n: IRNodeLike): void => {
    if (n.included === false) return;
    if (isFigmaUserGroup(n)) {
      const leaves = collectIncludedLeavesUnder(n);
      if (leaves.length) units.push({ node: n, leaves, isUserGroup: true });
      return;
    }
    if (!(n.children?.length)) {
      units.push({ node: n, leaves: [n], isUserGroup: false });
      return;
    }
    for (const c of n.children) walk(c);
  };

  for (const c of root.children ?? []) walk(c);
  return units;
}

/** 葉節點 figmaId → 所屬最近一層 User Group 的 figmaId */
export function leafToUserGroupMap(root: IRNodeLike): Map<string, string> {
  const map = new Map<string, string>();
  const walk = (n: IRNodeLike, groupId: string | null): void => {
    const gid = isFigmaUserGroup(n) ? n.figmaId : groupId;
    if (gid && n.included !== false) {
      const isVirtual = n.figmaType === 'VIRTUAL' || n.figmaId.startsWith('vc_');
      if (!isVirtual && !(n.children?.length)) map.set(n.figmaId, gid);
    }
    for (const c of n.children ?? []) walk(c, gid);
  };
  for (const c of root.children ?? []) walk(c, null);
  return map;
}

function rewriteChildIds(children: string[], leafToGroup: Map<string, string>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const childId of children) {
    const id = leafToGroup.get(childId) ?? childId;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/**
 * 修正 plan：Group 內葉節點不可被拆到不同容器；改引用 Group 節點 id。
 */
export function enforceGroupPreservationInPlan(
  plan: AgentOrganizePlan,
  ir: IRNodeLike,
): AgentOrganizePlan {
  const leafToGroup = leafToUserGroupMap(ir);
  if (!leafToGroup.size) return plan;

  const groupIds = new Set(leafToGroup.values());
  const virtualContainers = (plan.virtualContainers ?? []).map((vc) => ({
    ...vc,
    children: rewriteChildIds(vc.children, leafToGroup),
  }));

  const groupOwner = new Map<string, string>();
  for (const vc of virtualContainers) {
    for (const childId of vc.children) {
      if (groupIds.has(childId) && !groupOwner.has(childId)) {
        groupOwner.set(childId, vc.id);
      }
    }
  }

  for (const vc of virtualContainers) {
    vc.children = vc.children.filter((id) => !groupIds.has(id) || groupOwner.get(id) === vc.id);
  }

  const virtualRoot = plan.virtualRoot
    ? {
        ...plan.virtualRoot,
        children: rewriteChildIds(plan.virtualRoot.children ?? [], leafToGroup),
      }
    : plan.virtualRoot;

  return {
    ...plan,
    virtualRoot,
    virtualContainers,
    summary: plan.summary?.includes('Group')
      ? plan.summary
      : `${plan.summary ?? ''}（保留 Figma Group 結構）`.trim(),
  };
}
