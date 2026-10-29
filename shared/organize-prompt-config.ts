/** AI 整理 prompt 省 token 設定（環境變數可覆寫） */

function envFlag(name: string, defaultOn: boolean): boolean {
  const v = process.env[name]?.trim().toLowerCase();
  if (v === '1' || v === 'true' || v === 'yes') return true;
  if (v === '0' || v === 'false' || v === 'no') return false;
  return defaultOn;
}

function envInt(name: string, fallback: number): number {
  const n = Number(process.env[name]?.trim());
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

/** 預設完整 Skill；設 FTC_ORGANIZE_COMPACT=1 或 FTC_ORGANIZE_FULL_SKILL=0 使用精簡版 */
export function useCompactOrganizePrompt(): boolean {
  if (envFlag('FTC_ORGANIZE_COMPACT', false)) return true;
  return !envFlag('FTC_ORGANIZE_FULL_SKILL', true);
}

/** 節點列表預設緊湊欄位（與 Skill 模式無關）；FTC_ORGANIZE_VERBOSE_NODES=1 還原完整欄位名 */
export function useCompactAgentNodes(): boolean {
  return !envFlag('FTC_ORGANIZE_VERBOSE_NODES', false);
}

/** 使用者 .md 送入 Agent 的最大字元數（仍會附上已解析的覆寫摘要） */
export function customGuideMaxChars(): number {
  return envInt('FTC_ORGANIZE_GUIDE_MAX_CHARS', 3500);
}

/** 節點 text 欄位截斷長度 */
export function agentNodeTextMaxChars(): number {
  return envInt('FTC_ORGANIZE_NODE_TEXT_MAX', 64);
}

/** 附圖 base64 超過此長度時自動壓縮（JPEG、縮邊） */
export function referenceImageCompressBase64Len(): number {
  return envInt('FTC_ORGANIZE_IMAGE_COMPRESS_B64', 400_000);
}

/** 壓縮後寬高最大邊（px） */
export function referenceImageMaxEdgePx(): number {
  return envInt('FTC_ORGANIZE_IMAGE_MAX_EDGE', 1920);
}

/** JPEG 品質 1–100 */
export function referenceImageJpegQuality(): number {
  const q = envInt('FTC_ORGANIZE_IMAGE_JPEG_QUALITY', 82);
  return Math.min(100, Math.max(40, q));
}

export function skipReferenceImageCompress(): boolean {
  return envFlag('FTC_ORGANIZE_SKIP_IMAGE_COMPRESS', false);
}
