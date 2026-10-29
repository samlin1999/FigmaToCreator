/// <reference types="@figma/plugin-typings" />

import {
  applyAgentPlan,
  buildHeuristicPlan,
  BUTTON_GROUP_MIN_SIZE,
  formatValidationReportForUi,
  validateOrganizedIR,
} from './agent';
import type { OrganizeValidationReport } from '../../../shared/organize-validation';
import {
  clampOrganizeTimeoutMin,
  organizeTimeoutMsFromMin,
  ORGANIZE_TIMEOUT_STORAGE_KEY,
} from '../../../shared/organize-timeouts';
import {
  applyOrganizedPreview,
  clearOrganizedPreview,
  getPreviewSessionCount,
  hasActivePreview,
} from './figma-preview';
import { buildIRPageDocument } from './parser';
import {
  formatGuideOverridesSummary,
  parseCustomGuideOverrides,
} from '../../../shared/custom-guide-overrides';
import type { IRVisibilityNode } from '../../../shared/ir-visibility';

type SceneNodeLike = SceneNode & {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  visible?: boolean;
  characters?: string;
  fontSize?: number;
  fills?: readonly Paint[];
};

/** Figma API children 為底→頂；Layers 面板為頂→底，需反轉以一致 */
function isFtcNodeName(name: string | undefined): boolean {
  if (!name) return false;
  const normalized = name.trim();
  return normalized.startsWith('[FTC]') || normalized.includes('[FTC]');
}

function childrenInLayerPanelOrder(node: SceneNodeLike): SceneNodeLike[] {
  if (!('children' in node) || !Array.isArray(node.children)) return [];
  return [...node.children].reverse() as SceneNodeLike[];
}

function parseRootsFromPageChildren(children: readonly SceneNode[]): SceneNodeLike[] {
  return [...children] as SceneNodeLike[];
}

/** 採集 Figma 原始繪製順序（越小越底層），供 Cocos 與預覽還原 z-order */
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

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function extractTextColor(node: TextNode): string | undefined {
  const fill = node.fills;
  if (!Array.isArray(fill) || fill.length === 0) return undefined;
  const solid = fill.find((f) => f.type === 'SOLID' && f.visible !== false) as SolidPaint | undefined;
  if (!solid?.color) return undefined;
  return rgbToHex(solid.color.r, solid.color.g, solid.color.b);
}

function getAbsoluteRect(node: SceneNodeLike): { x: number; y: number; width: number; height: number } {
  const sx =
    'absoluteTransform' in node && Array.isArray(node.absoluteTransform)
      ? node.absoluteTransform[0]?.[0]
      : undefined;
  const sy =
    'absoluteTransform' in node && Array.isArray(node.absoluteTransform)
      ? node.absoluteTransform[1]?.[1]
      : undefined;
  const tx =
    'absoluteTransform' in node && Array.isArray(node.absoluteTransform)
      ? node.absoluteTransform[0]?.[2]
      : undefined;
  const ty =
    'absoluteTransform' in node && Array.isArray(node.absoluteTransform)
      ? node.absoluteTransform[1]?.[2]
      : undefined;
  const width = typeof node.width === 'number' ? node.width : undefined;
  const height = typeof node.height === 'number' ? node.height : undefined;
  const bbox = 'absoluteBoundingBox' in node ? node.absoluteBoundingBox : undefined;

  if (bbox && Number.isFinite(width) && Number.isFinite(height)) {
    let x = bbox.x;
    let y = bbox.y;
    // 某些鏡像節點在 runtime 會把 x/y 回報為右/下邊界；若偵測到此型態，回推左上角。
    if (Number.isFinite(tx) && Number.isFinite(sx) && (sx as number) < 0) {
      const correctedX = (tx as number) - (width as number);
      if (Math.abs(bbox.x - (tx as number)) < 0.5) x = correctedX;
    }
    if (Number.isFinite(ty) && Number.isFinite(sy) && (sy as number) < 0) {
      const correctedY = (ty as number) - (height as number);
      if (Math.abs(bbox.y - (ty as number)) < 0.5) y = correctedY;
    }
    return { x, y, width: bbox.width, height: bbox.height };
  }

  if (
    Number.isFinite(tx) &&
    Number.isFinite(ty) &&
    Number.isFinite(width) &&
    Number.isFinite(height)
  ) {
    const x = Number.isFinite(sx) && (sx as number) < 0 ? (tx as number) - (width as number) : (tx as number);
    const y = Number.isFinite(sy) && (sy as number) < 0 ? (ty as number) - (height as number) : (ty as number);
    return { x, y, width: width as number, height: height as number };
  }

  return { x: node.x ?? 0, y: node.y ?? 0, width: node.width ?? 0, height: node.height ?? 0 };
}

