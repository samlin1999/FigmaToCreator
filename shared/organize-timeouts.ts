/** AI 整理逾時（分鐘）預設與上下限 */
export const ORGANIZE_TIMEOUT_DEFAULT_MIN = 3;
export const ORGANIZE_TIMEOUT_MIN_MIN = 1;
export const ORGANIZE_TIMEOUT_MAX_MIN = 15;
/** UI RPC 比 bridge 多等的緩衝（毫秒） */
export const ORGANIZE_TIMEOUT_RPC_BUFFER_MS = 15_000;

export const ORGANIZE_TIMEOUT_STORAGE_KEY = 'ftc_organize_timeout_min';

export function clampOrganizeTimeoutMin(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return ORGANIZE_TIMEOUT_DEFAULT_MIN;
  return Math.min(
    ORGANIZE_TIMEOUT_MAX_MIN,
    Math.max(ORGANIZE_TIMEOUT_MIN_MIN, Math.round(n)),
  );
}

export function organizeTimeoutMsFromMin(minutes: number): {
  bridgeMs: number;
  rpcMs: number;
} {
  const min = clampOrganizeTimeoutMin(minutes);
  const bridgeMs = min * 60 * 1000;
  return {
    bridgeMs,
    rpcMs: bridgeMs + ORGANIZE_TIMEOUT_RPC_BUFFER_MS,
  };
}
