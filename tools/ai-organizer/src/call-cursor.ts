/// <reference types="node" />

import { existsSync, mkdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { Agent, CursorAgentError, type SDKImage } from '@cursor/sdk';
import {
  estimatePromptTokens,
  truncateCustomGuideMarkdown,
} from '../../../shared/agent-prompt-format';
import {
  formatGuideOverridesSummary,
  parseCustomGuideOverrides,
  type CustomGuideOverrides,
} from '../../../shared/custom-guide-overrides';
import { useCompactOrganizePrompt } from '../../../shared/organize-prompt-config';
import { loadOrganizerSkillOrThrow } from './load-organizer-skill';
import { parseAgentJsonFromText } from './parse-agent-json';
import { optimizeReferenceSdkImage } from './reference-image-optimize';

const SYSTEM_PREFIX_COMPACT =
  'Figma UI 整理 Agent。只輸出一個 AgentOrganizePlan JSON（無 markdown）。' +
  '硬約束：不改 absRect；figmaId 僅能來自 nodes；Group 不拆。' +
  '優先：硬約束 > Skill > 使用者 .md 明確規則。';

const SYSTEM_PREFIX_FULL =
  '你是 Figma UI 結構整理 Agent。只輸出一個 JSON 物件（不要 markdown 說明），符合 AgentOrganizePlan 格式。' +
  '不得修改 absRect。figmaId 必須完全來自使用者提供的節點列表，不可自創。' +
  '可透過 nodeHints[].name 與 virtualContainers[].name 命名：有示意圖標籤用語意名，無標籤也要給通用 snake_case 名（每個葉節點必填 name）。標註為按鈕者 name 必須含 btn。最終名稱僅英文；原名若為中文須先譯成英文語意詞再併入。' +
  '規則優先順序：① 硬約束（absRect / figmaId / Group 保留，不可被任何規則覆寫）> ② Skill 預設業務邏輯 > ③ 使用者 .md 中**明確寫出**的業務邏輯（可覆寫 Skill 預設，例如按鈕容器最小尺寸 70×70）。';

export interface CallCursorAgentOptions {
  /** 附圖（示意圖圈選區）；有值時 Agent 會以 vision 讀圖 */
  images?: SDKImage[];
  /** 使用者上傳的 .md 整理規則 */
  customGuide?: { name?: string; markdown: string };
}

export interface ResolvedCustomGuide {
  name?: string;
  markdown: string;
  overrides: CustomGuideOverrides;
}

/** 僅在 markdown 非空時回傳；未載入規則時為 undefined，不影響 AI 整理 */
export function resolveCustomGuide(input?: {
  name?: string;
  markdown?: string;
}): ResolvedCustomGuide | undefined {
  const markdown = input?.markdown?.trim();
  if (!markdown) return undefined;
  return {
    name: input?.name?.trim() || 'user-guide.md',
    markdown,
    overrides: parseCustomGuideOverrides(markdown),
  };
}

function mimeFromPath(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return 'image/png';
}

/** 從本機檔或 base64 建立 SDK 附圖（過大時自動壓縮） */
export async function referenceImageToSdkImage(input: {
  referenceImagePath?: string;
  referenceImageBase64?: string;
  referenceImageName?: string;
}): Promise<SDKImage | null> {
  const label = input.referenceImageName ?? input.referenceImagePath;
  let image: SDKImage | null = null;

  if (input.referenceImageBase64?.trim()) {
    const name = (input.referenceImageName ?? '').toLowerCase();
    const mimeType = name.endsWith('.jpg') || name.endsWith('.jpeg')
      ? 'image/jpeg'
      : name.endsWith('.webp')
        ? 'image/webp'
        : 'image/png';
    image = { data: input.referenceImageBase64.trim(), mimeType };
  } else {
    const filePath = input.referenceImagePath?.trim();
    if (!filePath || !existsSync(filePath)) return null;
    image = {
      data: readFileSync(filePath).toString('base64'),
      mimeType: mimeFromPath(filePath),
    };
  }

  if (!image) return null;
  return optimizeReferenceSdkImage(image, label);
}

function buildCustomGuideBlock(customGuide: { name?: string; markdown: string }): string {
  const overrides = parseCustomGuideOverrides(customGuide.markdown);
  const summary = formatGuideOverridesSummary(overrides);
  const body = truncateCustomGuideMarkdown(customGuide.markdown);
  const compact = useCompactOrganizePrompt();
  if (compact) {
    return (
      `# User guide (${customGuide.name ?? 'user-guide.md'})\n` +
      '硬約束不可覆寫；明確業務規則覆寫 Skill。\n' +
      summary +
      `${body}\n\n`
    );
  }
  return (
    '# User Custom Organize Guide (SUPPLEMENTARY — OVERRIDES SKILL BUSINESS LOGIC WHEN EXPLICIT)\n' +
    `來源檔：${customGuide.name ?? 'user-guide.md'}\n` +
    '硬約束（absRect / figmaId / Group）不可違反；明確業務規則以本檔為準。\n' +
    summary +
    `${body}\n\n`
  );
}

function buildComposedPrompt(
  prompt: string,
  skillText: string,
  hasVisionImage: boolean,
  customGuide?: { name?: string; markdown: string },
): string {
  const compact = useCompactOrganizePrompt();
  const systemPrefix = compact ? SYSTEM_PREFIX_COMPACT : SYSTEM_PREFIX_FULL;
  const visionNote = hasVisionImage
    ? compact
      ? '附圖：依圈選區分組。'
      : '附圖已隨訊息提供：請用視覺辨識圈選區後再分組，不可只靠檔名或路徑猜測。'
    : '';
  const guideBlock = customGuide?.markdown?.trim()
    ? buildCustomGuideBlock(customGuide)
    : '';
  if (compact) {
    return (
      `${systemPrefix}\n\n# Skill\n${skillText}\n\n` +
      guideBlock +
      `${prompt}\n` +
      (guideBlock ? '套用 .md 明確規則；其餘依 Skill。\n' : '') +
      visionNote
    );
  }
  return (
    `${systemPrefix}\n\n` +
    '# Skill (DEFAULT BUSINESS LOGIC — OVERRIDDEN BY EXPLICIT USER .md RULES)\n' +
    `${skillText}\n\n` +
    guideBlock +
    '# Task\n' +
    `${prompt}\n\n` +
    '硬約束與 Skill 預設必守；使用者 .md 中**明確寫出**的業務邏輯優先於 Skill 對應預設。\n' +
    (guideBlock ? '套用使用者 .md 的明確業務規則；未提及處仍依 Skill。\n' : '') +
    visionNote
  );
}

async function runAgentPrompt(
  composedPrompt: string,
  repoRoot: string,
  images?: SDKImage[],
): Promise<string> {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      '未設定 CURSOR_API_KEY。\n' +
        '  1. 至 Cursor Dashboard → Integrations 建立 API Key\n' +
        '  2. PowerShell: $env:CURSOR_API_KEY = "cursor_..."\n' +
        '  3. 或寫入 tools/ai-organizer/.env',
    );
  }

  const model = process.env.CURSOR_MODEL ?? 'composer-2.5';
  const cwd = resolve(process.env.CURSOR_CWD ?? repoRoot);
  const stateRoot = resolve(repoRoot, '.cursor-sdk-state');
  mkdirSync(stateRoot, { recursive: true });

  const agentOptions = {
    apiKey,
    model: { id: model },
    local: { cwd, settingSources: [] },
    platform: {
      workspaceRef: cwd,
      stateRoot,
    },
  };

  if (images?.length) {
    const agent = await Agent.create(agentOptions);
    try {
      const run = await agent.send({ text: composedPrompt, images });
      const result = await run.wait();
      if (result.status === 'error') {
        throw new Error(`Cursor Agent 執行失敗（run=${result.id ?? 'unknown'}）`);
      }
      return typeof result.result === 'string' ? result.result : String(result.result ?? '');
    } finally {
      await agent.close();
    }
  }

  const result = await Agent.prompt(composedPrompt, agentOptions);
  if (result.status === 'error') {
    throw new Error(`Cursor Agent 執行失敗（run=${result.id ?? 'unknown'}）`);
  }
  return typeof result.result === 'string' ? result.result : String(result.result ?? '');
}