/** 只匯出葉節點貼圖，容器節點不匯出（避免卡住或重複） */
function isExportable(node: SceneNode): boolean {
  if (node.type === 'TEXT') return false;
  if ('children' in node && node.children.length > 0) return false;
  return (
    node.type === 'RECTANGLE' ||
    node.type === 'ELLIPSE' ||
    node.type === 'VECTOR' ||
    node.type === 'STAR' ||
    node.type === 'LINE' ||
    node.type === 'POLYGON' ||
    node.type === 'BOOLEAN_OPERATION'
  );
}

function parseNode(node: SceneNodeLike, paintOrderMap: Map<string, number>): object {
  const absBounds = getAbsoluteRect(node);

  const base = {
    id: node.id,
    name: node.name,
    figmaType: node.type,
    x: absBounds.x,
    y: absBounds.y,
    width: absBounds.width,
    height: absBounds.height,
    visible: node.visible !== false,
    exportable: isExportable(node as SceneNode),
    paintOrder: paintOrderMap.get(node.id),
    children: [] as object[],
  };

  if (node.type === 'TEXT') {
    const textNode = node as TextNode;
    return {
      ...base,
      text: textNode.characters,
      fontSize: typeof textNode.fontSize === 'number' ? textNode.fontSize : 24,
      textColor: extractTextColor(textNode),
      exportable: false,
      children: [],
    };
  }

  base.children = childrenInLayerPanelOrder(node).map((c) => parseNode(c, paintOrderMap));
  return base;
}

async function listPages() {
  const pages = figma.root.children.map((page) => ({
    id: page.id,
    name: page.name,
  }));
  figma.ui.postMessage({
    type: 'pages-list',
    pages,
    currentPageId: figma.currentPage.id,
  });
}

figma.showUI(__html__, { width: 1280, height: 920, themeColors: true });
void listPages();

const BRIDGE_BASES = ['http://localhost:3847', 'http://127.0.0.1:3847'] as const;

/** 僅同步 visible，不修改 included、不剔除節點 */
async function refreshIRVisibilityFromFigma(root: IRVisibilityNode): Promise<void> {
  const walk = async (node: IRVisibilityNode): Promise<void> => {
    const isVirtual = node.figmaType === 'VIRTUAL' || node.figmaId.startsWith('vc_');
    if (!isVirtual && node.figmaId) {
      const figmaNode = await figma.getNodeByIdAsync(node.figmaId);
      if (figmaNode && 'visible' in figmaNode) {
        node.visible = (figmaNode as SceneNode).visible;
      }
    }
    for (const child of node.children ?? []) await walk(child);
  };
  await walk(root);
}

async function refreshIRDocumentFromFigma(ir: { root: IRVisibilityNode }): Promise<void> {
  await refreshIRVisibilityFromFigma(ir.root);
}

function validationUiPayload(report: OrganizeValidationReport | undefined): {
  validation?: OrganizeValidationReport;
  validationSummary?: string;
} {
  if (!report) return {};
  return {
    validation: report,
    validationSummary: formatValidationReportForUi(report),
  };
}

const BRIDGE_TIMEOUT_MS = {
  health: 10_000,
  saveExport: 30_000,
} as const;

async function readOrganizeTimeoutMin(): Promise<number> {
  const raw = await figma.clientStorage.getAsync(ORGANIZE_TIMEOUT_STORAGE_KEY);
  return clampOrganizeTimeoutMin(raw);
}

async function resolveOrganizeBridgeTimeoutMs(msg: { organizeTimeoutMin?: number }): Promise<number> {
  const min =
    typeof msg.organizeTimeoutMin === 'number'
      ? clampOrganizeTimeoutMin(msg.organizeTimeoutMin)
      : await readOrganizeTimeoutMin();
  if (typeof msg.organizeTimeoutMin === 'number') {
    await figma.clientStorage.setAsync(ORGANIZE_TIMEOUT_STORAGE_KEY, min);
  }
  return organizeTimeoutMsFromMin(min).bridgeMs;
}

