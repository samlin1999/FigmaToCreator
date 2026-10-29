/** 非英文圖層名 → 英文 snake_case 片段（長詞優先匹配） */
const LAYER_NAME_PHRASES: Array<[string, string]> = [
  ['鑽石幣', 'diamond'],
  ['金幣', 'gold'],
  ['銀幣', 'silver'],
  ['銅幣', 'copper'],
  ['鑽石', 'diamond'],
  ['元寶', 'gem'],
  ['紅寶石', 'ruby'],
  ['藍寶石', 'sapphire'],
  ['綠寶石', 'emerald'],
  ['體力', 'energy'],
  ['耐力', 'stamina'],
  ['生命值', 'hp'],
  ['血量', 'hp'],
  ['魔力', 'mp'],
  ['經驗', 'exp'],
  ['經驗值', 'exp'],
  ['排行榜', 'rank'],
  ['充值', 'recharge'],
  ['儲值', 'recharge'],
  ['公告', 'notice'],
  ['郵件', 'mail'],
  ['信箱', 'mail'],
  ['好友', 'friend'],
  ['任務', 'quest'],
  ['活動', 'event'],
  ['商店', 'shop'],
  ['商城', 'shop'],
  ['背包', 'bag'],
  ['道具', 'item'],
  ['裝備', 'equip'],
  ['武器', 'weapon'],
  ['頭像', 'avatar'],
  ['稱號', 'title'],
  ['設定', 'settings'],
  ['設置', 'settings'],
  ['導航', 'nav'],
  ['導覽', 'nav'],
  ['訊息', 'message'],
  ['消息', 'message'],
  ['聊天', 'chat'],
  ['標題', 'title'],
  ['背景', 'bg'],
  ['底圖', 'bg'],
  ['輸入', 'input'],
  ['輸入框', 'input'],
  ['搜尋', 'search'],
  ['搜索', 'search'],
  ['關閉', 'close'],
  ['返回', 'back'],
  ['確認', 'confirm'],
  ['取消', 'cancel'],
  ['領取', 'claim'],
  ['免費', 'free'],
  ['獎勵', 'reward'],
  ['禮包', 'pack'],
  ['禮物', 'gift'],
  ['按鈕', 'btn'],
  ['按钮', 'btn'],
  ['圖示', 'icon'],
  ['图标', 'icon'],
  ['圖標', 'icon'],
  ['货币', 'currency'],
  ['貨幣', 'currency'],
  ['币种', 'currency'],
  ['幣種', 'currency'],
  ['左下', 'bottom_left'],
  ['右下', 'bottom_right'],
  ['左上', 'top_left'],
  ['右上', 'top_right'],
  ['左側', 'left'],
  ['右側', 'right'],
  ['上方', 'top'],
  ['下方', 'bottom'],
  ['左', 'left'],
  ['右', 'right'],
  ['上', 'top'],
  ['下', 'bottom'],
  // 簡體常見別字
  ['钻石', 'diamond'],
  ['金币', 'gold'],
  ['银币', 'silver'],
  ['按钮', 'btn'],
  ['背景', 'bg'],
  ['标题', 'title'],
  ['消息', 'message'],
  ['导航', 'nav'],
  ['商店', 'shop'],
  ['头像', 'avatar'],
];

const LAYER_NAME_PHRASES_SORTED = [...LAYER_NAME_PHRASES].sort((a, b) => b[0].length - a[0].length);

const NON_LATIN_RE = /[^\u0000-\u007f]/;
const CJK_RE = /[\u4e00-\u9fff\u3040-\u30ff\u3400-\u4dbf\uac00-\ud7af]/g;

export function containsNonEnglishLayerName(name: string): boolean {
  return NON_LATIN_RE.test(name);
}

/**
 * 將圖層名中的非英文（中日韓等）先換成英文 token，供後續命名/保留語意使用。
 * 已是英文或 Figma 預設名則原樣回傳（僅做空白→底線）。
 */
export function translateLayerNameToEnglish(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';

  if (!containsNonEnglishLayerName(trimmed)) {
    return trimmed.replace(/\s+/g, '_');
  }

  let s = trimmed;
  for (const [phrase, en] of LAYER_NAME_PHRASES_SORTED) {
    if (!s.includes(phrase)) continue;
    s = s.split(phrase).join(`_${en}_`);
  }

  // 移除無法對照的殘留 CJK
  s = s.replace(CJK_RE, '_');
  s = s
    .replace(/[^a-zA-Z0-9_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  return s || trimmed.replace(/\s+/g, '_');
}

/** 命名流程使用的「原名」：非英文先譯為英文再處理 */
export function originalLayerNameForNaming(originalName: string): string {
  return translateLayerNameToEnglish(originalName);
}