export async function callCursorAgent(
  prompt: string,
  repoRoot: string,
  options?: CallCursorAgentOptions,
): Promise<unknown> {
  const skillText = loadOrganizerSkillOrThrow(repoRoot);
  const images = options?.images;
  const composedPrompt = buildComposedPrompt(
    prompt,
    skillText,
    Boolean(images?.length),
    options?.customGuide,
  );

  const estTokens = estimatePromptTokens(composedPrompt);
  console.log(
    `[cursor-organize] prompt size: ${composedPrompt.length} chars (~${estTokens} tokens text${images?.length ? ' + vision image' : ''})` +
      (useCompactOrganizePrompt() ? ' [compact]' : ' [full]'),
  );

  console.log(`Cursor Agent: local cwd=${resolve(process.env.CURSOR_CWD ?? repoRoot)}  model=${process.env.CURSOR_MODEL ?? 'composer-2.5'}`);
  console.log(`Cursor SDK stateRoot=${resolve(repoRoot, '.cursor-sdk-state')}`);
  if (images?.length) {
    console.log(`[cursor-organize] reference image attached (${images.length})`);
  }
  if (options?.customGuide?.markdown?.trim()) {
    console.log(
      `[cursor-organize] custom guide attached: ${options.customGuide.name ?? 'user-guide.md'}`,
    );
    const resolved = resolveCustomGuide(options.customGuide);
    if (resolved?.overrides.buttonGroupMinSize) {
      console.log(
        `[cursor-organize] guide override: buttonGroupMinSize=${resolved.overrides.buttonGroupMinSize}`,
      );
    }
  }

  try {
    const text = await runAgentPrompt(composedPrompt, repoRoot, images);
    return parseAgentJsonFromText(text);
  } catch (err) {
    if (err instanceof CursorAgentError) {
      throw new Error(
        `Cursor Agent 啟動失敗: ${err.message}\n` +
          `  retryable=${err.isRetryable}\n` +
          '  常見原因：API Key 無效、本機 Cursor 未就緒、cwd 路徑錯誤',
      );
    }
    throw err;
  }
}
