import type { AgentNodeHint, IRDocumentLike, IRNodeLike } from '../../../shared/agent-plan-types';
import { originalLayerNameForNaming } from './layer-name-i18n';
import { sanitizeNodeName } from './normalize-plan';

export const BTN_IN_NAME = /\bbtn\b|_btn_|^btn_/i;

/** Figma 預設圖層名（不含語意） */
const GENERIC_FIGMA_TOKENS = new Set([
  'rectangle',
  'frame',
  'group',
  'component',
  'instance',
  'vector',
  'ellipse',
  'line',
  'path',
  'text',
  'image',
  'slice',
  'section',
  'boolean',
  'union',
  'star',
  'polygon',
  'copy',
  'variant',
  'mask',
  'artboard',
]);

/** 整理系統會自行產生的結構詞，不需從原名重複保留 */
const STRUCTURAL_NAME_TOKENS = new Set([
  'btn',
  'button',
  'label',
  'icon',
  'image',
  'sprite',
  'bg',
  'background',
  'tab',
  'panel',
  'elem',
  'page',
  'nav',
  'footer',
  'header',
  'title',
  'input',
  'edit',
  'message',
  'head',
  'item',
  'group',
  'list',
  'content',
  'zone',
  'top',
  'left',
  'right',
  'bottom',
  'mid',
  'custom',
  'layer',
  'root',
  'node',
]);

function tokenizeName(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2 && !/^\d+$/.test(t));
}

function isGenericFigmaLayerName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return true;
  return /^(rectangle|frame|group|ellipse|vector|text|image|component|instance|section)\s*\d*$/i.test(
    trimmed,
  );
}

/**
 * 從原 Figma 圖層名擷取語意物件詞（如 diamond、gold、shop），
 * 排除 Rectangle 123 等預設名與 btn/label 等結構詞。
 */
export function extractSemanticDescriptorTokens(originalName: string): string[] {
  const englishName = originalLayerNameForNaming(originalName);
  if (!englishName?.trim() || isGenericFigmaLayerName(englishName)) return [];

  const out: string[] = [];
  for (const t of tokenizeName(englishName)) {
    if (GENERIC_FIGMA_TOKENS.has(t) || STRUCTURAL_NAME_TOKENS.has(t)) continue;
    if (!out.includes(t)) out.push(t);
  }
  return out;
}

/**
 * 將原名中的物件描述詞併入新名稱（新名稱已含則跳過）。
 * 例：原名 currency_diamond + 新名 label_01 → label_currency_diamond_01
 */
export function mergeNameWithOriginalTokens(originalName: string, newName: string): string {
  const descriptors = extractSemanticDescriptorTokens(originalName);
  let result = sanitizeNodeName(newName);
  if (!descriptors.length || !result) return result;

  const existing = new Set(tokenizeName(result));
  const missing = descriptors.filter((d) => !existing.has(d));
  if (!missing.length) return result;

  const numbered = result.match(/^(.*?)(_\d{2,})$/);
  const base = numbered ? numbered[1] : result;
  const suffix = numbered ? numbered[2] : '';
  const merged = sanitizeNodeName(`${base}_${missing.join('_')}${suffix}`);
  return merged || result;
}

/** 示意圖標註或 hint 判定為按鈕 */
export function isButtonHint(hint?: AgentNodeHint, node?: IRNodeLike): boolean {
  if (hint?.type === 'button' || node?.type === 'button') return true;
  const blob = `${hint?.organizeHint ?? ''} ${hint?.name ?? ''} ${node?.name ?? ''} ${node?.organizeHint ?? ''}`;
  return /按鈕|\bbutton\b/i.test(blob);
}

export function isButtonAnnotatedText(text?: string): boolean {
  if (!text?.trim()) return false;
  return /按鈕|\bbutton\b/i.test(text);
}

/** 按鈕節點名稱必須含 btn */
export function ensureBtnInName(name: string): string {
  const n = sanitizeNodeName(name);
  if (!n) return 'btn_01';
  if (BTN_IN_NAME.test(n)) return n;
  if (n.startsWith('elem_')) return n.replace(/^elem_/, 'btn_');
  return `btn_${n}`;
}

function ratio(v: number, total: number): number {
  return total > 0 ? v / total : 0;
}

function areaRatio(node: IRNodeLike, page: IRNodeLike): number {
  const pageArea = page.absRect.width * page.absRect.height;
  if (pageArea <= 0) return 0;
  return (node.absRect.width * node.absRect.height) / pageArea;
}

function relCenter(node: IRNodeLike, pageAbs: IRNodeLike['absRect']) {
  const cx = node.absRect.x + node.absRect.width / 2;
  const cy = node.absRect.y + node.absRect.height / 2;
  return {
    x: ratio(cx - pageAbs.x, pageAbs.width),
    y: ratio(cy - pageAbs.y, pageAbs.height),
  };
}

function byYThenX(a: IRNodeLike, b: IRNodeLike): number {
  const dy = a.absRect.y - b.absRect.y;
  if (dy !== 0) return dy;
  return a.absRect.x - b.absRect.x;
}

export function collectIncludedLeaves(root: IRNodeLike): IRNodeLike[] {
  const out: IRNodeLike[] = [];
  const walk = (n: IRNodeLike): void => {
    if (n.included === false) return;
    const isVirtual = n.figmaType === 'VIRTUAL' || n.figmaId.startsWith('vc_');
    if (!isVirtual && !n.children.length) out.push(n);
    for (const c of n.children ?? []) walk(c);
  };
  for (const c of root.children ?? []) walk(c);
  return out;
}