function errorToString(e: unknown): string {
  if (e instanceof Error) {
    const parts = [e.name, e.message].filter(Boolean);
    if (parts.length) return parts.join(': ');
    return e.toString();
  }
  if (typeof e === 'string') return e;
  try {
    const json = JSON.stringify(e);
    if (json) return json;
  } catch {
    /* ignore */
  }
  return String(e);
}

function rpcError(source: string, code: string, error: unknown): { source: string; code: string; message: string } {
  return {
    source,
    code,
    message: errorToString(error),
  };
}

async function fetchBridge(
  path: string,
  init: RequestInit | undefined,
  timeoutMs: number,
  requestId?: number,
): Promise<Response> {
  const pathWithRequestId =
    typeof requestId === 'number'
      ? `${path}${path.includes('?') ? '&' : '?'}requestId=${encodeURIComponent(String(requestId))}`
      : path;
  const errors: string[] = [];
  for (const base of BRIDGE_BASES) {
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    try {
      const fetchPromise = fetch(`${base}${pathWithRequestId}`, init);
      const timeoutPromise = new Promise<Response>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error(`bridge timeout (${timeoutMs}ms)`));
        }, timeoutMs);
      });
      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (e) {
      errors.push(`${base}${pathWithRequestId} -> ${errorToString(e)}`);
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    }
  }
  throw new Error(`bridge request failed (${pathWithRequestId}): ${errors.join(' | ')}`);
}

function buildOrganizeBridgeBody(
  msg: {
    ir?: object;
    requestId?: number;
    customGuideName?: string;
    customGuideMarkdown?: string;
  },
  extra: Record<string, unknown> = {},
): string {
  const body: Record<string, unknown> = {
    ir: msg.ir,
    requestId: msg.requestId,
    ...extra,
  };
  const markdown = msg.customGuideMarkdown?.trim();
  if (markdown) {
    body.customGuideName = msg.customGuideName?.trim() || 'user-guide.md';
    body.customGuideMarkdown = markdown;
  }
  return JSON.stringify(body);
}

