/**
 * Figma 圖層 → Cocos 元件語意標記
 * 原則：只標記語意，不修改 Figma 階層結構，確保整理前後視覺一致。
 */

export type OrganizedType = 'panel' | 'sprite' | 'label' | 'button' | 'container' | 'group';

const PREFIX_RULES: Array<{ pattern: RegExp; type: OrganizedType; hint: string }> = [
  { pattern: /^panel[_-]/i, type: 'panel', hint: '語意：Panel 容器' },
  { pattern: /^btn[_-]/i, type: 'button', hint: '語意：Button' },
  { pattern: /^(bg|background)[_-]/i, type: 'sprite', hint: '語意：Sprite 背景' },
  { pattern: /^(txt|text|label)[_-]/i, type: 'label', hint: '語意：Label' },
  { pattern: /^(icon|img|image)[_-]/i, type: 'sprite', hint: '語意：Sprite' },
];

const SUFFIX_RULES: Array<{ pattern: RegExp; type: OrganizedType; hint: string }> = [
  { pattern: /panel$/i, type: 'panel', hint: '語意：Panel 容器' },
  { pattern: /btn$/i, type: 'button', hint: '語意：Button' },
];

export function inferNodeType(name: string, figmaType: string): { type: OrganizedType; hint: string } {
  for (const rule of PREFIX_RULES) {
    if (rule.pattern.test(name)) {
      return { type: rule.type, hint: rule.hint };
    }
  }
  for (const rule of SUFFIX_RULES) {
    if (rule.pattern.test(name)) {
      return { type: rule.type, hint: rule.hint };
    }
  }

  if (figmaType === 'TEXT') {
    return { type: 'label', hint: '語意：Label（Figma TEXT）' };
  }
  if (figmaType === 'FRAME' || figmaType === 'COMPONENT' || figmaType === 'INSTANCE') {
    return { type: 'panel', hint: '語意：Panel 容器（Figma Frame）' };
  }
  if (figmaType === 'GROUP') {
    return { type: 'group', hint: '保留原始 Group 階層' };
  }
  if (figmaType === 'SECTION') {
    return { type: 'container', hint: '保留原始 Section 階層' };
  }
  return { type: 'sprite', hint: '語意：Sprite' };
}

/**
 * 預設納入整理／匯出階層（含 Figma 隱藏圖層）。
 * 隱藏節點以 visible:false 保留在 IR，Prefab 會設 active=false，不從整理結果剔除。
 */
export function defaultIncluded(node: { visible: boolean; name: string }): boolean {
  if (/^(_|ignore|temp|draft)/i.test(node.name)) return false;
  return true;
}
