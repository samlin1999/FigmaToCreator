import { createHash } from 'crypto';

export interface AssetTreeNode {
  asset?: string;
  children?: AssetTreeNode[];
}

export function collectAssetPaths(root: AssetTreeNode, out = new Set<string>()): Set<string> {
  if (root.asset) out.add(root.asset);
  for (const c of root.children ?? []) collectAssetPaths(c, out);
  return out;
}

export function remapAssetPathsInTree<T extends AssetTreeNode>(
  root: T,
  pathRedirect: Map<string, string>,
): T {
  const asset = root.asset ? pathRedirect.get(root.asset) ?? root.asset : undefined;
  return {
    ...root,
    asset,
    children: (root.children ?? []).map((c) => remapAssetPathsInTree(c, pathRedirect)),
  } as T;
}

export interface DedupeAssetsByMd5Result<T extends AssetTreeNode> {
  root: T;
  pathRedirect: Map<string, string>;
  /** 有成功讀到檔案的 asset 路徑數 */
  totalAssets: number;
  uniqueImages: number;
  deduplicatedCount: number;
}

function md5Hex(buffer: Buffer): string {
  return createHash('md5').update(buffer).digest('hex');
}

/**
 * 依檔案內容 MD5 合併重複 asset 路徑：保留排序後第一個路徑，其餘改指向該路徑。
 */
export function dedupeAssetPathsByMd5<T extends AssetTreeNode>(
  root: T,
  readAssetFile: (assetPath: string) => Buffer | null | undefined,
): DedupeAssetsByMd5Result<T> {
  const paths = [...collectAssetPaths(root)].sort();
  const md5ToKeepPath = new Map<string, string>();
  const pathRedirect = new Map<string, string>();
  let totalAssets = 0;

  for (const rel of paths) {
    const buffer = readAssetFile(rel);
    if (!buffer?.length) continue;

    totalAssets++;
    const hash = md5Hex(buffer);
    const keepPath = md5ToKeepPath.get(hash);

    if (keepPath) {
      if (keepPath !== rel) pathRedirect.set(rel, keepPath);
      continue;
    }

    md5ToKeepPath.set(hash, rel);
  }

  const uniqueImages = md5ToKeepPath.size;
  const deduplicatedCount = Math.max(0, totalAssets - uniqueImages);
  const remappedRoot = pathRedirect.size ? remapAssetPathsInTree(root, pathRedirect) : root;

  return {
    root: remappedRoot,
    pathRedirect,
    totalAssets,
    uniqueImages,
    deduplicatedCount,
  };
}
