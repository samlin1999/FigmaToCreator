import type { IRDocumentLike, IRNodeLike, IRRect } from './agent-plan-types';
import { isFigmaUserGroup } from './figma-group-preserve';

export type OrganizeValidationSeverity = 'error' | 'warn' | 'info';

export interface OrganizeValidationIssue {
  code: string;
  severity: OrganizeValidationSeverity;
  message: string;
  figmaId?: string;
}

export interface OrganizeValidationReport {
  /** 無 error 級別問題 */
  ok: boolean;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  issues: OrganizeValidationIssue[];
}

export interface ValidateOrganizedIROptions {
  /** 整理前的 IR；有值時可比對 absRect / leaf 覆蓋 */
  sourceIr?: IRDocumentLike;
  /** 按鈕群組虛擬容器最小邊長（預設 60） */
  buttonGroupMinSize?: number;
  /** 示意圖整理：虛擬容器過少時提示 */
  referenceOrganize?: boolean;
}

const DEFAULT_BUTTON_GROUP_MIN = 60;
const ABS_RECT_EPSILON = 0.51;
const BTN_IN_NAME = /\bbtn\b|_btn_|^btn_/i;

const DEFAULT_FIGMA_NAME =
  /^(rectangle|frame|group|ellipse|vector|text|image|component|instance|section)\s*\d*$/i;

function isVirtualNode(node: IRNodeLike): boolean {
  return node.figmaType === 'VIRTUAL' || node.figmaId.startsWith('vc_');
}

function isIncludedLeaf(node: IRNodeLike): boolean {
  if (node.included === false) return false;
  if (isVirtualNode(node)) return false;
  return !(node.children?.length);
}

export function collectIncludedLeaves(root: IRNodeLike): IRNodeLike[] {
  const out: IRNodeLike[] = [];
  const walk = (n: IRNodeLike): void => {
    if (n.included === false) return;
    if (isIncludedLeaf(n)) out.push(n);
    for (const c of n.children ?? []) walk(c);
  };
  for (const c of root.children ?? []) walk(c);
  return out;
}

function indexLeavesById(root: IRNodeLike): Map<string, IRNodeLike> {
  const map = new Map<string, IRNodeLike>();
  for (const leaf of collectIncludedLeaves(root)) {
    map.set(leaf.figmaId, leaf);
  }
  return map;
}

function collectAllFigmaIds(root: IRNodeLike): string[] {
  const ids: string[] = [];
  const walk = (n: IRNodeLike): void => {
    if (n.figmaId) ids.push(n.figmaId);
    for (const c of n.children ?? []) walk(c);
  };
  walk(root);
  return ids;
}

function rectDrift(a: IRRect, b: IRRect): number {
  return Math.max(
    Math.abs(a.x - b.x),
    Math.abs(a.y - b.y),
    Math.abs(a.width - b.width),
    Math.abs(a.height - b.height),
  );
}

function isDefaultFigmaName(name: string): boolean {
  return DEFAULT_FIGMA_NAME.test(name.trim());
}

function isButtonGroupVirtual(node: IRNodeLike): boolean {
  if (!isVirtualNode(node)) return false;
  const name = node.name ?? '';
  if (/btn_.*_(item|group)\b/i.test(name) || /\bbtn\b.*\b(item|group)\b/i.test(name)) {
    return true;
  }
  if (BTN_IN_NAME.test(name) && (node.children?.length ?? 0) >= 2) return true;
  if (BTN_IN_NAME.test(name) && /item|group/i.test(name)) return true;
  return false;
}

/** 葉節點 → 路徑上最內層虛擬容器 id */
function leafToInnerVirtualId(root: IRNodeLike): Map<string, string> {
  const map = new Map<string, string>();
  const walk = (n: IRNodeLike, innerVc: string | null): void => {
    const vc = isVirtualNode(n) ? n.figmaId : innerVc;
    if (isIncludedLeaf(n) && vc) map.set(n.figmaId, vc);
    for (const c of n.children ?? []) walk(c, vc);
  };
  for (const c of root.children ?? []) walk(c, null);
  return map;
}

function pushIssue(
  issues: OrganizeValidationIssue[],
  issue: OrganizeValidationIssue,
): void {
  issues.push(issue);
}

function summarize(report: OrganizeValidationReport): OrganizeValidationReport {
  report.errorCount = report.issues.filter((i) => i.severity === 'error').length;
  report.warnCount = report.issues.filter((i) => i.severity === 'warn').length;
  report.infoCount = report.issues.filter((i) => i.severity === 'info').length;
  report.ok = report.errorCount === 0;
  return report;
}

/**
 * 整理後驗證 organized IR（可選與 source IR 比對）。
 */
