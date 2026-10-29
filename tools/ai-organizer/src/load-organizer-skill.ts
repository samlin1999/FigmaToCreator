import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { useCompactOrganizePrompt } from '../../../shared/organize-prompt-config';

export function loadOrganizerSkillOrThrow(repoRoot: string): string {
  const skillDir = resolve(
    repoRoot,
    '.cursor',
    'skills',
    'figma-hierarchy-organize',
  );
  const compactPath = resolve(skillDir, 'SKILL.compact.md');
  const fullPath = resolve(
    process.env.FTC_ORGANIZE_SKILL_PATH ?? resolve(skillDir, 'SKILL.md'),
  );

  const useCompact = useCompactOrganizePrompt();
  const primary = useCompact && existsSync(compactPath) ? compactPath : fullPath;

  if (!existsSync(primary)) {
    throw new Error(
      `找不到 hierarchy skill：${primary}\n` +
        (useCompact ? `（亦找不到精簡版 ${compactPath}）\n` : '') +
        '請確認 .cursor/skills/figma-hierarchy-organize/SKILL.md 存在。',
    );
  }

  try {
    const text = readFileSync(primary, 'utf8').trim();
    if (!text) throw new Error(`hierarchy skill 為空：${primary}`);
    console.log(
      `[cursor-organize] skill loaded: ${primary}${useCompact && primary === compactPath ? ' (compact)' : ' (full)'}`,
    );
    return text;
  } catch (e) {
    throw new Error(`[cursor-organize] 讀取 skill 失敗：${primary} (${String(e)})`);
  }
}
