/// <reference path="./types.d.ts" />

import { readFileSync } from 'fs';
import { join } from 'path';
import { dedupeFigmaImportForPrefab } from './dedupe-figma-assets';

const EXT_NAME = 'figma-importer';

async function runGeneratePrefabFromIR(irPath: string): Promise<void> {
  const raw = readFileSync(irPath, 'utf8');
  const parsed = JSON.parse(raw) as Record<string, unknown>;

  const dedupe = dedupeFigmaImportForPrefab(parsed, irPath, Editor.Project.path);
  const ir = dedupe.ir;
  if (dedupe.deduplicatedCount > 0) {
    console.log(
      `[${EXT_NAME}] 貼圖 MD5 去重：${dedupe.totalAssets} → ${dedupe.uniqueImages}（合併 ${dedupe.deduplicatedCount} 張，已更新 IR）`,
    );
  }

  await Editor.Message.request('asset-db', 'refresh-asset', 'db://assets/figma-import');

  const exportName = ir?.source?.pageName ?? ir?.source?.frameName ?? ir?.root?.name ?? 'FigmaImport';
  const prefabDir = `db://assets/prefabs/figma/${exportName}.prefab`;

  const buildResult = (await Editor.Message.request('scene', 'execute-scene-script', {
    name: 'figma-importer',
    method: 'buildPrefabFromIR',
    args: [ir, prefabDir],
  })) as { ok?: boolean; rootUuid?: string; error?: string; missingAssets?: string[] };

  if (!buildResult?.ok || !buildResult.rootUuid) {
    console.error(`[${EXT_NAME}] 建立節點樹失敗:`, buildResult?.error ?? buildResult);
    return;
  }

  if (buildResult.missingAssets?.length) {
    console.warn(
      `[${EXT_NAME}] 以下貼圖未掛載（請確認 PNG 已放入 assets/figma-import/）：`,
      buildResult.missingAssets,
    );
  }

  try {
    const prefabUuid = await Editor.Message.request(
      'scene',
      'create-prefab',
      buildResult.rootUuid,
      prefabDir,
    );
    console.log(`[${EXT_NAME}] Prefab 已建立: ${prefabDir} (${String(prefabUuid)})`);
    await Editor.Message.request('asset-db', 'refresh-asset', prefabDir);
  } catch (e) {
    console.error(`[${EXT_NAME}] create-prefab 失敗:`, e);
  } finally {
    await Editor.Message.request('scene', 'execute-scene-script', {
      name: 'figma-importer',
      method: 'removeNodeByUuid',
      args: [buildResult.rootUuid],
    });
  }
}

/** Cocos Creator 擴展 message 必須掛在 exports.methods 下 */
export const methods = {
  openPanel(): void {
    Editor.Panel.open('figma-importer');
  },

  async importFromDialog(): Promise<void> {
    const result = await Editor.Dialog.select({
      title: '選擇 Figma IR JSON',
      path: join(Editor.Project.path, 'assets', 'figma-import'),
      type: 'file',
      filters: [{ name: 'IR JSON', extensions: ['json'] }],
    });
    if (result.canceled || !result.filePaths?.length) return;
    await runGeneratePrefabFromIR(result.filePaths[0]);
  },

  async generatePrefabFromIR(irPath: string): Promise<void> {
    await runGeneratePrefabFromIR(irPath);
  },
};

export function load(): void {
  console.log(`[${EXT_NAME}] 擴展已載入`);
}

export function unload(): void {
  console.log(`[${EXT_NAME}] 擴展已卸載`);
}
