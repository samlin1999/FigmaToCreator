/**
 * 離線幾何整理：依 Y 列 / X 間距分區 + Widget 锚点 + 語意命名（不需 AI / 示意圖）
 */
import type {
  AgentNodeHint,
  AgentOrganizePlan,
  AgentVirtualContainer,
  IRDocumentLike,
  IRNodeLike,
  IRRect,
  WidgetHint,
} from '../../../shared/agent-plan-types';
import {
  collectOrganizeUnits,
  type OrganizeUnit,
} from '../../../shared/figma-group-preserve';
import {
  enforceButtonNamesInPlan,
  fillMissingHintNames,
  inferGenericNamePrefix,
  mergeNameWithOriginalTokens,
} from './infer-node-names';
import { sanitizeNodeName } from './normalize-plan';

function ratio(v: number, total: number): number {
  return total > 0 ? v / total : 0;
}

function centerOf(node: IRNodeLike) {
  return {
    x: node.absRect.x + node.absRect.width / 2,
    y: node.absRect.y + node.absRect.height / 2,
  };
}

function areaRatio(node: IRNodeLike, page: IRNodeLike): number {
  const pageArea = page.absRect.width * page.absRect.height;
  if (pageArea <= 0) return 0;
  return (node.absRect.width * node.absRect.height) / pageArea;
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

function byPaintThenY(a: IRNodeLike, b: IRNodeLike): number {
  const pa = a.paintOrder ?? 0;
  const pb = b.paintOrder ?? 0;
  if (pa !== pb) return pa - pb;
  const dy = a.absRect.y - b.absRect.y;
  if (dy !== 0) return dy;
  return a.absRect.x - b.absRect.x;
}

function inferWidget(node: IRNodeLike, page: IRNodeLike): WidgetHint {
  const pageAbs = page.absRect;
  const c = centerOf(node);
  const relX = ratio(c.x - pageAbs.x, pageAbs.width);
  const relY = ratio(c.y - pageAbs.y, pageAbs.height);
  const widthRatio = ratio(node.absRect.width, pageAbs.width);
  const heightRatio = ratio(node.absRect.height, pageAbs.height);

  if (areaRatio(node, page) > 0.55) {
    return { top: 0, bottom: 0, left: 0, right: 0, stretchWidth: true, stretchHeight: true };
  }

  const widget: WidgetHint = {};
  if (relY < 0.25) widget.top = Math.max(0, ratio(node.absRect.y - pageAbs.y, pageAbs.height));
  if (relY > 0.75) {
    widget.bottom = Math.max(
      0,
      ratio(pageAbs.y + pageAbs.height - (node.absRect.y + node.absRect.height), pageAbs.height),
    );
  }

  if (widthRatio > 0.85) {
    widget.left = Math.max(0, ratio(node.absRect.x - pageAbs.x, pageAbs.width));
    widget.right = Math.max(
      0,
      ratio(pageAbs.x + pageAbs.width - (node.absRect.x + node.absRect.width), pageAbs.width),
    );
    widget.stretchWidth = true;
  } else if (Math.abs(relX - 0.5) < 0.08) {
    widget.horizontalCenter = 0;
  } else if (relX < 0.35) {
    widget.left = Math.max(0, ratio(node.absRect.x - pageAbs.x, pageAbs.width));
  } else if (relX > 0.65) {
    widget.right = Math.max(
      0,
      ratio(pageAbs.x + pageAbs.width - (node.absRect.x + node.absRect.width), pageAbs.width),
    );
  }

  if (heightRatio > 0.7) widget.stretchHeight = true;
  return widget;
}

function zonePositionSlug(rect: IRRect, page: IRNodeLike): string {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const relX = ratio(cx - page.absRect.x, page.absRect.width);
  const relY = ratio(cy - page.absRect.y, page.absRect.height);
  if (relY < 0.33) {
    if (relX < 0.33) return 'top_left';
    if (relX > 0.66) return 'top_right';
    return 'top';
  }
  if (relY > 0.66) {
    if (relX < 0.33) return 'bottom_left';
    if (relX > 0.66) return 'bottom_right';
    return 'bottom';
  }
  if (relX < 0.33) return 'mid_left';
  if (relX > 0.66) return 'mid_right';
  return 'mid';
}

function groupIntoRows(units: OrganizeUnit[], page: IRNodeLike): OrganizeUnit[][] {
  const rowThreshold = Math.max(20, page.absRect.height * 0.045);
  const sorted = [...units].sort((a, b) => {
    const dy = a.node.absRect.y - b.node.absRect.y;
    if (dy !== 0) return dy;
    return a.node.absRect.x - b.node.absRect.x;
  });
  const rows: OrganizeUnit[][] = [];
  for (const unit of sorted) {
    const cy = centerOf(unit.node).y;
    let row = rows.find((r) => Math.abs(centerOf(r[0].node).y - cy) < rowThreshold);
    if (!row) {
      row = [];
      rows.push(row);
    }
    row.push(unit);
  }
  return rows;
}

function splitRowByXGaps(row: OrganizeUnit[], page: IRNodeLike): OrganizeUnit[][] {
  if (row.length <= 1) return [row];
  const sorted = [...row].sort((a, b) => a.node.absRect.x - b.node.absRect.x);
  const gapThreshold = Math.max(28, page.absRect.width * 0.07);
  const groups: OrganizeUnit[][] = [[sorted[0]]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1].node;
    const cur = sorted[i].node;
    const gap = cur.absRect.x - (prev.absRect.x + prev.absRect.width);
    if (gap > gapThreshold) groups.push([sorted[i]]);
    else groups[groups.length - 1].push(sorted[i]);
  }
  return groups;
}

