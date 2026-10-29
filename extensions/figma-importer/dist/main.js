var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  load: () => load,
  methods: () => methods,
  unload: () => unload
});
module.exports = __toCommonJS(main_exports);
var import_fs2 = require("fs");
var import_path2 = require("path");

// src/dedupe-figma-assets.ts
var import_fs = require("fs");
var import_path = require("path");

// ../../shared/dedupe-assets.ts
var import_crypto = require("crypto");
function collectAssetPaths(root, out = /* @__PURE__ */ new Set()) {
  if (root.asset) out.add(root.asset);
  for (const c of root.children ?? []) collectAssetPaths(c, out);
  return out;
}
function remapAssetPathsInTree(root, pathRedirect) {
  const asset = root.asset ? pathRedirect.get(root.asset) ?? root.asset : void 0;
  return {
    ...root,
    asset,
    children: (root.children ?? []).map((c) => remapAssetPathsInTree(c, pathRedirect))
  };
}
function md5Hex(buffer) {
  return (0, import_crypto.createHash)("md5").update(buffer).digest("hex");
}
function dedupeAssetPathsByMd5(root, readAssetFile) {
  const paths = [...collectAssetPaths(root)].sort();
  const md5ToKeepPath = /* @__PURE__ */ new Map();
  const pathRedirect = /* @__PURE__ */ new Map();
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
    deduplicatedCount
  };
}

// src/dedupe-figma-assets.ts
function resolveAssetFileCandidates(assetPath, figmaImportRoot) {
  const norm = assetPath.replace(/\\/g, "/").replace(/^\/+/, "");
  const fileName = norm.split("/").pop() ?? norm;
  const flatFromPath = norm.replace(/\//g, "__");
  const uniq = /* @__PURE__ */ new Set([
    (0, import_path.join)(figmaImportRoot, norm),
    (0, import_path.join)(figmaImportRoot, flatFromPath),
    (0, import_path.join)(figmaImportRoot, fileName)
  ]);
  return [...uniq];
}
function readAssetWithCache(assetPath, figmaImportRoot, cache) {
  if (cache.has(assetPath)) return cache.get(assetPath) ?? null;
  for (const filePath of resolveAssetFileCandidates(assetPath, figmaImportRoot)) {
    if (!(0, import_fs.existsSync)(filePath)) continue;
    const buffer = (0, import_fs.readFileSync)(filePath);
    cache.set(assetPath, buffer);
    return buffer;
  }
  cache.set(assetPath, null);
  return null;
}
function deleteAssetFiles(assetPath, figmaImportRoot) {
  for (const filePath of resolveAssetFileCandidates(assetPath, figmaImportRoot)) {
    if (!(0, import_fs.existsSync)(filePath)) continue;
    try {
      (0, import_fs.unlinkSync)(filePath);
    } catch {
    }
    return;
  }
}
function dedupeFigmaImportForPrefab(ir, irFilePath, projectPath) {
  const root = ir.root;
  if (!root) {
    return { ir, totalAssets: 0, uniqueImages: 0, deduplicatedCount: 0 };
  }
  const figmaImportRoot = (0, import_path.join)(projectPath, "assets", "figma-import");
  const cache = /* @__PURE__ */ new Map();
  const deduped = dedupeAssetPathsByMd5(
    root,
    (assetPath) => readAssetWithCache(assetPath, figmaImportRoot, cache)
  );
  const newIr = { ...ir, root: deduped.root };
  if (deduped.deduplicatedCount > 0) {
    for (const dupPath of deduped.pathRedirect.keys()) {
      deleteAssetFiles(dupPath, figmaImportRoot);
    }
    (0, import_fs.writeFileSync)(irFilePath, JSON.stringify(newIr, null, 2), "utf8");
  }
  return {
    ir: newIr,
    totalAssets: deduped.totalAssets,
    uniqueImages: deduped.uniqueImages,
    deduplicatedCount: deduped.deduplicatedCount
  };
}

// src/main.ts
var EXT_NAME = "figma-importer";
async function runGeneratePrefabFromIR(irPath) {
  const raw = (0, import_fs2.readFileSync)(irPath, "utf8");
  const parsed = JSON.parse(raw);
  const dedupe = dedupeFigmaImportForPrefab(parsed, irPath, Editor.Project.path);
  const ir = dedupe.ir;
  if (dedupe.deduplicatedCount > 0) {
    console.log(
      `[${EXT_NAME}] \u8CBC\u5716 MD5 \u53BB\u91CD\uFF1A${dedupe.totalAssets} \u2192 ${dedupe.uniqueImages}\uFF08\u5408\u4F75 ${dedupe.deduplicatedCount} \u5F35\uFF0C\u5DF2\u66F4\u65B0 IR\uFF09`
    );
  }
  await Editor.Message.request("asset-db", "refresh-asset", "db://assets/figma-import");
  const exportName = ir?.source?.pageName ?? ir?.source?.frameName ?? ir?.root?.name ?? "FigmaImport";
  const prefabDir = `db://assets/prefabs/figma/${exportName}.prefab`;
  const buildResult = await Editor.Message.request("scene", "execute-scene-script", {
    name: "figma-importer",
    method: "buildPrefabFromIR",
    args: [ir, prefabDir]
  });
  if (!buildResult?.ok || !buildResult.rootUuid) {
    console.error(`[${EXT_NAME}] \u5EFA\u7ACB\u7BC0\u9EDE\u6A39\u5931\u6557:`, buildResult?.error ?? buildResult);
    return;
  }
  if (buildResult.missingAssets?.length) {
    console.warn(
      `[${EXT_NAME}] \u4EE5\u4E0B\u8CBC\u5716\u672A\u639B\u8F09\uFF08\u8ACB\u78BA\u8A8D PNG \u5DF2\u653E\u5165 assets/figma-import/\uFF09\uFF1A`,
      buildResult.missingAssets
    );
  }
  try {
    const prefabUuid = await Editor.Message.request(
      "scene",
      "create-prefab",
      buildResult.rootUuid,
      prefabDir
    );
    console.log(`[${EXT_NAME}] Prefab \u5DF2\u5EFA\u7ACB: ${prefabDir} (${String(prefabUuid)})`);
    await Editor.Message.request("asset-db", "refresh-asset", prefabDir);
  } catch (e) {
    console.error(`[${EXT_NAME}] create-prefab \u5931\u6557:`, e);
  } finally {
    await Editor.Message.request("scene", "execute-scene-script", {
      name: "figma-importer",
      method: "removeNodeByUuid",
      args: [buildResult.rootUuid]
    });
  }
}
var methods = {
  openPanel() {
    Editor.Panel.open("figma-importer");
  },
  async importFromDialog() {
    const result = await Editor.Dialog.select({
      title: "\u9078\u64C7 Figma IR JSON",
      path: (0, import_path2.join)(Editor.Project.path, "assets", "figma-import"),
      type: "file",
      filters: [{ name: "IR JSON", extensions: ["json"] }]
    });
    if (result.canceled || !result.filePaths?.length) return;
    await runGeneratePrefabFromIR(result.filePaths[0]);
  },
  async generatePrefabFromIR(irPath) {
    await runGeneratePrefabFromIR(irPath);
  }
};
function load() {
  console.log(`[${EXT_NAME}] \u64F4\u5C55\u5DF2\u8F09\u5165`);
}
function unload() {
  console.log(`[${EXT_NAME}] \u64F4\u5C55\u5DF2\u5378\u8F09`);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  load,
  methods,
  unload
});