/** 依類型、幾何、原 Figma 名稱推斷通用前綴（不含序號） */
export function inferGenericNamePrefix(node: IRNodeLike, page: IRNodeLike): string {
  const raw = originalLayerNameForNaming(node.name).toLowerCase();
  const { x: relX, y: relY } = relCenter(node, page.absRect);
  const ar = areaRatio(node, page);

  const nameHit =
    (re: RegExp) => re.test(raw);
  if (nameHit(/tab_text|tab.*text/)) return 'tab_text';
  if (nameHit(/\btab\b/)) return 'tab';
  if (nameHit(/message_text|msg.*text/)) return 'message_text';
  if (nameHit(/\bhead\b|avatar|icon_head/)) return 'head';
  if (nameHit(/\bmessage\b|\bmsg\b/)) return 'message';
  if (nameHit(/edit_text|input_text|placeholder/)) return 'edit_text';
  if (nameHit(/\binput\b|\bedit\b/)) return 'input';
  if (nameHit(/\btitle\b/)) return 'title';
  if (nameHit(/\bbg\b|background/)) return 'bg';

  if (ar > 0.5) return 'page_bg';
  if (node.type === 'label' || node.text) {
    if (relY < 0.22) return 'title';
    if (relY > 0.78) return 'label_footer';
    return 'label';
  }
  if (node.type === 'button') return 'btn';
  if (node.asset || node.type === 'sprite') {
    if (ar > 0.2) return 'panel_bg';
    if (relY < 0.25) return 'icon_header';
    if (relY > 0.75) return 'icon_footer';
    return 'image';
  }

  if (relY < 0.33) {
    if (relX < 0.33) return 'elem_top_left';
    if (relX > 0.66) return 'elem_top_right';
    return 'elem_top';
  }
  if (relY > 0.66) {
    if (relX < 0.33) return 'elem_bottom_left';
    if (relX > 0.66) return 'elem_bottom_right';
    return 'elem_bottom';
  }
  if (relX < 0.33) return 'elem_mid_left';
  if (relX > 0.66) return 'elem_mid_right';
  return 'elem';
}

function nextIndexedName(prefix: string, counters: Map<string, number>): string {
  const n = (counters.get(prefix) ?? 0) + 1;
  counters.set(prefix, n);
  return `${prefix}_${String(n).padStart(2, '0')}`;
}

/** 為尚未命名的 included 葉節點填入通用 snake_case 名稱 */
export function applyGenericNamesToLeaves(
  root: IRNodeLike,
  page: IRNodeLike,
  options?: { skipFigmaIds?: Set<string> },
): void {
  const skip = options?.skipFigmaIds;
  const leaves = collectIncludedLeaves(root).sort(byYThenX);
  const counters = new Map<string, number>();
  for (const leaf of leaves) {
    if (skip?.has(leaf.figmaId)) continue;
    const prefix = inferGenericNamePrefix(leaf, page);
    const generated = sanitizeNodeName(nextIndexedName(prefix, counters));
    leaf.name = mergeNameWithOriginalTokens(leaf.name, generated);
  }
}

/** 僅補齊 plan.nodeHints 中缺少 name 的項目（normalize 階段） */
export function fillMissingHintNames(
  nodeHints: Record<string, { figmaId: string; name?: string }>,
  ir: IRDocumentLike,
): void {
  const page = ir.root;
  const nodeMap = new Map<string, IRNodeLike>();
  for (const leaf of collectIncludedLeaves(page)) {
    nodeMap.set(leaf.figmaId, leaf);
  }
  const counters = new Map<string, number>();
  const sortedIds = [...nodeMap.keys()].sort((a, b) => {
    const na = nodeMap.get(a)!;
    const nb = nodeMap.get(b)!;
    return byYThenX(na, nb);
  });
  for (const figmaId of sortedIds) {
    const hint = nodeHints[figmaId];
    if (hint?.name?.trim()) continue;
    const node = nodeMap.get(figmaId);
    if (!node) continue;
    const prefix = inferGenericNamePrefix(node, page);
    const generated = sanitizeNodeName(nextIndexedName(prefix, counters));
    let finalName = mergeNameWithOriginalTokens(node.name, generated);
    if (isButtonHint(hint, node)) finalName = ensureBtnInName(finalName);
    if (hint) {
      hint.name = finalName;
    } else {
      nodeHints[figmaId] = { figmaId, name: finalName };
    }
  }
}

/** 將 plan 內已命名的按鈕節點/容器補上 btn 前綴規則 */
export function enforceButtonNamesInPlan(
  nodeHints: Record<string, AgentNodeHint>,
  nodeMap: Map<string, IRNodeLike>,
  virtualContainers?: { name: string; organizeHint?: string }[],
): void {
  for (const [figmaId, hint] of Object.entries(nodeHints)) {
    const node = nodeMap.get(figmaId);
    if (!isButtonHint(hint, node)) continue;
    if (hint.name?.trim() && node) {
      let merged = mergeNameWithOriginalTokens(node.name, hint.name);
      hint.name = ensureBtnInName(merged);
    } else if (node) {
      hint.name = ensureBtnInName(mergeNameWithOriginalTokens(node.name, node.name));
    }
  }
  for (const vc of virtualContainers ?? []) {
    if (!isButtonAnnotatedText(`${vc.organizeHint ?? ''} ${vc.name}`)) continue;
    vc.name = ensureBtnInName(vc.name);
  }
}