interface GeometryZone {
  name: string;
  units: OrganizeUnit[];
}

function buildGeometryZones(units: OrganizeUnit[], page: IRNodeLike): GeometryZone[] {
  const positionCounters = new Map<string, number>();
  const zones: GeometryZone[] = [];

  for (const row of groupIntoRows(units, page)) {
    for (const group of splitRowByXGaps(row, page)) {
      const bounds = unionAbsRect(group.map((u) => u.node.absRect));
      const slug = zonePositionSlug(bounds, page);
      const seq = (positionCounters.get(slug) ?? 0) + 1;
      positionCounters.set(slug, seq);
      zones.push({
        name: `zone_${slug}_${String(seq).padStart(2, '0')}`,
        units: group,
      });
    }
  }
  return zones;
}

function roleFromZoneName(name: string): AgentVirtualContainer['containerRole'] {
  const n = name.toLowerCase();
  if (n.includes('bg') || n.includes('background')) return 'background';
  if (n.includes('top')) return 'header';
  if (n.includes('bottom')) return 'footer';
  if (n.includes('btn')) return 'custom';
  return 'content';
}

function unitOrganizeHint(units: OrganizeUnit[]): string {
  const leafCount = units.reduce((n, u) => n + u.leaves.length, 0);
  const groupCount = units.filter((u) => u.isUserGroup).length;
  if (groupCount) return `位置分區（${leafCount} 個節點，含 ${groupCount} 個 Figma Group）`;
  return `位置分區（${leafCount} 個節點）`;
}

