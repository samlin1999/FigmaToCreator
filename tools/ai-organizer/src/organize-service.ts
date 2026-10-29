import { applyAgentPlan, buildAgentPrompt, buildReferenceAgentPrompt, validateAgentPlan } from './apply-plan';
import { callCursorAgent, referenceImageToSdkImage, resolveCustomGuide } from './call-cursor';
import { isOrganizedIR, normalizeAgentPlan } from './normalize-plan';
import type { AgentOrganizePlan, IRDocumentLike } from '../../../shared/agent-plan-types';
import {
  validateOrganizedIR,
  type OrganizeValidationReport,
} from '../../../shared/organize-validation';
import { BUTTON_GROUP_MIN_SIZE } from './button-group-bounds';

function buildValidation(
  sourceIr: IRDocumentLike,
  organized: IRDocumentLike,
  options?: { buttonGroupMinSize?: number; referenceOrganize?: boolean },
): OrganizeValidationReport {
  const report = validateOrganizedIR(organized, {
    sourceIr,
    buttonGroupMinSize: options?.buttonGroupMinSize ?? BUTTON_GROUP_MIN_SIZE,
    referenceOrganize: options?.referenceOrganize,
  });
  if (!report.ok || report.warnCount > 0) {
    console.warn(
      `[organize-validation] errors=${report.errorCount} warns=${report.warnCount} infos=${report.infoCount}`,
    );
    for (const issue of report.issues) {
      console.warn(`  [${issue.severity}] ${issue.code}: ${issue.message}`);
    }
  }
  return report;
}

export async function organizeWithCursor(
  ir: IRDocumentLike,
  repoRoot: string,
  options?: { customGuide?: { name?: string; markdown: string } },
): Promise<{ plan: AgentOrganizePlan; organized: IRDocumentLike; validation: OrganizeValidationReport }> {
  if (isOrganizedIR(ir)) {
    throw new Error('IR 已是 organized 版本，請重新解析 Figma Page');
  }

  const customGuide = resolveCustomGuide(options?.customGuide);
  const raw = await callCursorAgent(
    buildAgentPrompt(ir),
    repoRoot,
    customGuide ? { customGuide } : undefined,
  );
  const plan = normalizeAgentPlan(raw, ir);
  plan.organizer = 'cursor-agent';

  const validation = validateAgentPlan(ir, plan);
  if (!validation.ok) {
    const errors = 'errors' in validation ? validation.errors : ['unknown'];
    throw new Error(`Plan 驗證失敗：${errors.join('；')}`);
  }

  const organized = applyAgentPlan(ir, plan, { guideOverrides: customGuide?.overrides });
  const postValidation = buildValidation(ir, organized, {
    buttonGroupMinSize: customGuide?.overrides.buttonGroupMinSize,
  });
  return { plan, organized, validation: postValidation };
}

export async function organizeWithCursorReference(
  ir: IRDocumentLike,
  repoRoot: string,
  options?: {
    referenceImageName?: string;
    referenceImagePath?: string;
    referenceImageBase64?: string;
    customGuide?: { name?: string; markdown: string };
  },
): Promise<{ plan: AgentOrganizePlan; organized: IRDocumentLike; validation: OrganizeValidationReport }> {
  if (isOrganizedIR(ir)) {
    throw new Error('IR 已是 organized 版本，請重新解析 Figma Page');
  }

  const refImage = await referenceImageToSdkImage({
    referenceImagePath: options?.referenceImagePath,
    referenceImageBase64: options?.referenceImageBase64,
    referenceImageName: options?.referenceImageName,
  });
  if (!refImage) {
    throw new Error(
      '找不到示意圖檔案，無法做圈選區分組。請先載入示意圖後再執行 AI 整理。',
    );
  }

  const prompt = buildReferenceAgentPrompt(ir, {
    referenceImageName: options?.referenceImageName,
  });

  const customGuide = resolveCustomGuide(options?.customGuide);
  const raw = await callCursorAgent(prompt, repoRoot, {
    images: [refImage],
    ...(customGuide ? { customGuide } : {}),
  });
  const plan = normalizeAgentPlan(raw, ir);
  plan.organizer = 'cursor-agent';
  if (!plan.summary?.trim()) {
    plan.summary = options?.referenceImageName
      ? `根據 IR 與示意圖(${options.referenceImageName})圈選區生成 hierarchy`
      : '根據 IR 與示意圖圈選區生成 hierarchy';
  }

  const validation = validateAgentPlan(ir, plan);
  if (!validation.ok) {
    const errors = 'errors' in validation ? validation.errors : ['unknown'];
    throw new Error(`Plan 驗證失敗：${errors.join('；')}`);
  }

  const organized = applyAgentPlan(ir, plan, { guideOverrides: customGuide?.overrides });
  const postValidation = buildValidation(ir, organized, {
    buttonGroupMinSize: customGuide?.overrides.buttonGroupMinSize,
    referenceOrganize: true,
  });
  return { plan, organized, validation: postValidation };
}