export function validateOrganizedIR(
  organized: IRDocumentLike,
  options: ValidateOrganizedIROptions = {},
): OrganizeValidationReport {
  const issues: OrganizeValidationIssue[] = [];
  const minBtn = options.buttonGroupMinSize ?? DEFAULT_BUTTON_GROUP_MIN;

  const allIds = collectAllFigmaIds(organized.root);
  const seen = new Set<string>();
  for (const id of allIds) {
    if (seen.has(id)) {
      pushIssue(issues, {
        code: 'DUPLICATE_FIGMA_ID',
        severity: 'error',
        message: `figmaId 重複出現：${id}`,
        figmaId: id,
      });
    }
    seen.add(id);
  }

  const orgLeaves = indexLeavesById(organized.root);
  const sourceLeaves = options.sourceIr ? indexLeavesById(options.sourceIr.root) : null;

  if (sourceLeaves) {
    for (const [figmaId, src] of sourceLeaves) {
      const out = orgLeaves.get(figmaId);
      if (!out) {
        pushIssue(issues, {
          code: 'MISSING_LEAF',
          severity: 'error',
          message: `整理後缺少 included 葉節點：${src.name}（${figmaId}）`,
          figmaId,
        });
        continue;
      }
      const drift = rectDrift(src.absRect, out.absRect);
      if (drift > ABS_RECT_EPSILON) {
        pushIssue(issues, {
          code: 'ABS_RECT_DRIFT',
          severity: 'error',
          message: `absRect 偏移 ${drift.toFixed(2)}px：${src.name}（${figmaId}）`,
          figmaId,
        });
      }
    }

    for (const [figmaId, out] of orgLeaves) {
      if (!sourceLeaves.has(figmaId)) {
        pushIssue(issues, {
          code: 'EXTRA_LEAF',
          severity: 'warn',
          message: `整理後出現 source 沒有的葉節點：${out.name}（${figmaId}）`,
          figmaId,
        });
      }
    }
  }

  for (const leaf of orgLeaves.values()) {
    const hasText = Boolean(leaf.text?.length) || leaf.figmaType === 'TEXT';
    if (hasText && leaf.type !== 'label') {
      pushIssue(issues, {
        code: 'TEXT_NOT_LABEL',
        severity: 'warn',
        message: `文字節點 type=${leaf.type}（應為 label，否則 Prefab 可能不顯示文字）：${leaf.name}`,
        figmaId: leaf.figmaId,
      });
    }
    if (leaf.included !== false && isDefaultFigmaName(leaf.name)) {
      pushIssue(issues, {
        code: 'DEFAULT_FIGMA_NAME',
        severity: 'warn',
        message: `葉節點仍為 Figma 預設名稱，建議語意命名：${leaf.name}`,
        figmaId: leaf.figmaId,
      });
    }
  }

  const walkVirtual = (n: IRNodeLike): void => {
    if (isButtonGroupVirtual(n)) {
      const w = n.absRect.width;
      const h = n.absRect.height;
      if (w < minBtn || h < minBtn) {
        pushIssue(issues, {
          code: 'BUTTON_GROUP_TOO_SMALL',
          severity: 'warn',
          message: `按鈕群組容器 ${n.name} 為 ${w.toFixed(0)}×${h.toFixed(0)}，小於最小 ${minBtn}×${minBtn}`,
          figmaId: n.figmaId,
        });
      }
    }
    for (const c of n.children ?? []) walkVirtual(c);
  };
  walkVirtual(organized.root);

  if (options.sourceIr) {
    const leafVc = leafToInnerVirtualId(organized.root);
    const groupLeaves = new Map<string, string[]>();

    const collectGroups = (n: IRNodeLike, activeGroupId: string | null): void => {
      const gid = isFigmaUserGroup(n) ? n.figmaId : activeGroupId;
      if (isIncludedLeaf(n) && gid) {
        const list = groupLeaves.get(gid) ?? [];
        list.push(n.figmaId);
        groupLeaves.set(gid, list);
      }
      for (const c of n.children ?? []) collectGroups(c, gid);
    };
    for (const c of options.sourceIr.root.children ?? []) collectGroups(c, null);

    for (const [groupId, leafIds] of groupLeaves) {
      if (leafIds.length < 2) continue;
      const zones = new Set<string>();
      for (const lid of leafIds) {
        const z = leafVc.get(lid);
        if (z) zones.add(z);
      }
      if (zones.size > 1) {
        const groupNode = findNodeById(options.sourceIr.root, groupId);
        pushIssue(issues, {
          code: 'USER_GROUP_SPLIT',
          severity: 'warn',
          message: `Figma Group「${groupNode?.name ?? groupId}」的成員被分到 ${zones.size} 個虛擬容器，可能違反不可拆散規則`,
          figmaId: groupId,
        });
      }
    }
  }

  if (options.referenceOrganize) {
    let virtualCount = 0;
    const countVc = (n: IRNodeLike): void => {
      if (isVirtualNode(n)) virtualCount += 1;
      for (const c of n.children ?? []) countVc(c);
    };
    countVc(organized.root);
    if (virtualCount < 2) {
      pushIssue(issues, {
        code: 'FEW_VIRTUAL_CONTAINERS',
        severity: 'info',
        message: `示意圖整理僅產生 ${virtualCount} 個虛擬容器，若附圖有多個圈選區請檢查分組是否完整`,
      });
    }
  }

  return summarize({
    ok: true,
    errorCount: 0,
    warnCount: 0,
    infoCount: 0,
    issues,
  });
}

function findNodeById(root: IRNodeLike, figmaId: string): IRNodeLike | undefined {
  if (root.figmaId === figmaId) return root;
  for (const c of root.children ?? []) {
    const found = findNodeById(c, figmaId);
    if (found) return found;
  }
  return undefined;
}

/** 供 Plugin UI 顯示 */
export function formatValidationReportForUi(report: OrganizeValidationReport): string {
  if (!report.issues.length) {
    return '【整理驗證】通過，未發現問題。';
  }
  const lines = [
    `【整理驗證】${report.errorCount} 錯誤、${report.warnCount} 警告、${report.infoCount} 提示`,
  ];
  const maxShow = 12;
  for (let i = 0; i < Math.min(report.issues.length, maxShow); i++) {
    const issue = report.issues[i];
    const tag =
      issue.severity === 'error' ? '錯誤' : issue.severity === 'warn' ? '警告' : '提示';
    lines.push(`• [${tag}] ${issue.message}`);
  }
  if (report.issues.length > maxShow) {
    lines.push(`• …另有 ${report.issues.length - maxShow} 項（見 bridge 日誌或 IR）`);
  }
  return lines.join('\n');
}
