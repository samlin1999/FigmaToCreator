var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var scene_exports = {};
__export(scene_exports, {
  load: () => load,
  methods: () => methods,
  unload: () => unload
});
module.exports = __toCommonJS(scene_exports);
var import_path = require("path");
var cc = __toESM(require("cc"));
module.paths.push((0, import_path.join)(Editor.App.path, "node_modules"));
const FIGMA_IMPORT_ROOT = "db://assets/figma-import";
const PREFAB_ANCHOR_X = 0.5;
const PREFAB_ANCHOR_Y = 0.5;
function relativeFromAbs(nodeAbs, parentAbs) {
  return {
    x: nodeAbs.x - parentAbs.x,
    y: nodeAbs.y - parentAbs.y,
    width: nodeAbs.width,
    height: nodeAbs.height
  };
}
function hexToColor(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return new cc.Color(r, g, b, 255);
}
function resolveAbsRect(nodeData, parentAbs) {
  if (nodeData.absRect) return nodeData.absRect;
  const rel = nodeData.rect;
  return {
    x: parentAbs.x + rel.x,
    y: parentAbs.y + rel.y,
    width: rel.width,
    height: rel.height
  };
}
function positionForCenterAnchor(rel, parentAbs) {
  return {
    x: -parentAbs.width / 2 + rel.x + rel.width * PREFAB_ANCHOR_X,
    y: parentAbs.height / 2 - rel.y - rel.height * PREFAB_ANCHOR_Y
  };
}
function setupTransform(node, rel, parentAbs) {
  const ui = node.getComponent(cc.UITransform) ?? node.addComponent(cc.UITransform);
  ui.setContentSize(rel.width, rel.height);
  ui.setAnchorPoint(PREFAB_ANCHOR_X, PREFAB_ANCHOR_Y);
  const pos = positionForCenterAnchor(rel, parentAbs);
  node.setPosition(pos.x, pos.y, 0);
}
function buildDbPathCandidates(assetPath) {
  const norm = assetPath.replace(/\\/g, "/").replace(/^\/+/, "");
  const fileName = norm.split("/").pop() ?? norm;
  const flatFromPath = norm.replace(/\//g, "__");
  const uniq = /* @__PURE__ */ new Set([
    `${FIGMA_IMPORT_ROOT}/${norm}`,
    `${FIGMA_IMPORT_ROOT}/${flatFromPath}`,
    `${FIGMA_IMPORT_ROOT}/${fileName}`
  ]);
  return [...uniq];
}
async function querySpriteFrameUuid(imageDbPath) {
  const urls = [`${imageDbPath}@f9941`, imageDbPath];
  for (const url of urls) {
    try {
      const info = await Editor.Message.request("asset-db", "query-asset-info", url);
      if (!info?.uuid) continue;
      const label = `${info.type ?? ""} ${info.importer ?? ""}`;
      if (label.includes("sprite-frame") || url.endsWith("@f9941")) {
        return info.uuid;
      }
    } catch {
    }
  }
  return null;
}
async function loadSpriteFrameByUuid(uuid) {
  const cached = cc.assetManager.assets.get(uuid);
  if (cached instanceof cc.SpriteFrame) {
    return cached;
  }
  return new Promise((resolve) => {
    cc.assetManager.loadAny(uuid, (err, asset) => {
      resolve(err || !asset ? null : asset);
    });
  });
}
async function loadSpriteFrame(assetPath) {
  for (const dbPath of buildDbPathCandidates(assetPath)) {
    const uuid = await querySpriteFrameUuid(dbPath);
    if (!uuid) continue;
    const spriteFrame = await loadSpriteFrameByUuid(uuid);
    if (spriteFrame) {
      return { spriteFrame, resolvedPath: dbPath };
    }
  }
  return { spriteFrame: null };
}
async function attachSprite(node, assetPath, missingAssets) {
  const sprite = node.getComponent(cc.Sprite) ?? node.addComponent(cc.Sprite);
  const { spriteFrame } = await loadSpriteFrame(assetPath);
  if (spriteFrame) {
    sprite.spriteFrame = spriteFrame;
    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    return;
  }
  missingAssets.push(assetPath);
  console.warn(`[figma-importer] \u627E\u4E0D\u5230\u8CBC\u5716: ${assetPath}\uFF08\u5DF2\u5617\u8A66 figma-import \u5167\u591A\u7A2E\u8DEF\u5F91\uFF09`);
}
function isVirtualContainer(node) {
  return node.figmaType === "VIRTUAL" || node.figmaId.startsWith("vc_");
}
function isOrganizedPageRoot(parent, children) {
  const isPage = parent.type === "page" || parent.figmaType === "PAGE";
  return isPage && children.some((c) => isVirtualContainer(c));
}
function zOrderKey(node) {
  const roleRank = {
    background: 0,
    content: 100,
    list: 200,
    header: 300,
    footer: 400,
    overlay: 500,
    custom: 600
  };
  return roleRank[node.containerRole ?? "custom"] ?? 999;
}
function minPaintOrderInTree(node) {
  const values = [];
  if (typeof node.paintOrder === "number") values.push(node.paintOrder);
  for (const c of node.children ?? []) {
    const sub = minPaintOrderInTree(c);
    if (sub !== null) values.push(sub);
  }
  return values.length ? Math.min(...values) : null;
}
function effectiveZOrder(node) {
  const painted = minPaintOrderInTree(node);
  if (painted !== null) return painted;
  return zOrderKey(node);
}
function orderChildrenForCocos(children, parent) {
  if (!children.length) return children;
  const hasSubtreePaint = children.some((c) => minPaintOrderInTree(c) !== null);
  if (hasSubtreePaint || children.every((c) => typeof c.paintOrder === "number")) {
    return [...children].sort((a, b) => effectiveZOrder(a) - effectiveZOrder(b));
  }
  if (isVirtualContainer(parent) || isOrganizedPageRoot(parent, children)) {
    return [...children].sort((a, b) => zOrderKey(a) - zOrderKey(b));
  }
  return [...children].reverse();
}
function shouldAttachLabel(nodeData) {
  return Boolean(nodeData.text?.length) || nodeData.figmaType === "TEXT";
}
function attachLabel(node, nodeData, nodeAbs) {
  if (!nodeData.text) return;
  const label = node.addComponent(cc.Label);
  label.string = nodeData.text;
  const fontSize = nodeData.fontSize ?? 24;
  label.fontSize = fontSize;
  label.lineHeight = Math.round(fontSize * 1.2);
  label.enableWrapText = false;
  const isNarrow = nodeAbs.width < fontSize * 0.75;
  if (isNarrow) {
    label.horizontalAlign = cc.HorizontalTextAlignment.CENTER;
    label.verticalAlign = cc.VerticalTextAlignment.CENTER;
    label.overflow = cc.Label.Overflow.NONE;
  } else {
    label.horizontalAlign = cc.HorizontalTextAlignment.LEFT;
    label.overflow = cc.Label.Overflow.CLAMP;
    const isTallTextBox = nodeAbs.height > fontSize * 1.6;
    label.verticalAlign = isTallTextBox ? cc.VerticalTextAlignment.CENTER : cc.VerticalTextAlignment.TOP;
  }
  if (nodeData.textColor) {
    label.color = hexToColor(nodeData.textColor);
  }
}
async function buildNodeTree(nodeData, parent, parentAbs, missingAssets, parentActive = true) {
  if (nodeData.included === false) return null;
  const nodeAbs = resolveAbsRect(nodeData, parentAbs);
  const rel = relativeFromAbs(nodeAbs, parentAbs);
  const node = new cc.Node(nodeData.name);
  const selfActive = parentActive && nodeData.visible !== false;
  node.active = selfActive;
  setupTransform(node, rel, parentAbs);
  parent.addChild(node);
  if (shouldAttachLabel(nodeData)) {
    attachLabel(node, nodeData, nodeAbs);
  } else if (nodeData.type === "button") {
    if (nodeData.asset) {
      await attachSprite(node, nodeData.asset, missingAssets);
    }
  } else if (nodeData.asset) {
    await attachSprite(node, nodeData.asset, missingAssets);
  }
  for (const child of orderChildrenForCocos(nodeData.children ?? [], nodeData)) {
    await buildNodeTree(child, node, nodeAbs, missingAssets, selfActive);
  }
  return node;
}
const methods = {
  async buildPrefabFromIR(ir, _prefabSaveUrl) {
    try {
      const scene = cc.director.getScene();
      if (!scene) {
        return { ok: false, error: "\u8ACB\u5148\u958B\u555F\u4E00\u500B\u5834\u666F\u518D\u532F\u5165" };
      }
      const missingAssets = [];
      const rootAbs = resolveAbsRect(ir.root, { x: 0, y: 0, width: 0, height: 0 });
      const root = new cc.Node(ir.root.name);
      const sceneOrigin = { x: 0, y: 0, width: 0, height: 0 };
      setupTransform(
        root,
        {
          x: rootAbs.x,
          y: rootAbs.y,
          width: rootAbs.width,
          height: rootAbs.height
        },
        sceneOrigin
      );
      scene.addChild(root);
      for (const child of orderChildrenForCocos(ir.root.children ?? [], ir.root)) {
        await buildNodeTree(child, root, rootAbs, missingAssets);
      }
      return {
        ok: true,
        rootUuid: root.uuid,
        rootName: root.name,
        missingAssets
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, error: msg };
    }
  },
  removeNodeByUuid(uuid) {
    const scene = cc.director.getScene();
    if (!scene) return { ok: false };
    const queue = [scene];
    while (queue.length) {
      const n = queue.shift();
      if (n.uuid === uuid) {
        n.destroy();
        return { ok: true };
      }
      queue.push(...n.children);
    }
    return { ok: false };
  }
};
function load() {
}
function unload() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  load,
  methods,
  unload
});
