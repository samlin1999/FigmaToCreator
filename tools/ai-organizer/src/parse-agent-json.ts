/** 從 Cursor Agent 文字回應擷取 JSON */
export function parseAgentJsonFromText(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Cursor Agent 回傳空內容');
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    /* try fenced block */
  }

  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    return JSON.parse(fence[1].trim());
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }

  throw new Error('Cursor Agent 回傳無法解析為 JSON（請確認 Agent 只輸出 AgentOrganizePlan）');
}