figma.ui.onmessage = async (msg: {
  type: string;
  pageId?: string;
  ir?: object;
  requestId?: number;
  scope?: 'latest' | 'all';
  referenceImageBase64?: string;
  referenceImageName?: string;
  customGuideName?: string;
  customGuideMarkdown?: string;
  organizeTimeoutMin?: number;
}) => {
  if (msg.type === 'get-organize-timeout') {
    const organizeTimeoutMin = await readOrganizeTimeoutMin();
    figma.ui.postMessage({
      type: 'get-organize-timeout-result',
      requestId: msg.requestId,
      ok: true,
      organizeTimeoutMin,
    });
    return;
  }

  if (msg.type === 'set-organize-timeout') {
    const organizeTimeoutMin = clampOrganizeTimeoutMin(msg.organizeTimeoutMin);
    await figma.clientStorage.setAsync(ORGANIZE_TIMEOUT_STORAGE_KEY, organizeTimeoutMin);
    figma.ui.postMessage({
      type: 'set-organize-timeout-result',
      requestId: msg.requestId,
      ok: true,
      organizeTimeoutMin,
    });
    return;
  }

  if (msg.type === 'preview-custom-guide') {
    const markdown = msg.customGuideMarkdown?.trim() ?? '';
    const overrides = parseCustomGuideOverrides(markdown);
    const summary = formatGuideOverridesSummary(overrides).trim();
    figma.ui.postMessage({
      type: 'preview-custom-guide-result',
      requestId: msg.requestId,
      ok: true,
      overrides,
      summary,
      hasProgrammaticRules: Boolean(overrides.buttonGroupMinSize),
    });
    return;
  }

  if (msg.type === 'bridge-health') {
    try {
      const res = await fetchBridge('/health', undefined, BRIDGE_TIMEOUT_MS.health, msg.requestId);
      const data = (await res.json()) as { hasCursorKey?: boolean; version?: string };
      figma.ui.postMessage({
        type: 'bridge-health-result',
        requestId: msg.requestId,
        ok: res.ok,
        source: 'bridge-health',
        hasCursorKey: Boolean(data?.hasCursorKey),
        version: data?.version,
      });
    } catch (e) {
      figma.ui.postMessage({
        type: 'bridge-health-result',
        requestId: msg.requestId,
        ok: false,
        source: 'bridge-health',
        error: rpcError('bridge', 'HEALTH_REQUEST_FAILED', e),
      });
    }
    return;
  }

  if (msg.type === 'cursor-organize' && msg.ir) {
    try {
      await refreshIRDocumentFromFigma(msg.ir as { root: IRVisibilityNode });
      const organizeBridgeTimeoutMs = await resolveOrganizeBridgeTimeoutMs(msg);
      const res = await fetchBridge(
        '/organize',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: buildOrganizeBridgeBody(msg),
        },
        organizeBridgeTimeoutMs,
        msg.requestId,
      );
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        organized?: object;
        summary?: string;
        validation?: object;
        requestId?: number;
      };
      if (!res.ok || !data.ok || !data.organized) {
        throw new Error(data.error ?? `bridge organize failed: HTTP ${res.status}`);
      }
      const organized = data.organized as { root?: unknown; source?: { pageName?: string }; agentSummary?: string };
      if (!organized.root) {
        throw new Error('bridge organize 回傳缺少 organized.root');
      }

      const page = figma.currentPage;
      const previewResult = await applyOrganizedPreview(
        page,
        organized.root as Parameters<typeof applyOrganizedPreview>[1],
      );

      figma.ui.postMessage({
        type: 'cursor-organize-result',
        requestId: msg.requestId,
        ok: true,
        source: 'cursor-organize',
        ir: data.organized,
        pageName: organized.source?.pageName ?? page.name,
        agentSummary: data.summary ?? organized.agentSummary,
        moved: previewResult.moved,
        virtualFrames: previewResult.virtualFrames,
        diffs: previewResult.diffs,
        driftCount: previewResult.driftCount,
        driftMax: previewResult.driftMax,
        remainingSessions: getPreviewSessionCount(),
        ...validationUiPayload(data.validation as OrganizeValidationReport | undefined),
      });
    } catch (e) {
      figma.ui.postMessage({
        type: 'cursor-organize-result',
        requestId: msg.requestId,
        ok: false,
        source: 'cursor-organize',
        error: rpcError('organize', 'ORGANIZE_FAILED', e),
      });
    }
    return;
  }

  if (msg.type === 'reference-hierarchy-organize' && msg.ir) {
    try {
      await refreshIRDocumentFromFigma(msg.ir as { root: IRVisibilityNode });
      const organizeBridgeTimeoutMs = await resolveOrganizeBridgeTimeoutMs(msg);
      const res = await fetchBridge(
        '/hierarchy-from-reference',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: buildOrganizeBridgeBody(msg, {
            referenceImageBase64: msg.referenceImageBase64,
            referenceImageName: msg.referenceImageName,
          }),
        },
        organizeBridgeTimeoutMs,
        msg.requestId,
      );
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        organized?: object;
        summary?: string;
        validation?: object;
        hierarchy?: object;
        files?: object;
      };
      if (!res.ok || !data.ok || !data.organized) {
        throw new Error(data.error ?? `hierarchy organize failed: HTTP ${res.status}`);
      }
      const organized = data.organized as { root?: unknown; source?: { pageName?: string } };
      if (!organized.root) throw new Error('hierarchy organize 回傳缺少 organized.root');

      const page = figma.currentPage;
      const previewResult = await applyOrganizedPreview(
        page,
        organized.root as Parameters<typeof applyOrganizedPreview>[1],
      );

      figma.ui.postMessage({
        type: 'reference-hierarchy-result',
        requestId: msg.requestId,
        ok: true,
        ir: data.organized,
        pageName: organized.source?.pageName ?? page.name,
        summary: data.summary,
        moved: previewResult.moved,
        virtualFrames: previewResult.virtualFrames,
        diffs: previewResult.diffs,
        driftCount: previewResult.driftCount,
        driftMax: previewResult.driftMax,
        remainingSessions: getPreviewSessionCount(),
        files: data.files,
        ...validationUiPayload(data.validation as OrganizeValidationReport | undefined),
      });
    } catch (e) {
      figma.ui.postMessage({
        type: 'reference-hierarchy-result',
        requestId: msg.requestId,
        ok: false,
        error: rpcError('reference-hierarchy', 'REFERENCE_ORGANIZE_FAILED', e),
      });
    }
    return;
  }

  if (msg.type === 'list-pages') {
    await listPages();
    return;
  }

  if (msg.type === 'organize-page') {
    if (!msg.pageId) {
      if (typeof msg.requestId === 'number') {
        figma.ui.postMessage({
          type: 'organize-page-result',
          requestId: msg.requestId,
          ok: false,
          error: '請拖曳 Page 到整理區',
        });
      }
      figma.ui.postMessage({ type: 'error', message: '請拖曳 Page 到整理區' });
      return;
    }

    const page = (await figma.getNodeByIdAsync(msg.pageId)) as PageNode | null;
    if (!page || page.type !== 'PAGE') {
      if (typeof msg.requestId === 'number') {
        figma.ui.postMessage({
          type: 'organize-page-result',
          requestId: msg.requestId,
          ok: false,
          error: '找不到指定的 Page',
        });
      }
      figma.ui.postMessage({ type: 'error', message: '找不到指定的 Page' });
      return;
    }

    await figma.setCurrentPageAsync(page);

    const paintOrderMap = buildPaintOrderMap(page);
    const parsedChildren = parseRootsFromPageChildren(page.children as readonly SceneNode[])
      .reverse()
      .map((c) => parseNode(c as SceneNodeLike, paintOrderMap));
    const ir = buildIRPageDocument(
      {
        id: page.id,
        name: page.name,
        children: parsedChildren as Parameters<typeof buildIRPageDocument>[0]['children'],
      },
      {
        fileKey: figma.fileKey ?? 'local',
        fileName: figma.root.name,
      },
    );

    figma.ui.postMessage({ type: 'ir-ready', ir, pageName: page.name });
    if (typeof msg.requestId === 'number') {
      figma.ui.postMessage({
        type: 'organize-page-result',
        requestId: msg.requestId,
        ok: true,
        ir,
        pageName: page.name,
      });
    }
    return;
  }

  if (msg.type === 'agent-organize-heuristic' && msg.ir) {
    try {
      const sourceIr = msg.ir as Parameters<typeof buildHeuristicPlan>[0];
      await refreshIRDocumentFromFigma(sourceIr);
      const plan = buildHeuristicPlan(sourceIr);
      const organized = applyAgentPlan(sourceIr, plan);
      const validation = validateOrganizedIR(organized, {
        sourceIr,
        buttonGroupMinSize: BUTTON_GROUP_MIN_SIZE,
      });
      const page = figma.currentPage;
      const previewResult = await applyOrganizedPreview(
        page,
        organized.root as Parameters<typeof applyOrganizedPreview>[1],
      );
      figma.ui.postMessage({
        type: 'heuristic-organize-result',
        requestId: msg.requestId,
        ok: true,
        ir: organized,
        pageName: (organized.source as { pageName?: string }).pageName ?? page.name,
        agentSummary: plan.summary,
        moved: previewResult.moved,
        virtualFrames: previewResult.virtualFrames,
        diffs: previewResult.diffs,
        driftCount: previewResult.driftCount,
        driftMax: previewResult.driftMax,
        remainingSessions: getPreviewSessionCount(),
        ...validationUiPayload(validation),
      });
    } catch (e) {
      figma.ui.postMessage({
        type: 'heuristic-organize-result',
        requestId: msg.requestId,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
    return;
  }

  if (msg.type === 'apply-organized-and-preview' && msg.ir) {
    try {
      const ir = msg.ir as { root?: { children?: unknown[] }; source?: { pageName?: string } };
      if (!ir.root?.children?.length) {
        figma.ui.postMessage({ type: 'error', message: 'organized IR 缺少 root.children' });
        return;
      }

      const page = figma.currentPage;
      const result = await applyOrganizedPreview(
        page,
        ir.root as Parameters<typeof applyOrganizedPreview>[1],
      );

      figma.ui.postMessage({
        type: 'organize-preview-done',
        ir: msg.ir,
        pageName: (ir.source as { pageName?: string })?.pageName ?? page.name,
        agentSummary: (msg.ir as { agentSummary?: string }).agentSummary,
        moved: result.moved,
        virtualFrames: result.virtualFrames,
        diffs: result.diffs,
        driftCount: result.driftCount,
        driftMax: result.driftMax,
        remainingSessions: getPreviewSessionCount(),
      });
    } catch (e) {
      figma.ui.postMessage({
        type: 'error',
        message: e instanceof Error ? e.message : String(e),
      });
    }
    return;
  }

  if (msg.type === 'preview-to-figma' && msg.ir) {
    try {
      const ir = msg.ir as { root?: { children?: unknown[] } };
      if (!ir.root?.children?.length) {
        figma.ui.postMessage({ type: 'error', message: '請先完成 AI 整理' });
        return;
      }

      const page = figma.currentPage;
      const result = await applyOrganizedPreview(
        page,
        ir.root as Parameters<typeof applyOrganizedPreview>[1],
      );
      figma.ui.postMessage({
        type: 'preview-applied',
        moved: result.moved,
        virtualFrames: result.virtualFrames,
        pageName: page.name,
        diffs: result.diffs,
        driftCount: result.driftCount,
        driftMax: result.driftMax,
        remainingSessions: getPreviewSessionCount(),
      });
    } catch (e) {
      figma.ui.postMessage({
        type: 'error',
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }

  if (msg.type === 'clear-figma-preview') {
    const before = getPreviewSessionCount();
    const cleared = await clearOrganizedPreview(msg.scope ?? 'all');
    const after = getPreviewSessionCount();
    figma.ui.postMessage({
      type: 'preview-cleared',
      cleared,
      pageId: figma.currentPage.id,
      pageName: figma.currentPage.name,
      scope: msg.scope ?? 'all',
      restoredSessions: Math.max(before - after, 0),
      remainingSessions: after,
    });
  }

  if (msg.type === 'get-preview-state') {
    figma.ui.postMessage({ type: 'preview-state', active: hasActivePreview() });
  }

  if (msg.type === 'export-confirmed' && msg.ir) {
    figma.ui.postMessage({ type: 'export-start' });
    try {
      const ir = msg.ir as { root?: IRNodeForExport & IRVisibilityNode };
      if (!ir.root) {
        figma.ui.postMessage({ type: 'export-error', message: 'IR 格式錯誤：缺少 root' });
        return;
      }

      await refreshIRDocumentFromFigma(ir as { root: IRVisibilityNode });

      const exportIds = collectExportableIds(ir.root);
      const images: Record<string, string> = {};
      const errors: string[] = [];

      for (let i = 0; i < exportIds.length; i++) {
        const id = exportIds[i];
        figma.ui.postMessage({
          type: 'export-progress',
          current: i + 1,
          total: exportIds.length,
        });

        try {
          const n = await figma.getNodeByIdAsync(id);
          if (!n || !('exportAsync' in n)) {
            errors.push(`${id}: 節點不支援匯出`);
            continue;
          }
          const bytes = await (n as ExportMixin).exportAsync({
            format: 'PNG',
            constraint: { type: 'SCALE', value: 1 },
          });
          images[id] = figma.base64Encode(bytes);
        } catch (e) {
          const name = (await figma.getNodeByIdAsync(id))?.name ?? id;
          errors.push(`${name}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }

      // 優先存到專案資料夾；若 bridge 不可用再 fallback 成下載
      try {
        const exportRequestId = Date.now();
        const saveRes = await fetchBridge(
          '/save-export',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ir: msg.ir, images, requestId: exportRequestId }),
          },
          BRIDGE_TIMEOUT_MS.saveExport,
          exportRequestId,
        );
        const saveData = (await saveRes.json()) as {
          ok?: boolean;
          error?: string;
          folder?: string;
          irFile?: string;
          savedImages?: number;
        };
        if (!saveRes.ok || !saveData.ok) {
          throw new Error(saveData.error ?? `HTTP ${saveRes.status}`);
        }
        figma.ui.postMessage({
          type: 'export-saved',
          folder: saveData.folder,
          irFile: saveData.irFile,
          savedImages: saveData.savedImages ?? 0,
          errors,
        });
      } catch (saveErr) {
        figma.ui.postMessage({
          type: 'export-save-fallback',
          message: `自動存檔失敗，改用下載：${errorToString(saveErr)}`,
        });
        figma.ui.postMessage({ type: 'export-images', images, ir: msg.ir, errors });
      }
    } catch (e) {
      figma.ui.postMessage({
        type: 'export-error',
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }

  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

interface IRNodeForExport {
  asset?: string;
  figmaId: string;
  children?: IRNodeForExport[];
  included?: boolean;
}

function collectExportableIds(node: IRNodeForExport): string[] {
  const ids: string[] = [];
  if (node.included === false) return ids;
  if (node.asset) {
    ids.push(node.figmaId);
  }
  for (const child of node.children ?? []) {
    ids.push(...collectExportableIds(child));
  }
  return ids;
}