/** 離線幾何整理計畫 */
export function buildGeometryHeuristicPlan(ir: IRDocumentLike): AgentOrganizePlan {
  const page = ir.root;
  const allUnits = collectOrganizeUnits(page);
  const allLeaves = allUnits.flatMap((u) => u.leaves);
  const backgrounds: OrganizeUnit[] = [];
  const contentUnits: OrganizeUnit[] = [];
  for (const unit of allUnits) {
    if (areaRatio(unit.node, page) > 0.42) backgrounds.push(unit);
    else contentUnits.push(unit);
  }

  const zones = buildGeometryZones(contentUnits, page);
  const nodeHints: Record<string, AgentNodeHint> = {};
  const virtualContainers: AgentVirtualContainer[] = [];
  const virtualRootChildren: string[] = [];
  const nameCounters = new Map<string, number>();

  const assignLeafHints = (leaf: IRNodeLike, path: string) => {
    const prefix = inferGenericNamePrefix(leaf, page);
    const seq = (nameCounters.get(prefix) ?? 0) + 1;
    nameCounters.set(prefix, seq);
    const generated = sanitizeNodeName(`${prefix}_${String(seq).padStart(2, '0')}`);
    const name = mergeNameWithOriginalTokens(leaf.name, generated);
    let containerRole: AgentNodeHint['containerRole'] = 'content';
    if (backgrounds.some((u) => u.leaves.includes(leaf))) containerRole = 'background';
    else if (path.includes('top')) containerRole = 'header';
    else if (path.includes('bottom')) containerRole = 'footer';

    nodeHints[leaf.figmaId] = {
      figmaId: leaf.figmaId,
      name,
      containerRole,
      widget: inferWidget(leaf, page),
      layout: { mode: 'none' },
      organizeHint: `離線整理：${path}`,
    };
  };

  if (backgrounds.length) {
    backgrounds.sort((a, b) => byPaintThenY(a.node, b.node));
    for (const unit of backgrounds) {
      for (const leaf of unit.leaves) assignLeafHints(leaf, 'page_bg');
    }
    virtualContainers.push({
      id: 'vc_page_bg',
      name: 'page_bg',
      containerRole: 'background',
      layout: { mode: 'absolute' },
      children: backgrounds.map((u) => u.node.figmaId),
      organizeHint: '全頁背景（面積 > 42%）',
    });
    virtualRootChildren.push('vc_page_bg');
  }

  const zoneVcIds: string[] = [];
  let zoneSeq = 0;
  for (const zone of zones) {
    zone.units.sort((a, b) => byPaintThenY(a.node, b.node));
    const path = zone.name;
    for (const unit of zone.units) {
      for (const leaf of unit.leaves) assignLeafHints(leaf, path);
    }
    const vcId = `vc_zone_${zoneSeq++}`;
    zoneVcIds.push(vcId);
    virtualContainers.push({
      id: vcId,
      name: zone.name,
      containerRole: roleFromZoneName(zone.name),
      layout: { mode: 'absolute' },
      children: zone.units.map((u) => u.node.figmaId),
      organizeHint: unitOrganizeHint(zone.units),
    });
  }

  if (zoneVcIds.length) {
    virtualContainers.push({
      id: 'vc_content',
      name: 'content_root',
      containerRole: 'content',
      layout: { mode: 'absolute' },
      // back-first for Figma preview append
      children: [...zoneVcIds].reverse(),
      organizeHint: '主內容：依位置自動分區',
    });
    virtualRootChildren.push('vc_content');
  } else if (contentUnits.length) {
    contentUnits.sort((a, b) => byPaintThenY(a.node, b.node));
    for (const unit of contentUnits) {
      for (const leaf of unit.leaves) assignLeafHints(leaf, 'content_root');
    }
    virtualContainers.push({
      id: 'vc_content',
      name: 'content_root',
      containerRole: 'content',
      layout: { mode: 'absolute' },
      children: contentUnits.map((u) => u.node.figmaId),
      organizeHint: '主內容（未分區）',
    });
    virtualRootChildren.push('vc_content');
  }

  const leafMap = new Map<string, IRNodeLike>();
  for (const leaf of allLeaves) leafMap.set(leaf.figmaId, leaf);
  fillMissingHintNames(nodeHints, ir);
  enforceButtonNamesInPlan(nodeHints, leafMap, virtualContainers);

  return {
    version: '1.0',
    organizer: 'heuristic-agent',
    preserveVisual: true,
    summary: `離線幾何整理：${zones.length} 個位置分區、${backgrounds.length} 個背景、Widget 锚点與語意命名`,
    nodeHints,
    virtualRoot: { children: virtualRootChildren },
    virtualContainers,
  };
}
