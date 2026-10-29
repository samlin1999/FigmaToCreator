/** 從使用者 .md 解析出的可覆寫業務邏輯（不可覆寫 absRect / figmaId 等硬約束） */
export interface CustomGuideOverrides {
  /** 按鈕群組虛擬容器最小邊長（預設 60） */
  buttonGroupMinSize?: number;
}

function parseMinSquareFromMatch(w: string, h?: string): number | undefined {
  const width = Number(w);
  const height = h !== undefined ? Number(h) : width;
  if (!Number.isFinite(width) || width <= 0) return undefined;
  if (!Number.isFinite(height) || height <= 0) return width;
  return Math.max(width, height);
}

/**
 * 從補充規則 .md 解析明確的業務邏輯覆寫。
 * 例：「按鈕群組容器最小 70×70」→ buttonGroupMinSize: 70
 */
export function parseCustomGuideOverrides(markdown: string): CustomGuideOverrides {
  const overrides: CustomGuideOverrides = {};
  const text = markdown.replace(/\r\n/g, '\n');

  const patterns: RegExp[] = [
    /按鈕(?:群組)?(?:容器)?[^。\n]{0,48}?最小(?:尺寸|大小)?[^0-9]*(\d+)\s*[×xX*＊]\s*(\d+)/i,
    /按鈕[^。\n]{0,64}?(?:擴充|擴展|放大)[^0-9]{0,16}(\d+)\s*[×xX*＊]\s*(\d+)/i,
    /(?:expand|enlarge)[^.\n]{0,40}?(\d+)\s*[×xX*＊]\s*(\d+)/i,
    /button\s*group[^.\n]{0,48}?min(?:imum)?(?:\s*size)?[^0-9]*(\d+)\s*[×xX*＊]\s*(\d+)/i,
    /BUTTON_GROUP_MIN(?:_SIZE)?\s*[=:]\s*(\d+)/i,
    /(?:改為|改成|使用|改)\s*(\d+)\s*[×xX*＊]\s*(\d+)/i,
    /(?:擴充|擴展)到?\s*(\d+)\s*[×xX*＊]\s*(\d+)/i,
  ];

  for (const re of patterns) {
    const m = text.match(re);
    if (!m) continue;
    const size = parseMinSquareFromMatch(m[1], m[2]);
    if (size) {
      overrides.buttonGroupMinSize = size;
      break;
    }
  }

  if (!overrides.buttonGroupMinSize) {
    const single = text.match(/按鈕(?:群組)?(?:容器)?[^。\n]{0,40}?最小[^0-9]*(\d+)/i);
    if (single) {
      const n = Number(single[1]);
      if (Number.isFinite(n) && n > 0) overrides.buttonGroupMinSize = n;
    }
  }

  return overrides;
}

export function formatGuideOverridesSummary(overrides: CustomGuideOverrides): string {
  const lines: string[] = [];
  if (overrides.buttonGroupMinSize) {
    lines.push(
      `- 按鈕群組虛擬容器最小 ${overrides.buttonGroupMinSize}×${overrides.buttonGroupMinSize}（覆寫 Skill 預設 60×60；apply-plan 會強制執行）`,
    );
  }
  if (!lines.length) return '';
  return `\n## 已解析的業務邏輯覆寫\n${lines.join('\n')}\n`;
}
