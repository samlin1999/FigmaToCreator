import { defaultIncluded, inferNodeType } from './organizer';

export interface ParsedFigmaNode {
  id: string;
  name: string;
  figmaType: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  text?: string;
  textColor?: string;
  fontSize?: number;
  exportable: boolean;
  /** Figma 原始繪製順序（越小越底層） */
  paintOrder?: number;
  children: ParsedFigmaNode[];
}

export interface IRRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IRNodeOut {
  figmaId: string;
  name: string;
  figmaType: string;
  type: string;
  /** 相對父節點，由 absRect 推算，保證視覺一致 */
  rect: IRRect;
  /** Figma 畫布絕對座標，整理前後不變 */
  absRect: IRRect;
  asset?: string;
  text?: string;
  textColor?: string;
  fontSize?: number;
  visible: boolean;
  included: boolean;
  organizeHint?: string;
  paintOrder?: number;
  children: IRNodeOut[];
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^\w\u4e00-\u9fff-]+/g, '_').replace(/_+/g, '_').toLowerCase();
}

function assetPathFor(node: ParsedFigmaNode, scopeName: string): string | undefined {
  if (node.figmaType === 'TEXT') return undefined;
  const folder = sanitizeFileName(scopeName);
  const file = sanitizeFileName(node.name);
  return `textures/${folder}/${file}.png`;
}

function toAbsRect(node: ParsedFigmaNode): IRRect {
  return { x: node.x, y: node.y, width: node.width, height: node.height };
}

function relativeRect(absRect: IRRect, parentAbs: IRRect): IRRect {
  return {
    x: absRect.x - parentAbs.x,
    y: absRect.y - parentAbs.y,
    width: absRect.width,
    height: absRect.height,
  };
}

/** 保留 Figma 原始子節點順序（與 Layers 面板一致：上→下） */
function toIRNode(
  node: ParsedFigmaNode,
  scopeName: string,
  parentAbs: IRRect,
): IRNodeOut {
  const absRect = toAbsRect(node);
  const { type, hint } = inferNodeType(node.name, node.figmaType);

  const childNodes = (node.children ?? []).map((child) => toIRNode(child, scopeName, absRect));

  return {
    figmaId: node.id,
    name: node.name,
    figmaType: node.figmaType,
    type,
    rect: relativeRect(absRect, parentAbs),
    absRect,
    asset: node.exportable ? assetPathFor(node, scopeName) : undefined,
    text: node.text,
    textColor: node.textColor,
    fontSize: node.fontSize,
    visible: node.visible,
    included: defaultIncluded(node),
    organizeHint: hint,
    paintOrder: node.paintOrder,
    children: childNodes,
  };
}

function computeContentBounds(nodes: ParsedFigmaNode[]): IRRect {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  }

  if (!Number.isFinite(minX)) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** 整理整個 Figma Page：階層 1:1 保留，視覺不變 */
export function buildIRPageDocument(
  page: { id: string; name: string; children: ParsedFigmaNode[] },
  meta: { fileKey: string; fileName: string },
): { version: '1.0'; scope: 'page'; preserveVisual: true; source: object; designSize: object; root: IRNodeOut } {
  const contentBounds = computeContentBounds(page.children);
  const pageAbs: IRRect = contentBounds;

  const children = page.children.map((child) => toIRNode(child, page.name, pageAbs));

  return {
    version: '1.0',
    scope: 'page',
    preserveVisual: true,
    source: {
      fileKey: meta.fileKey,
      fileName: meta.fileName,
      pageId: page.id,
      pageName: page.name,
      exportedAt: new Date().toISOString(),
    },
    designSize: { width: contentBounds.width, height: contentBounds.height },
    root: {
      figmaId: page.id,
      name: page.name,
      figmaType: 'PAGE',
      type: 'page',
      rect: { x: 0, y: 0, width: contentBounds.width, height: contentBounds.height },
      absRect: pageAbs,
      visible: true,
      included: true,
      organizeHint: 'Page 根節點（內容邊界，不改變子節點位置）',
      children,
    },
  };
}

/** 單一 Frame 匯出（向下相容） */
export function buildIRDocument(
  frame: ParsedFigmaNode,
  meta: { fileKey: string; fileName: string },
): { version: '1.0'; scope: 'frame'; preserveVisual: true; source: object; designSize: object; root: IRNodeOut } {
  const frameAbs = toAbsRect(frame);
  const root = toIRNode(frame, frame.name, { x: frameAbs.x, y: frameAbs.y, width: 0, height: 0 });
  root.type = 'panel';
  root.organizeHint = '根 Frame → Panel（保留原始子階層）';

  return {
    version: '1.0',
    scope: 'frame',
    preserveVisual: true,
    source: {
      fileKey: meta.fileKey,
      fileName: meta.fileName,
      frameId: frame.id,
      frameName: frame.name,
      exportedAt: new Date().toISOString(),
    },
    designSize: { width: frame.width, height: frame.height },
    root,
  };
}
