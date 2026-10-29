import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { estimatePromptTokens } from '../../../shared/agent-prompt-format';
import { applyAgentPlan, buildAgentPrompt, validateAgentPlan } from './apply-plan';
import { buildHeuristicPlan } from './heuristic-agent';
import { loadEnvFiles } from './load-env';
import { isOrganizedIR, normalizeAgentPlan } from './normalize-plan';
import { organizeWithCursor } from './organize-service';
import type { AgentOrganizePlan, IRDocumentLike } from '../../../shared/agent-plan-types';

const REPO_ROOT = resolve(__dirname, '../../..');

loadEnvFiles(resolve(__dirname));
loadEnvFiles(resolve(__dirname, '..'));
loadEnvFiles(REPO_ROOT);

function irBasePath(irPath: string): string {
  return irPath.replace(/\.ir\.json$/i, '');
}

function parseArgs(argv: string[]) {
  const args = {
    heuristic: false,
    prompt: false,
    promptFull: false,
    planOnly: false,
    validate: false,
    checkEnv: false,
    plan: '',
    ir: '',
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--heuristic') args.heuristic = true;
    else if (a === '--prompt') args.prompt = true;
    else if (a === '--prompt-full') {
      args.prompt = true;
      args.promptFull = true;
    }
    else if (a === '--plan-only') args.planOnly = true;
    else if (a === '--validate') args.validate = true;
    else if (a === '--check-env') args.checkEnv = true;
    else if (a === '--plan') args.plan = argv[++i] ?? '';
    else if (!a.startsWith('-')) args.ir = a;
  }
  return args;
}

function printUsage(): void {
  console.log(`用法:
  npm run organize:cursor -- <page.ir.json>
  npm run organize -- <page.ir.json> --prompt
  npm run organize -- <page.ir.json> --prompt-full   # 完整節點欄位（除錯用）
  npm run organize -- <page.ir.json> --plan-only
  npm run organize -- <page.ir.json> --plan <page.agent-plan.json>
  npm run organize -- <page.ir.json> --heuristic
  npm run organize -- --check-env

重要：請使用 Figma 匯出的「原始 IR」，不要用 *.organized.ir.json 當輸入。

環境變數（可寫入 tools/ai-organizer/.env）:
  CURSOR_API_KEY    必填（Cursor Dashboard → Integrations）
  CURSOR_MODEL      選填，預設 composer-2.5
  CURSOR_CWD        選填，Local Agent 工作目錄，預設 FigmaToCreator 根目錄
  FTC_ORGANIZE_FULL_SKILL=1   完整 SKILL（預設已開；設 0 或 FTC_ORGANIZE_COMPACT=1 用精簡版）
  FTC_ORGANIZE_GUIDE_MAX_CHARS  使用者 .md 上限（預設 3500）
  FTC_ORGANIZE_IMAGE_COMPRESS_B64  示意圖壓縮門檻 base64 字元（預設 400000）

PowerShell:
  $env:CURSOR_API_KEY = "cursor_..."
  npm run organize:cursor -- "..\\..\\assets\\figma-import\\Login.ir.json"`);
}

function savePlan(irPath: string, plan: AgentOrganizePlan): string {
  const planPath = `${irBasePath(irPath)}.agent-plan.json`;
  writeFileSync(planPath, JSON.stringify(plan, null, 2), 'utf8');
  return planPath;
}

async function main() {
  const loadedEnv = loadEnvFiles(resolve(__dirname, '..'));
  const args = parseArgs(process.argv);

  if (args.checkEnv) {
    console.log('已載入 .env:', loadedEnv.length ? loadedEnv.join('\n  ') : '(無)');
    console.log('CURSOR_API_KEY:', process.env.CURSOR_API_KEY ? '已設定 ✓' : '未設定 ✗');
    console.log('CURSOR_MODEL:', process.env.CURSOR_MODEL ?? '(預設 composer-2.5)');
    console.log('CURSOR_CWD:', process.env.CURSOR_CWD ?? REPO_ROOT);
    process.exit(process.env.CURSOR_API_KEY ? 0 : 1);
  }

  if (!args.ir) {
    printUsage();
    process.exit(1);
  }

  const irPath = resolve(args.ir);
  const ir = JSON.parse(readFileSync(irPath, 'utf8')) as IRDocumentLike;

  if (args.prompt) {
    if (isOrganizedIR(ir)) {
      console.warn('警告：此 IR 已是 organized 版本，prompt 可能不準確。建議改用 Figma 原始匯出。');
    }
    const outPath = `${irBasePath(irPath)}.agent-prompt.md`;
    const taskPrompt = buildAgentPrompt(ir, { full: args.promptFull, prettyNodes: args.promptFull });
    writeFileSync(outPath, taskPrompt, 'utf8');
    console.log('已輸出 prompt:', outPath);
    console.log(`Task 約 ${estimatePromptTokens(taskPrompt)} tokens（不含 Skill / .md / 示意圖）`);
    console.log('也可直接執行 npm run organize:cursor -- 自動呼叫 Cursor Agent');
    return;
  }

  let plan: AgentOrganizePlan;
  if (args.plan) {
    plan = normalizeAgentPlan(JSON.parse(readFileSync(resolve(args.plan), 'utf8')), ir);
  } else {
    if (isOrganizedIR(ir)) {
      throw new Error(
        '此 IR 已是 organized 版本（含 [FTC] 虛擬容器或 organizedBy）。\n' +
          '  請從 Figma Plugin 重新匯出「原始 IR」（未整理），再執行 CLI + Cursor。',
      );
    }
    if (args.heuristic) {
      plan = buildHeuristicPlan(ir);
    } else {
      console.log('呼叫 Cursor Agent 產生 Agent Plan…');
      const result = await organizeWithCursor(ir, REPO_ROOT);
      plan = result.plan;
    }
  }

  const validation = validateAgentPlan(ir, plan);
  if (validation.ok === false) {
    console.error('Plan 驗證失敗:');
    for (const err of validation.errors) console.error('  -', err);
    console.error('\n建議：重跑 Cursor Agent，或手改 .agent-plan.json，或改用 --heuristic。');
    process.exit(1);
  }
  if (args.validate) {
    console.log('Plan 驗證通過');
    return;
  }

  const planPath = savePlan(irPath, plan);
  console.log('已輸出 plan:', planPath);
  console.log('organizer:', plan.organizer);
  if (plan.summary) console.log('summary:', plan.summary);

  if (args.planOnly) return;

  const organized = applyAgentPlan(ir, plan);
  const outPath = `${irBasePath(irPath)}.organized.ir.json`;
  writeFileSync(outPath, JSON.stringify(organized, null, 2), 'utf8');
  console.log('已輸出 organized IR:', outPath);
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
