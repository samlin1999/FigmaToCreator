import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { dedupeAssetPathsByMd5 } from '../../../shared/dedupe-assets';

export interface DedupeFigmaImportResult {
  ir: Record<string, unknown>;
  totalAssets: number;
  uniqueImages: number;
  deduplicatedCount: number;
}

/** 與 scene.ts 的 buildDbPathCandidates 對齊的磁碟路徑候選 */
export function resolveAssetFileCandidates(assetPath: string, figmaImportRoot: string): string[] {
  const norm = assetPath.replace(/\\/g, '/').replace(/^\/+/, '');
  const fileName = norm.split('/').pop() ?? norm;
  const flatFromPath = norm.replace(/\//g, '__');
  const uniq = new Set<string>([
    join(figmaImportRoot, norm),
    join(figmaImportRoot, flatFromPath),
    join(figmaImportRoot, fileName),
  ]);
  return [...uniq];
}

function readAssetWithCache(
  assetPath: string,
  figmaImportRoot: string,
  cache: Map<string, Buffer | null>,
): Buffer | null {
  if (cache.has(assetPath)) return cache.get(assetPath) ?? null;

  for (const filePath of resolveAssetFileCandidates(assetPath, figmaImportRoot)) {
    if (!existsSync(filePath)) continue;
    const buffer = readFileSync(filePath);
    cache.set(assetPath, buffer);
    return buffer;
  }

  cache.set(assetPath, null);
  return null;
}

function deleteAssetFiles(assetPath: string, figmaImportRoot: string): void {
  for (const filePath of resolveAssetFileCandidates(assetPath, figmaImportRoot)) {
    if (!existsSync(filePath)) continue;
    try {
      unlinkSync(filePath);
    } catch {
      /* 略過刪除失敗（檔案被鎖定等） */
    }
    return;
  }
}

/**
 * 生成 Prefab 前：比對 IR 引用之 PNG 的 MD5，合併重複並寫回 IR、刪除重複檔案。
 */
export function dedupeFigmaImportForPrefab(
  ir: Record<string, unknown>,
  irFilePath: string,
  projectPath: string,
): DedupeFigmaImportResult {
  const root = ir.root as { asset?: string; children?: unknown[] } | undefined;
  if (!root) {
    return { ir, totalAssets: 0, uniqueImages: 0, deduplicatedCount: 0 };
  }

  const figmaImportRoot = join(projectPath, 'assets', 'figma-import');
  const cache = new Map<string, Buffer | null>();

  const deduped = dedupeAssetPathsByMd5(root, (assetPath) =>
    readAssetWithCache(assetPath, figmaImportRoot, cache),
  );

  const newIr = { ...ir, root: deduped.root };

  if (deduped.deduplicatedCount > 0) {
    for (const dupPath of deduped.pathRedirect.keys()) {
      deleteAssetFiles(dupPath, figmaImportRoot);
    }
    writeFileSync(irFilePath, JSON.stringify(newIr, null, 2), 'utf8');
  }

  return {
    ir: newIr,
    totalAssets: deduped.totalAssets,
    uniqueImages: deduped.uniqueImages,
    deduplicatedCount: deduped.deduplicatedCount,
  };
}
