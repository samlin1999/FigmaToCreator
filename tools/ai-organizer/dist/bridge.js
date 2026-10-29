"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/bridge-server.ts
var http = __toESM(require("http"));
var import_fs4 = require("fs");
var import_path4 = require("path");

// src/load-env.ts
var import_fs = require("fs");
var import_path = require("path");
function loadEnvFiles(startDir) {
  const loaded = [];
  const candidates = [
    (0, import_path.join)(startDir, ".env"),
    (0, import_path.join)(startDir, ".env.local"),
    (0, import_path.join)((0, import_path.dirname)(startDir), ".env"),
    (0, import_path.join)((0, import_path.dirname)((0, import_path.dirname)(startDir)), ".env")
  ];
  for (const file of candidates) {
    const path = (0, import_path.resolve)(file);
    if (!(0, import_fs.existsSync)(path) || loaded.includes(path)) continue;
    loadEnvFile(path);
    loaded.push(path);
  }
  return loaded;
}
function loadEnvFile(path) {
  const text = (0, import_fs.readFileSync)(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === void 0) {
      process.env[key] = value;
    }
  }
}

// src/layer-name-i18n.ts
var LAYER_NAME_PHRASES = [
  ["\u947D\u77F3\u5E63", "diamond"],
  ["\u91D1\u5E63", "gold"],
  ["\u9280\u5E63", "silver"],
  ["\u9285\u5E63", "copper"],
  ["\u947D\u77F3", "diamond"],
  ["\u5143\u5BF6", "gem"],
  ["\u7D05\u5BF6\u77F3", "ruby"],
  ["\u85CD\u5BF6\u77F3", "sapphire"],
  ["\u7DA0\u5BF6\u77F3", "emerald"],
  ["\u9AD4\u529B", "energy"],
  ["\u8010\u529B", "stamina"],
  ["\u751F\u547D\u503C", "hp"],
  ["\u8840\u91CF", "hp"],
  ["\u9B54\u529B", "mp"],
  ["\u7D93\u9A57", "exp"],
  ["\u7D93\u9A57\u503C", "exp"],
  ["\u6392\u884C\u699C", "rank"],
  ["\u5145\u503C", "recharge"],
  ["\u5132\u503C", "recharge"],
  ["\u516C\u544A", "notice"],
  ["\u90F5\u4EF6", "mail"],
  ["\u4FE1\u7BB1", "mail"],
  ["\u597D\u53CB", "friend"],
  ["\u4EFB\u52D9", "quest"],
  ["\u6D3B\u52D5", "event"],
  ["\u5546\u5E97", "shop"],
  ["\u5546\u57CE", "shop"],
  ["\u80CC\u5305", "bag"],
  ["\u9053\u5177", "item"],
  ["\u88DD\u5099", "equip"],
  ["\u6B66\u5668", "weapon"],
  ["\u982D\u50CF", "avatar"],
  ["\u7A31\u865F", "title"],
  ["\u8A2D\u5B9A", "settings"],
  ["\u8A2D\u7F6E", "settings"],
  ["\u5C0E\u822A", "nav"],
  ["\u5C0E\u89BD", "nav"],
  ["\u8A0A\u606F", "message"],
  ["\u6D88\u606F", "message"],
  ["\u804A\u5929", "chat"],
  ["\u6A19\u984C", "title"],
  ["\u80CC\u666F", "bg"],
  ["\u5E95\u5716", "bg"],
  ["\u8F38\u5165", "input"],
  ["\u8F38\u5165\u6846", "input"],
  ["\u641C\u5C0B", "search"],
  ["\u641C\u7D22", "search"],
  ["\u95DC\u9589", "close"],
  ["\u8FD4\u56DE", "back"],
  ["\u78BA\u8A8D", "confirm"],
  ["\u53D6\u6D88", "cancel"],
  ["\u9818\u53D6", "claim"],
  ["\u514D\u8CBB", "free"],
  ["\u734E\u52F5", "reward"],
  ["\u79AE\u5305", "pack"],
  ["\u79AE\u7269", "gift"],
  ["\u6309\u9215", "btn"],
  ["\u6309\u94AE", "btn"],
  ["\u5716\u793A", "icon"],
  ["\u56FE\u6807", "icon"],
  ["\u5716\u6A19", "icon"],
  ["\u8D27\u5E01", "currency"],
  ["\u8CA8\u5E63", "currency"],
  ["\u5E01\u79CD", "currency"],
  ["\u5E63\u7A2E", "currency"],
  ["\u5DE6\u4E0B", "bottom_left"],
  ["\u53F3\u4E0B", "bottom_right"],
  ["\u5DE6\u4E0A", "top_left"],
  ["\u53F3\u4E0A", "top_right"],
  ["\u5DE6\u5074", "left"],
  ["\u53F3\u5074", "right"],
  ["\u4E0A\u65B9", "top"],
  ["\u4E0B\u65B9", "bottom"],
  ["\u5DE6", "left"],
  ["\u53F3", "right"],
  ["\u4E0A", "top"],
  ["\u4E0B", "bottom"],
  // 簡體常見別字
  ["\u94BB\u77F3", "diamond"],
  ["\u91D1\u5E01", "gold"],
  ["\u94F6\u5E01", "silver"],
  ["\u6309\u94AE", "btn"],
  ["\u80CC\u666F", "bg"],
  ["\u6807\u9898", "title"],
  ["\u6D88\u606F", "message"],
  ["\u5BFC\u822A", "nav"],
  ["\u5546\u5E97", "shop"],
  ["\u5934\u50CF", "avatar"]
];
var LAYER_NAME_PHRASES_SORTED = [...LAYER_NAME_PHRASES].sort((a, b) => b[0].length - a[0].length);
var NON_LATIN_RE = /[^\u0000-\u007f]/;
var CJK_RE = /[\u4e00-\u9fff\u3040-\u30ff\u3400-\u4dbf\uac00-\ud7af]/g;
function containsNonEnglishLayerName(name) {
  return NON_LATIN_RE.test(name);
}
function translateLayerNameToEnglish(name) {
  const trimmed = name.trim();
  if (!trimmed) return "";
  if (!containsNonEnglishLayerName(trimmed)) {
    return trimmed.replace(/\s+/g, "_");
  }
  let s = trimmed;
  for (const [phrase, en] of LAYER_NAME_PHRASES_SORTED) {
    if (!s.includes(phrase)) continue;
    s = s.split(phrase).join(`_${en}_`);
  }
  s = s.replace(CJK_RE, "_");
  s = s.replace(/[^a-zA-Z0-9_]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  return s || trimmed.replace(/\s+/g, "_");
}
function originalLayerNameForNaming(originalName) {
  return translateLayerNameToEnglish(originalName);
}

// ../../shared/figma-group-preserve.ts
function isFigmaUserGroup(node) {
  return node.figmaType === "GROUP" || node.type === "group";
}
function leafToUserGroupMap(root) {
  const map = /* @__PURE__ */ new Map();
  const walk = (n, groupId) => {
    const gid = isFigmaUserGroup(n) ? n.figmaId : groupId;
    if (gid && n.included !== false) {
      const isVirtual = n.figmaType === "VIRTUAL" || n.figmaId.startsWith("vc_");
      if (!isVirtual && !n.children?.length) map.set(n.figmaId, gid);
    }
    for (const c of n.children ?? []) walk(c, gid);
  };
  for (const c of root.children ?? []) walk(c, null);
  return map;
}
function rewriteChildIds(children, leafToGroup) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const childId of children) {
    const id = leafToGroup.get(childId) ?? childId;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}
function enforceGroupPreservationInPlan(plan, ir) {
  const leafToGroup = leafToUserGroupMap(ir);
  if (!leafToGroup.size) return plan;
  const groupIds = new Set(leafToGroup.values());
  const virtualContainers = (plan.virtualContainers ?? []).map((vc) => ({
    ...vc,
    children: rewriteChildIds(vc.children, leafToGroup)
  }));
  const groupOwner = /* @__PURE__ */ new Map();
  for (const vc of virtualContainers) {
    for (const childId of vc.children) {
      if (groupIds.has(childId) && !groupOwner.has(childId)) {
        groupOwner.set(childId, vc.id);
      }
    }
  }
  for (const vc of virtualContainers) {
    vc.children = vc.children.filter((id) => !groupIds.has(id) || groupOwner.get(id) === vc.id);
  }
  const virtualRoot = plan.virtualRoot ? {
    ...plan.virtualRoot,
    children: rewriteChildIds(plan.virtualRoot.children ?? [], leafToGroup)
  } : plan.virtualRoot;
  return {
    ...plan,
    virtualRoot,
    virtualContainers,
    summary: plan.summary?.includes("Group") ? plan.summary : `${plan.summary ?? ""}\uFF08\u4FDD\u7559 Figma Group \u7D50\u69CB\uFF09`.trim()
  };
}

// src/normalize-plan.ts
function isRecord(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function sanitizeNodeName(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return trimmed.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").replace(/\s+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
}
function unwrapPlan(raw) {
  if (!isRecord(raw)) {
    throw new Error("AI \u56DE\u50B3\u4E0D\u662F JSON \u7269\u4EF6");
  }
  const keys = ["AgentOrganizePlan", "agentOrganizePlan", "plan", "result", "data"];
  for (const key of keys) {
    if (isRecord(raw[key])) return raw[key];
  }
  return raw;
}
function indexFigmaIds(root) {
  const ids = /* @__PURE__ */ new Set();
  function walk(n) {
    if (n.figmaType !== "VIRTUAL" && !n.figmaId.startsWith("vc_")) {
      ids.add(n.figmaId);
    }
    for (const c of n.children) walk(c);
  }
  walk(root);
  return ids;
}
function normalizeAgentPlan(raw, ir) {
  const src = unwrapPlan(raw);
  const validIds = indexFigmaIds(ir.root);
  const vcIds = /* @__PURE__ */ new Set();
  const virtualContainers = Array.isArray(src.virtualContainers) ? src.virtualContainers.filter(isRecord).map((vc) => {
    const id = String(vc.id ?? "");
    vcIds.add(id);
    const children = Array.isArray(vc.children) ? vc.children.map(String).filter((cid) => validIds.has(cid) || cid.startsWith("vc_")) : [];
    const vcName = sanitizeNodeName(String(vc.name ?? id)) || id;
    return {
      id,
      name: vcName,
      containerRole: vc.containerRole ?? "custom",
      layout: isRecord(vc.layout) ? { mode: vc.layout.mode ?? "absolute" } : { mode: "absolute" },
      children,
      organizeHint: typeof vc.organizeHint === "string" ? vc.organizeHint : void 0
    };
  }) : [];
  for (const vc of virtualContainers) {
    vc.children = vc.children.filter((cid) => validIds.has(cid) || vcIds.has(cid));
  }
  const originalLeafNames = /* @__PURE__ */ new Map();
  for (const leaf of collectIncludedLeaves(ir.root)) {
    originalLeafNames.set(leaf.figmaId, leaf.name);
  }
  const nodeHints = {};
  if (isRecord(src.nodeHints)) {
    for (const [figmaId, hintRaw] of Object.entries(src.nodeHints)) {
      if (!validIds.has(figmaId)) continue;
      if (!isRecord(hintRaw)) continue;
      const nameRaw = typeof hintRaw.name === "string" ? sanitizeNodeName(hintRaw.name) : "";
      const mergedName = nameRaw ? mergeNameWithOriginalTokens(originalLeafNames.get(figmaId) ?? "", nameRaw) : "";
      nodeHints[figmaId] = {
        figmaId,
        ...mergedName ? { name: mergedName } : {},
        containerRole: hintRaw.containerRole,
        widget: isRecord(hintRaw.widget) ? hintRaw.widget : void 0,
        layout: isRecord(hintRaw.layout) ? { mode: hintRaw.layout.mode ?? "none" } : void 0,
        organizeHint: typeof hintRaw.organizeHint === "string" ? hintRaw.organizeHint : void 0,
        type: typeof hintRaw.type === "string" ? hintRaw.type : void 0
      };
    }
  }
  const virtualRootChildren = isRecord(src.virtualRoot) && Array.isArray(src.virtualRoot.children) ? src.virtualRoot.children.map(String).filter((id) => vcIds.has(id) || validIds.has(id)) : virtualContainers.map((v) => v.id);
  fillMissingHintNames(nodeHints, ir);
  const leafMap = /* @__PURE__ */ new Map();
  for (const leaf of collectIncludedLeaves(ir.root)) {
    leafMap.set(leaf.figmaId, leaf);
  }
  enforceButtonNamesInPlan(nodeHints, leafMap, virtualContainers);
  const plan = {
    version: "1.0",
    organizer: src.organizer === "heuristic-agent" ? "heuristic-agent" : src.organizer === "cursor-agent" ? "cursor-agent" : "ai-agent",
    preserveVisual: true,
    summary: typeof src.summary === "string" ? src.summary : "AI Agent \u6574\u7406",
    nodeHints,
    virtualRoot: { children: virtualRootChildren },
    virtualContainers
  };
  if (!plan.virtualContainers?.length || !plan.virtualRoot?.children?.length) {
    throw new Error(
      "AI \u56DE\u50B3\u7F3A\u5C11 virtualContainers / virtualRoot\u3002\u8ACB\u91CD\u8DD1 Cursor Agent\uFF0C\u6216\u6539\u7528 --heuristic\u3002"
    );
  }
  return enforceGroupPreservationInPlan(plan, ir.root);
}
function isOrganizedIR(ir) {
  if (ir.organizedBy) return true;
  return (ir.root.children ?? []).some(
    (c) => c.figmaType === "VIRTUAL" || c.figmaId.startsWith("vc_")
  );
}

// src/infer-node-names.ts
var BTN_IN_NAME = /\bbtn\b|_btn_|^btn_/i;
var GENERIC_FIGMA_TOKENS = /* @__PURE__ */ new Set([
  "rectangle",
  "frame",
  "group",
  "component",
  "instance",
  "vector",
  "ellipse",
  "line",
  "path",
  "text",
  "image",
  "slice",
  "section",
  "boolean",
  "union",
  "star",
  "polygon",
  "copy",
  "variant",
  "mask",
  "artboard"
]);
var STRUCTURAL_NAME_TOKENS = /* @__PURE__ */ new Set([
  "btn",
  "button",
  "label",
  "icon",
  "image",
  "sprite",
  "bg",
  "background",
  "tab",
  "panel",
  "elem",
  "page",
  "nav",
  "footer",
  "header",
  "title",
  "input",
  "edit",
  "message",
  "head",
  "item",
  "group",
  "list",
  "content",
  "zone",
  "top",
  "left",
  "right",
  "bottom",
  "mid",
  "custom",
  "layer",
  "root",
  "node"
]);
function tokenizeName(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 2 && !/^\d+$/.test(t));
}
function isGenericFigmaLayerName(name) {
  const trimmed = name.trim();
  if (!trimmed) return true;
  return /^(rectangle|frame|group|ellipse|vector|text|image|component|instance|section)\s*\d*$/i.test(
    trimmed
  );
}
function extractSemanticDescriptorTokens(originalName) {
  const englishName = originalLayerNameForNaming(originalName);
  if (!englishName?.trim() || isGenericFigmaLayerName(englishName)) return [];
  const out = [];
  for (const t of tokenizeName(englishName)) {
    if (GENERIC_FIGMA_TOKENS.has(t) || STRUCTURAL_NAME_TOKENS.has(t)) continue;
    if (!out.includes(t)) out.push(t);
  }
  return out;
}
function mergeNameWithOriginalTokens(originalName, newName) {
  const descriptors = extractSemanticDescriptorTokens(originalName);
  let result = sanitizeNodeName(newName);
  if (!descriptors.length || !result) return result;
  const existing = new Set(tokenizeName(result));
  const missing = descriptors.filter((d) => !existing.has(d));
  if (!missing.length) return result;
  const numbered = result.match(/^(.*?)(_\d{2,})$/);
  const base = numbered ? numbered[1] : result;
  const suffix = numbered ? numbered[2] : "";
  const merged = sanitizeNodeName(`${base}_${missing.join("_")}${suffix}`);
  return merged || result;
}
function isButtonHint(hint, node) {
  if (hint?.type === "button" || node?.type === "button") return true;
  const blob = `${hint?.organizeHint ?? ""} ${hint?.name ?? ""} ${node?.name ?? ""} ${node?.organizeHint ?? ""}`;
  return /按鈕|\bbutton\b/i.test(blob);
}
function isButtonAnnotatedText(text) {
  if (!text?.trim()) return false;
  return /按鈕|\bbutton\b/i.test(text);
}
function ensureBtnInName(name) {
  const n = sanitizeNodeName(name);
  if (!n) return "btn_01";
  if (BTN_IN_NAME.test(n)) return n;
  if (n.startsWith("elem_")) return n.replace(/^elem_/, "btn_");
  return `btn_${n}`;
}
function ratio(v, total) {
  return total > 0 ? v / total : 0;
}
function areaRatio(node, page) {
  const pageArea = page.absRect.width * page.absRect.height;
  if (pageArea <= 0) return 0;
  return node.absRect.width * node.absRect.height / pageArea;
}
function relCenter(node, pageAbs) {
  const cx = node.absRect.x + node.absRect.width / 2;
  const cy = node.absRect.y + node.absRect.height / 2;
  return {
    x: ratio(cx - pageAbs.x, pageAbs.width),
    y: ratio(cy - pageAbs.y, pageAbs.height)
  };
}
function byYThenX(a, b) {
  const dy = a.absRect.y - b.absRect.y;
  if (dy !== 0) return dy;
  return a.absRect.x - b.absRect.x;
}
function collectIncludedLeaves(root) {
  const out = [];
  const walk = (n) => {
    if (n.included === false) return;
    const isVirtual = n.figmaType === "VIRTUAL" || n.figmaId.startsWith("vc_");
    if (!isVirtual && !n.children.length) out.push(n);
    for (const c of n.children ?? []) walk(c);
  };
  for (const c of root.children ?? []) walk(c);
  return out;
}
function inferGenericNamePrefix(node, page) {
  const raw = originalLayerNameForNaming(node.name).toLowerCase();
  const { x: relX, y: relY } = relCenter(node, page.absRect);
  const ar = areaRatio(node, page);
  const nameHit = (re) => re.test(raw);
  if (nameHit(/tab_text|tab.*text/)) return "tab_text";
  if (nameHit(/\btab\b/)) return "tab";
  if (nameHit(/message_text|msg.*text/)) return "message_text";
  if (nameHit(/\bhead\b|avatar|icon_head/)) return "head";
  if (nameHit(/\bmessage\b|\bmsg\b/)) return "message";
  if (nameHit(/edit_text|input_text|placeholder/)) return "edit_text";
  if (nameHit(/\binput\b|\bedit\b/)) return "input";
  if (nameHit(/\btitle\b/)) return "title";
  if (nameHit(/\bbg\b|background/)) return "bg";
  if (ar > 0.5) return "page_bg";
  if (node.type === "label" || node.text) {
    if (relY < 0.22) return "title";
    if (relY > 0.78) return "label_footer";
    return "label";
  }
  if (node.type === "button") return "btn";
  if (node.asset || node.type === "sprite") {
    if (ar > 0.2) return "panel_bg";
    if (relY < 0.25) return "icon_header";
    if (relY > 0.75) return "icon_footer";
    return "image";
  }
  if (relY < 0.33) {
    if (relX < 0.33) return "elem_top_left";
    if (relX > 0.66) return "elem_top_right";
    return "elem_top";
  }
  if (relY > 0.66) {
    if (relX < 0.33) return "elem_bottom_left";
    if (relX > 0.66) return "elem_bottom_right";
    return "elem_bottom";
  }
  if (relX < 0.33) return "elem_mid_left";
  if (relX > 0.66) return "elem_mid_right";
  return "elem";
}
function nextIndexedName(prefix, counters) {
  const n = (counters.get(prefix) ?? 0) + 1;
  counters.set(prefix, n);
  return `${prefix}_${String(n).padStart(2, "0")}`;
}
function applyGenericNamesToLeaves(root, page, options) {
  const skip = options?.skipFigmaIds;
  const leaves = collectIncludedLeaves(root).sort(byYThenX);
  const counters = /* @__PURE__ */ new Map();
  for (const leaf of leaves) {
    if (skip?.has(leaf.figmaId)) continue;
    const prefix = inferGenericNamePrefix(leaf, page);
    const generated = sanitizeNodeName(nextIndexedName(prefix, counters));
    leaf.name = mergeNameWithOriginalTokens(leaf.name, generated);
  }
}
function fillMissingHintNames(nodeHints, ir) {
  const page = ir.root;
  const nodeMap = /* @__PURE__ */ new Map();
  for (const leaf of collectIncludedLeaves(page)) {
    nodeMap.set(leaf.figmaId, leaf);
  }
  const counters = /* @__PURE__ */ new Map();
  const sortedIds = [...nodeMap.keys()].sort((a, b) => {
    const na = nodeMap.get(a);
    const nb = nodeMap.get(b);
    return byYThenX(na, nb);
  });
  for (const figmaId of sortedIds) {
    const hint = nodeHints[figmaId];
    if (hint?.name?.trim()) continue;
    const node = nodeMap.get(figmaId);
    if (!node) continue;
    const prefix = inferGenericNamePrefix(node, page);
    const generated = sanitizeNodeName(nextIndexedName(prefix, counters));
    let finalName = mergeNameWithOriginalTokens(node.name, generated);
    if (isButtonHint(hint, node)) finalName = ensureBtnInName(finalName);
    if (hint) {
      hint.name = finalName;
    } else {
      nodeHints[figmaId] = { figmaId, name: finalName };
    }
  }
}
function enforceButtonNamesInPlan(nodeHints, nodeMap, virtualContainers) {
  for (const [figmaId, hint] of Object.entries(nodeHints)) {
    const node = nodeMap.get(figmaId);
    if (!isButtonHint(hint, node)) continue;
    if (hint.name?.trim() && node) {
      let merged = mergeNameWithOriginalTokens(node.name, hint.name);
      hint.name = ensureBtnInName(merged);
    } else if (node) {
      hint.name = ensureBtnInName(mergeNameWithOriginalTokens(node.name, node.name));
    }
  }
  for (const vc of virtualContainers ?? []) {
    if (!isButtonAnnotatedText(`${vc.organizeHint ?? ""} ${vc.name}`)) continue;
    vc.name = ensureBtnInName(vc.name);
  }
}

// src/button-group-bounds.ts
var BUTTON_GROUP_MIN_SIZE = 60;
function isButtonLikeNode(node, nodeHints) {
  if (node.figmaType === "VIRTUAL" || node.figmaId.startsWith("vc_")) {
    return /btn_.*_(item|group)\b/i.test(node.name) || /\bbtn\b.*\b(item|group)\b/i.test(node.name);
  }
  const hint = nodeHints[node.figmaId];
  return isButtonHint(hint, node) || node.type === "button" || BTN_IN_NAME.test(node.name);
}
function isButtonGroupContainer(vc, childNodes, nodeHints) {
  if (!childNodes.length) return false;
  const name = vc.name ?? "";
  if (/btn_.*_(item|group)\b/i.test(name) || /\bbtn\b.*\b(item|group)\b/i.test(name)) {
    return true;
  }
  const blob = `${name} ${vc.organizeHint ?? ""}`;
  const buttonKids = childNodes.filter((c) => isButtonLikeNode(c, nodeHints));
  if (buttonKids.length === 0) return false;
  if (isButtonAnnotatedText(blob)) return true;
  if (BTN_IN_NAME.test(name)) {
    if (childNodes.length >= 2) return true;
    if (/item|group/i.test(name)) return true;
  }
  return false;
}
function expandRectToMinSize(rect, minW, minH) {
  const width = Math.max(rect.width, minW);
  const height = Math.max(rect.height, minH);
  if (width === rect.width && height === rect.height) return rect;
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  return {
    x: cx - width / 2,
    y: cy - height / 2,
    width,
    height
  };
}
function applyButtonGroupMinBounds(absRect, vc, childNodes, nodeHints, minSize = BUTTON_GROUP_MIN_SIZE) {
  if (!isButtonGroupContainer(vc, childNodes, nodeHints)) return absRect;
  return expandRectToMinSize(absRect, minSize, minSize);
}

// ../../shared/organize-prompt-config.ts
function envFlag(name, defaultOn) {
  const v = process.env[name]?.trim().toLowerCase();
  if (v === "1" || v === "true" || v === "yes") return true;
  if (v === "0" || v === "false" || v === "no") return false;
  return defaultOn;
}
function envInt(name, fallback) {
  const n = Number(process.env[name]?.trim());
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}
function useCompactOrganizePrompt() {
  if (envFlag("FTC_ORGANIZE_COMPACT", false)) return true;
  return !envFlag("FTC_ORGANIZE_FULL_SKILL", true);
}
function useCompactAgentNodes() {
  return !envFlag("FTC_ORGANIZE_VERBOSE_NODES", false);
}
function customGuideMaxChars() {
  return envInt("FTC_ORGANIZE_GUIDE_MAX_CHARS", 3500);
}
function agentNodeTextMaxChars() {
  return envInt("FTC_ORGANIZE_NODE_TEXT_MAX", 64);
}
function referenceImageCompressBase64Len() {
  return envInt("FTC_ORGANIZE_IMAGE_COMPRESS_B64", 4e5);
}
function referenceImageMaxEdgePx() {
  return envInt("FTC_ORGANIZE_IMAGE_MAX_EDGE", 1920);
}
function referenceImageJpegQuality() {
  const q = envInt("FTC_ORGANIZE_IMAGE_JPEG_QUALITY", 82);
  return Math.min(100, Math.max(40, q));
}
function skipReferenceImageCompress() {
  return envFlag("FTC_ORGANIZE_SKIP_IMAGE_COMPRESS", false);
}

// ../../shared/agent-prompt-format.ts
var AGENT_NODE_LEGEND_COMPACT = "\u7BC0\u9EDE\u6B04\u4F4D\uFF1Ai=figmaId,n=name,ft=figmaType,t=type,r=[x,y,w,h],c=[relCenter 0~1],ar=areaRatio,tx=text,g=1 Figma Group,lk=lockedInUserGroupId";
var AGENT_NODE_LEGEND_VERBOSE = "\u7BC0\u9EDE\u6B04\u4F4D\uFF1AfigmaId,name,figmaType,type,absRect,relCenter,areaRatio,text,isUserGroup,lockedInUserGroupId";
function round3(n) {
  return Math.round(n * 1e3) / 1e3;
}
function truncateText(text, max) {
  if (!text) return void 0;
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return void 0;
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}\u2026`;
}
function collectAgentContextRows(root, pageAbs) {
  const leafToGroup = leafToUserGroupMap(root);
  const rows = [];
  const textMax = agentNodeTextMaxChars();
  function walk(node) {
    if (node.included === false) return;
    const isVirtual = node.figmaType === "VIRTUAL" || node.figmaId.startsWith("vc_");
    if (!isVirtual) {
      const cx = node.absRect.x + node.absRect.width / 2;
      const cy = node.absRect.y + node.absRect.height / 2;
      const lockedInUserGroupId = leafToGroup.get(node.figmaId);
      const isUserGroup = isFigmaUserGroup(node);
      const row = {
        figmaId: node.figmaId,
        name: node.name,
        figmaType: node.figmaType ?? "",
        type: node.type,
        absRect: {
          x: Math.round(node.absRect.x),
          y: Math.round(node.absRect.y),
          width: Math.round(node.absRect.width),
          height: Math.round(node.absRect.height)
        },
        relCenter: {
          x: round3(pageAbs.width > 0 ? (cx - pageAbs.x) / pageAbs.width : 0),
          y: round3(pageAbs.height > 0 ? (cy - pageAbs.y) / pageAbs.height : 0)
        },
        areaRatio: round3(
          pageAbs.width * pageAbs.height > 0 ? node.absRect.width * node.absRect.height / (pageAbs.width * pageAbs.height) : 0
        )
      };
      const tx = truncateText(node.text, textMax);
      if (tx) row.text = tx;
      if (isUserGroup) row.isUserGroup = true;
      if (lockedInUserGroupId) row.lockedInUserGroupId = lockedInUserGroupId;
      rows.push(row);
    }
    for (const c of node.children) walk(c);
  }
  for (const c of root.children) walk(c);
  return rows;
}
function rowToCompact(row) {
  const out = {
    i: row.figmaId,
    n: row.name,
    ft: row.figmaType,
    t: row.type,
    r: [row.absRect.x, row.absRect.y, row.absRect.width, row.absRect.height],
    c: [row.relCenter.x, row.relCenter.y]
  };
  if (row.areaRatio > 1e-3) out.ar = row.areaRatio;
  if (row.text) out.tx = row.text;
  if (row.isUserGroup) out.g = 1;
  if (row.lockedInUserGroupId) out.lk = row.lockedInUserGroupId;
  return out;
}
function stringifyAgentNodes(rows, pretty = false, forceVerbose = false) {
  if (!forceVerbose && useCompactAgentNodes()) {
    const compact = rows.map(rowToCompact);
    return pretty ? JSON.stringify(compact, null, 2) : JSON.stringify(compact);
  }
  const verbose = rows.map((row) => ({
    figmaId: row.figmaId,
    name: row.name,
    figmaType: row.figmaType,
    type: row.type,
    absRect: row.absRect,
    relCenter: row.relCenter,
    areaRatio: row.areaRatio,
    ...row.text ? { text: row.text } : {},
    ...row.isUserGroup ? { isUserGroup: true } : {},
    ...row.lockedInUserGroupId ? { lockedInUserGroupId: row.lockedInUserGroupId } : {}
  }));
  return pretty ? JSON.stringify(verbose, null, 2) : JSON.stringify(verbose);
}
function agentNodeLegend(forceVerbose = false) {
  if (forceVerbose || !useCompactAgentNodes()) return AGENT_NODE_LEGEND_VERBOSE;
  return AGENT_NODE_LEGEND_COMPACT;
}
function truncateCustomGuideMarkdown(markdown, maxChars = customGuideMaxChars()) {
  const body = markdown.trim();
  if (body.length <= maxChars) return body;
  const head = Math.floor(maxChars * 0.65);
  const tail = maxChars - head - 48;
  return `${body.slice(0, head)}

\u2026[\u4E2D\u9593\u7701\u7565 ${body.length - head - tail} \u5B57\uFF0C\u5B8C\u6574\u898F\u5247\u5DF2\u622A\u65B7\u4EE5\u7BC0\u7701 token]\u2026

${body.slice(-tail)}`;
}
function estimatePromptTokens(text) {
  return Math.ceil(text.length / 4);
}

// src/apply-plan.ts
function cloneNode(node) {
  return {
    ...node,
    children: node.children.map(cloneNode)
  };
}
function indexNodes(root, map = /* @__PURE__ */ new Map()) {
  map.set(root.figmaId, root);
  for (const c of root.children) indexNodes(c, map);
  return map;
}
function unionAbsRect(rects) {
  if (!rects.length) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const r of rects) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.width);
    maxY = Math.max(maxY, r.y + r.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
function applyHintToNode(node, hint) {
  if (!hint) return;
  if (hint.name) {
    let nextName = sanitizeNodeName(hint.name);
    if (nextName) nextName = mergeNameWithOriginalTokens(node.name, nextName);
    if (nextName && isButtonHint(hint, node)) nextName = ensureBtnInName(nextName);
    if (nextName) node.name = nextName;
  } else if (isButtonHint(hint, node)) {
    node.name = ensureBtnInName(mergeNameWithOriginalTokens(node.name, node.name));
  }
  if (hint.type) {
    if (node.figmaType === "TEXT" || node.text) {
      node.type = "label";
    } else {
      node.type = hint.type;
    }
  }
  if (hint.containerRole) node.containerRole = hint.containerRole;
  if (hint.layout) node.layout = hint.layout;
  if (hint.widget) node.widget = hint.widget;
  if (hint.organizeHint) node.organizeHint = hint.organizeHint;
}
function buildVirtualNode(vc, nodeMap, vcMap, parentAbs, nodeHints, guideOverrides) {
  const childNodes = [];
  for (const childId of vc.children) {
    const figmaNode = nodeMap.get(childId);
    if (figmaNode) {
      const cloned = cloneNode(figmaNode);
      applyHintToNode(cloned, nodeHints[childId]);
      childNodes.push(cloned);
      continue;
    }
    const nested = vcMap.get(childId);
    if (nested) {
      const built = buildVirtualNode(nested, nodeMap, vcMap, parentAbs, nodeHints, guideOverrides);
      if (built) childNodes.push(built);
    }
  }
  if (!childNodes.length) return null;
  let absRect = unionAbsRect(childNodes.map((n) => n.absRect));
  const btnMin = guideOverrides?.buttonGroupMinSize ?? BUTTON_GROUP_MIN_SIZE;
  absRect = applyButtonGroupMinBounds(absRect, vc, childNodes, nodeHints, btnMin);
  return {
    figmaId: vc.id,
    name: isButtonAnnotatedText(`${vc.organizeHint ?? ""} ${vc.name}`) ? ensureBtnInName(vc.name) : vc.name,
    figmaType: "VIRTUAL",
    type: "container",
    rect: {
      x: absRect.x - parentAbs.x,
      y: absRect.y - parentAbs.y,
      width: absRect.width,
      height: absRect.height
    },
    absRect,
    visible: true,
    included: true,
    containerRole: vc.containerRole,
    layout: vc.layout,
    organizeHint: vc.organizeHint ?? `\u865B\u64EC\u5BB9\u5668\uFF1A${vc.name}`,
    children: childNodes.map((n) => ({
      ...n,
      rect: {
        x: n.absRect.x - absRect.x,
        y: n.absRect.y - absRect.y,
        width: n.absRect.width,
        height: n.absRect.height
      }
    }))
  };
}
function applyAgentPlan(ir, plan, options) {
  const result = cloneNode(ir.root);
  const doc = {
    ...ir,
    preserveVisual: true,
    organizedBy: plan.organizer,
    agentSummary: plan.summary,
    root: result
  };
  const namedByHint = /* @__PURE__ */ new Set();
  for (const [figmaId, hint] of Object.entries(plan.nodeHints)) {
    if (hint?.name?.trim()) namedByHint.add(figmaId);
  }
  const nodeMap = indexNodes(result);
  for (const figmaId of Object.keys(plan.nodeHints)) {
    const hint = plan.nodeHints[figmaId];
    const node = nodeMap.get(figmaId);
    if (node && hint) applyHintToNode(node, { ...hint, figmaId });
  }
  if (!plan.virtualRoot?.children?.length || !plan.virtualContainers?.length) {
    applyGenericNamesToLeaves(result, ir.root, { skipFigmaIds: namedByHint });
    return doc;
  }
  const vcMap = new Map(
    plan.virtualContainers.map((v) => [v.id, v])
  );
  const pageAbs = result.absRect;
  const newChildren = [];
  for (const childId of plan.virtualRoot.children) {
    const figmaNode = nodeMap.get(childId);
    if (figmaNode) {
      const cloned = cloneNode(figmaNode);
      applyHintToNode(cloned, plan.nodeHints[childId]);
      newChildren.push(cloned);
      continue;
    }
    const vc = vcMap.get(childId);
    if (vc) {
      const built = buildVirtualNode(vc, nodeMap, vcMap, pageAbs, plan.nodeHints, options?.guideOverrides);
      if (built) newChildren.push(built);
    }
  }
  if (newChildren.length) {
    result.children = newChildren.map((n) => ({
      ...n,
      rect: {
        x: n.absRect.x - pageAbs.x,
        y: n.absRect.y - pageAbs.y,
        width: n.absRect.width,
        height: n.absRect.height
      }
    }));
  }
  applyGenericNamesToLeaves(result, ir.root, { skipFigmaIds: namedByHint });
  return doc;
}
function formatAgentNodesBlock(rows, pretty, forceVerbose = false) {
  return `${agentNodeLegend(forceVerbose)}
nodes=${stringifyAgentNodes(rows, pretty, forceVerbose)}`;
}
function pageMetaLines(ir, pageAbs) {
  const pageName = ir.source.pageName ?? ir.root.name;
  return `page="${pageName}" size=${ir.designSize.width}x${ir.designSize.height} absRect=[${Math.round(pageAbs.x)},${Math.round(pageAbs.y)},${Math.round(pageAbs.width)},${Math.round(pageAbs.height)}]`;
}
function validateAgentPlan(ir, plan) {
  const nodeMap = indexNodes(ir.root);
  const errors = [];
  const vcIds = new Set((plan.virtualContainers ?? []).map((v) => v.id));
  for (const [figmaId] of Object.entries(plan.nodeHints)) {
    if (!nodeMap.has(figmaId)) errors.push(`nodeHints \u5F15\u7528\u4E0D\u5B58\u5728\u7684 figmaId: ${figmaId}`);
  }
  for (const vc of plan.virtualContainers ?? []) {
    for (const childId of vc.children) {
      if (!nodeMap.has(childId) && !vcIds.has(childId)) {
        errors.push(`virtualContainers["${vc.id}"] \u5F15\u7528\u672A\u77E5 id: ${childId}`);
      }
    }
  }
  for (const childId of plan.virtualRoot?.children ?? []) {
    if (!nodeMap.has(childId) && !vcIds.has(childId)) {
      errors.push(`virtualRoot \u5F15\u7528\u672A\u77E5 id: ${childId}`);
    }
  }
  return errors.length ? { ok: false, errors } : { ok: true };
}
function buildReferenceAgentPrompt(ir, options) {
  const pageAbs = ir.root.absRect;
  const rows = collectAgentContextRows(ir.root, pageAbs);
  const imageName = options?.referenceImageName ?? "reference";
  const compact = !options?.full && useCompactOrganizePrompt();
  const pretty = options?.prettyNodes ?? !compact;
  if (compact) {
    return `# Task: IR + image "${imageName}" \u2192 AgentOrganizePlan JSON only
${pageMetaLines(ir, pageAbs)}
Vision: each circled/boxed zone = one virtual container (\u2265 zone count); map nodes by r/c vs image; no single BackgroundLayer for all; Group g=1 use group i in virtualContainers; every leaf needs nodeHints.name (btn in name if button).
${formatAgentNodesBlock(rows, pretty, false)}`;
  }
  return `# Figma Page \u968E\u5C64\u6574\u7406\uFF08IR + \u793A\u610F\u5716\u5708\u9078\u5340\uFF09

## \u6700\u9AD8\u512A\u5148\uFF08\u5FC5\u505A\uFF09
1. **\u5148\u770B\u9644\u5716**\uFF08${imageName}\uFF09\u4E2D\u7684\u624B\u7E6A\u5708\u9078/\u6846\u9078\u5340\uFF1B\u6BCF\u4E00\u500B\u5708 = \u4E00\u500B virtual container\u3002
2. \u5C07\u4E0B\u65B9\u7BC0\u9EDE\u4F9D absRect / relCenter\uFF080~1\uFF09\u5C0D\u61C9\u9032\u5404\u5708\u9078\u5340\u3002
3. **\u7981\u6B62**\u53EA\u5EFA\u7ACB\u55AE\u4E00 BackgroundLayer \u585E\u5168\u90E8\u7BC0\u9EDE\uFF1B\u9644\u5716 N \u500B\u5708 \u2192 \u81F3\u5C11 N \u500B\u8A9E\u610F\u5BB9\u5668\u3002
4. \u4E0D\u5F97\u4FEE\u6539 leaf absRect\u3002Group \u4E0D\u53EF\u62C6\u6563\uFF1Blk \u7BC0\u9EDE\u7981\u6B62\u55AE\u7368\u5206\u914D\u3002
5. \u6BCF\u500B\u8449\u7BC0\u9EDE nodeHints.name \u5FC5\u586B\uFF1B\u6309\u9215\u540D\u542B btn\u3002

## Page
${pageMetaLines(ir, pageAbs)}

${formatAgentNodesBlock(rows, true, true)}

## \u8F38\u51FA
\u53EA\u8F38\u51FA AgentOrganizePlan JSON\uFF0CfigmaId \u4F86\u81EA nodes\u3002`;
}
function buildAgentPrompt(ir, options) {
  const pageAbs = ir.root.absRect;
  const rows = collectAgentContextRows(ir.root, pageAbs);
  const compact = !options?.full && useCompactOrganizePrompt();
  const pretty = options?.prettyNodes ?? !compact;
  if (compact) {
    return `# Task: organize IR \u2192 AgentOrganizePlan JSON only
${pageMetaLines(ir, pageAbs)}
2~4 virtual containers; every leaf nodeHints.name; optional widget/layout per Skill; Group g=1 intact.
${formatAgentNodesBlock(rows, pretty, false)}`;
  }
  return `# Figma Page \u968E\u5C64\u6574\u7406\uFF08AI Agent\uFF09

## \u76EE\u6A19
\u756B\u9762\u4E0D\u8B8A\uFF08\u4E0D\u6539 absRect\uFF09\uFF1B\u865B\u64EC\u5BB9\u5668 + \u8A9E\u610F\u547D\u540D + \u53EF\u9078 widget/layout\u3002

## Page
${pageMetaLines(ir, pageAbs)}

${formatAgentNodesBlock(rows, true, true)}

## \u8F38\u51FA
\u53EA\u8F38\u51FA AgentOrganizePlan JSON\uFF1BfigmaId \u4F86\u81EA nodes\uFF1B\u6BCF\u8449\u7BC0\u9EDE nodeHints.name \u5FC5\u586B\uFF1BGroup \u4E0D\u53EF\u62C6\u3002`;
}

// src/call-cursor.ts
var import_fs3 = require("fs");
var import_path3 = require("path");
var import_sdk = require("@cursor/sdk");

// ../../shared/custom-guide-overrides.ts
function parseMinSquareFromMatch(w, h) {
  const width = Number(w);
  const height = h !== void 0 ? Number(h) : width;
  if (!Number.isFinite(width) || width <= 0) return void 0;
  if (!Number.isFinite(height) || height <= 0) return width;
  return Math.max(width, height);
}
function parseCustomGuideOverrides(markdown) {
  const overrides = {};
  const text = markdown.replace(/\r\n/g, "\n");
  const patterns = [
    /按鈕(?:群組)?(?:容器)?[^。\n]{0,48}?最小(?:尺寸|大小)?[^0-9]*(\d+)\s*[×xX*＊]\s*(\d+)/i,
    /按鈕[^。\n]{0,64}?(?:擴充|擴展|放大)[^0-9]{0,16}(\d+)\s*[×xX*＊]\s*(\d+)/i,
    /(?:expand|enlarge)[^.\n]{0,40}?(\d+)\s*[×xX*＊]\s*(\d+)/i,
    /button\s*group[^.\n]{0,48}?min(?:imum)?(?:\s*size)?[^0-9]*(\d+)\s*[×xX*＊]\s*(\d+)/i,
    /BUTTON_GROUP_MIN(?:_SIZE)?\s*[=:]\s*(\d+)/i,
    /(?:改為|改成|使用|改)\s*(\d+)\s*[×xX*＊]\s*(\d+)/i,
    /(?:擴充|擴展)到?\s*(\d+)\s*[×xX*＊]\s*(\d+)/i
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
function formatGuideOverridesSummary(overrides) {
  const lines = [];
  if (overrides.buttonGroupMinSize) {
    lines.push(
      `- \u6309\u9215\u7FA4\u7D44\u865B\u64EC\u5BB9\u5668\u6700\u5C0F ${overrides.buttonGroupMinSize}\xD7${overrides.buttonGroupMinSize}\uFF08\u8986\u5BEB Skill \u9810\u8A2D 60\xD760\uFF1Bapply-plan \u6703\u5F37\u5236\u57F7\u884C\uFF09`
    );
  }
  if (!lines.length) return "";
  return `
## \u5DF2\u89E3\u6790\u7684\u696D\u52D9\u908F\u8F2F\u8986\u5BEB
${lines.join("\n")}
`;
}

// src/load-organizer-skill.ts
var import_fs2 = require("fs");
var import_path2 = require("path");
function loadOrganizerSkillOrThrow(repoRoot) {
  const skillDir = (0, import_path2.resolve)(
    repoRoot,
    ".cursor",
    "skills",
    "figma-hierarchy-organize"
  );
  const compactPath = (0, import_path2.resolve)(skillDir, "SKILL.compact.md");
  const fullPath = (0, import_path2.resolve)(
    process.env.FTC_ORGANIZE_SKILL_PATH ?? (0, import_path2.resolve)(skillDir, "SKILL.md")
  );
  const useCompact = useCompactOrganizePrompt();
  const primary = useCompact && (0, import_fs2.existsSync)(compactPath) ? compactPath : fullPath;
  if (!(0, import_fs2.existsSync)(primary)) {
    throw new Error(
      `\u627E\u4E0D\u5230 hierarchy skill\uFF1A${primary}
` + (useCompact ? `\uFF08\u4EA6\u627E\u4E0D\u5230\u7CBE\u7C21\u7248 ${compactPath}\uFF09
` : "") + "\u8ACB\u78BA\u8A8D .cursor/skills/figma-hierarchy-organize/SKILL.md \u5B58\u5728\u3002"
    );
  }
  try {
    const text = (0, import_fs2.readFileSync)(primary, "utf8").trim();
    if (!text) throw new Error(`hierarchy skill \u70BA\u7A7A\uFF1A${primary}`);
    console.log(
      `[cursor-organize] skill loaded: ${primary}${useCompact && primary === compactPath ? " (compact)" : " (full)"}`
    );
    return text;
  } catch (e) {
    throw new Error(`[cursor-organize] \u8B80\u53D6 skill \u5931\u6557\uFF1A${primary} (${String(e)})`);
  }
}

// src/parse-agent-json.ts
function parseAgentJsonFromText(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Cursor Agent \u56DE\u50B3\u7A7A\u5167\u5BB9");
  }
  try {
    return JSON.parse(trimmed);
  } catch {
  }
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    return JSON.parse(fence[1].trim());
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }
  throw new Error("Cursor Agent \u56DE\u50B3\u7121\u6CD5\u89E3\u6790\u70BA JSON\uFF08\u8ACB\u78BA\u8A8D Agent \u53EA\u8F38\u51FA AgentOrganizePlan\uFF09");
}

// src/reference-image-optimize.ts
function isBase64SdkImage(image) {
  return "data" in image;
}
async function loadSharp() {
  try {
    const mod = await import("sharp");
    if (typeof mod === "function") return mod;
    if (mod && typeof mod === "object" && "default" in mod && typeof mod.default === "function") {
      return mod.default;
    }
    return null;
  } catch {
    return null;
  }
}
async function optimizeReferenceSdkImage(image, label) {
  if (skipReferenceImageCompress()) return image;
  if (!isBase64SdkImage(image)) return image;
  const threshold = referenceImageCompressBase64Len();
  if (image.data.length <= threshold) return image;
  const sharp = await loadSharp();
  if (!sharp) {
    console.warn(
      "[cursor-organize] \u793A\u610F\u5716\u504F\u5927\u4F46\u672A\u5B89\u88DD sharp\uFF0C\u7121\u6CD5\u81EA\u52D5\u58D3\u7E2E\u3002\u8ACB\u5728 tools/ai-organizer \u57F7\u884C npm install"
    );
    return image;
  }
  const maxEdge = referenceImageMaxEdgePx();
  const input = Buffer.from(image.data, "base64");
  const beforeKb = Math.round(image.data.length / 1024);
  try {
    const meta = await sharp(input, { failOn: "none" }).rotate().metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    const edge = Math.max(w, h);
    let quality = referenceImageJpegQuality();
    let best = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      const scaleEdge = attempt === 0 ? maxEdge : Math.max(720, Math.floor(maxEdge / (attempt + 1)));
      let pipeline = sharp(input, { failOn: "none" }).rotate();
      if (edge > scaleEdge) {
        pipeline = pipeline.resize(scaleEdge, scaleEdge, {
          fit: "inside",
          withoutEnlargement: true
        });
      }
      const out = await pipeline.jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:2:0" }).toBuffer();
      if (!best || out.length < best.length) best = out;
      const estB64Len = Math.ceil(out.length * 4 / 3);
      if (estB64Len <= threshold) {
        const data = out.toString("base64");
        console.log(
          `[cursor-organize] \u793A\u610F\u5716\u5DF2\u58D3\u7E2E ${beforeKb}KB \u2192 ${Math.round(data.length / 1024)}KB base64 (${w}\xD7${h}, JPEG q=${quality}${edge > scaleEdge ? `, \u908A\u2264${scaleEdge}px` : ""}${label ? `, ${label}` : ""})`
        );
        return { data, mimeType: "image/jpeg" };
      }
      quality = Math.max(48, quality - 14);
    }
    if (best) {
      const data = best.toString("base64");
      console.log(
        `[cursor-organize] \u793A\u610F\u5716\u5DF2\u58D3\u7E2E\uFF08\u4ECD\u8D85\u904E\u9580\u6ABB\uFF09${beforeKb}KB \u2192 ${Math.round(data.length / 1024)}KB base64${label ? ` (${label})` : ""}`
      );
      return { data, mimeType: "image/jpeg" };
    }
  } catch (e) {
    console.warn(`[cursor-organize] \u793A\u610F\u5716\u58D3\u7E2E\u5931\u6557\uFF0C\u4F7F\u7528\u539F\u5716 (${beforeKb}KB):`, e);
  }
  return image;
}

// src/call-cursor.ts
var SYSTEM_PREFIX_COMPACT = "Figma UI \u6574\u7406 Agent\u3002\u53EA\u8F38\u51FA\u4E00\u500B AgentOrganizePlan JSON\uFF08\u7121 markdown\uFF09\u3002\u786C\u7D04\u675F\uFF1A\u4E0D\u6539 absRect\uFF1BfigmaId \u50C5\u80FD\u4F86\u81EA nodes\uFF1BGroup \u4E0D\u62C6\u3002\u512A\u5148\uFF1A\u786C\u7D04\u675F > Skill > \u4F7F\u7528\u8005 .md \u660E\u78BA\u898F\u5247\u3002";
var SYSTEM_PREFIX_FULL = "\u4F60\u662F Figma UI \u7D50\u69CB\u6574\u7406 Agent\u3002\u53EA\u8F38\u51FA\u4E00\u500B JSON \u7269\u4EF6\uFF08\u4E0D\u8981 markdown \u8AAA\u660E\uFF09\uFF0C\u7B26\u5408 AgentOrganizePlan \u683C\u5F0F\u3002\u4E0D\u5F97\u4FEE\u6539 absRect\u3002figmaId \u5FC5\u9808\u5B8C\u5168\u4F86\u81EA\u4F7F\u7528\u8005\u63D0\u4F9B\u7684\u7BC0\u9EDE\u5217\u8868\uFF0C\u4E0D\u53EF\u81EA\u5275\u3002\u53EF\u900F\u904E nodeHints[].name \u8207 virtualContainers[].name \u547D\u540D\uFF1A\u6709\u793A\u610F\u5716\u6A19\u7C64\u7528\u8A9E\u610F\u540D\uFF0C\u7121\u6A19\u7C64\u4E5F\u8981\u7D66\u901A\u7528 snake_case \u540D\uFF08\u6BCF\u500B\u8449\u7BC0\u9EDE\u5FC5\u586B name\uFF09\u3002\u6A19\u8A3B\u70BA\u6309\u9215\u8005 name \u5FC5\u9808\u542B btn\u3002\u6700\u7D42\u540D\u7A31\u50C5\u82F1\u6587\uFF1B\u539F\u540D\u82E5\u70BA\u4E2D\u6587\u9808\u5148\u8B6F\u6210\u82F1\u6587\u8A9E\u610F\u8A5E\u518D\u4F75\u5165\u3002\u898F\u5247\u512A\u5148\u9806\u5E8F\uFF1A\u2460 \u786C\u7D04\u675F\uFF08absRect / figmaId / Group \u4FDD\u7559\uFF0C\u4E0D\u53EF\u88AB\u4EFB\u4F55\u898F\u5247\u8986\u5BEB\uFF09> \u2461 Skill \u9810\u8A2D\u696D\u52D9\u908F\u8F2F > \u2462 \u4F7F\u7528\u8005 .md \u4E2D**\u660E\u78BA\u5BEB\u51FA**\u7684\u696D\u52D9\u908F\u8F2F\uFF08\u53EF\u8986\u5BEB Skill \u9810\u8A2D\uFF0C\u4F8B\u5982\u6309\u9215\u5BB9\u5668\u6700\u5C0F\u5C3A\u5BF8 70\xD770\uFF09\u3002";
function resolveCustomGuide(input) {
  const markdown = input?.markdown?.trim();
  if (!markdown) return void 0;
  return {
    name: input?.name?.trim() || "user-guide.md",
    markdown,
    overrides: parseCustomGuideOverrides(markdown)
  };
}
function mimeFromPath(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "image/png";
}
async function referenceImageToSdkImage(input) {
  const label = input.referenceImageName ?? input.referenceImagePath;
  let image = null;
  if (input.referenceImageBase64?.trim()) {
    const name = (input.referenceImageName ?? "").toLowerCase();
    const mimeType = name.endsWith(".jpg") || name.endsWith(".jpeg") ? "image/jpeg" : name.endsWith(".webp") ? "image/webp" : "image/png";
    image = { data: input.referenceImageBase64.trim(), mimeType };
  } else {
    const filePath = input.referenceImagePath?.trim();
    if (!filePath || !(0, import_fs3.existsSync)(filePath)) return null;
    image = {
      data: (0, import_fs3.readFileSync)(filePath).toString("base64"),
      mimeType: mimeFromPath(filePath)
    };
  }
  if (!image) return null;
  return optimizeReferenceSdkImage(image, label);
}
function buildCustomGuideBlock(customGuide) {
  const overrides = parseCustomGuideOverrides(customGuide.markdown);
  const summary = formatGuideOverridesSummary(overrides);
  const body = truncateCustomGuideMarkdown(customGuide.markdown);
  const compact = useCompactOrganizePrompt();
  if (compact) {
    return `# User guide (${customGuide.name ?? "user-guide.md"})
\u786C\u7D04\u675F\u4E0D\u53EF\u8986\u5BEB\uFF1B\u660E\u78BA\u696D\u52D9\u898F\u5247\u8986\u5BEB Skill\u3002
` + summary + `${body}

`;
  }
  return `# User Custom Organize Guide (SUPPLEMENTARY \u2014 OVERRIDES SKILL BUSINESS LOGIC WHEN EXPLICIT)
\u4F86\u6E90\u6A94\uFF1A${customGuide.name ?? "user-guide.md"}
\u786C\u7D04\u675F\uFF08absRect / figmaId / Group\uFF09\u4E0D\u53EF\u9055\u53CD\uFF1B\u660E\u78BA\u696D\u52D9\u898F\u5247\u4EE5\u672C\u6A94\u70BA\u6E96\u3002
` + summary + `${body}

`;
}
function buildComposedPrompt(prompt, skillText, hasVisionImage, customGuide) {
  const compact = useCompactOrganizePrompt();
  const systemPrefix = compact ? SYSTEM_PREFIX_COMPACT : SYSTEM_PREFIX_FULL;
  const visionNote = hasVisionImage ? compact ? "\u9644\u5716\uFF1A\u4F9D\u5708\u9078\u5340\u5206\u7D44\u3002" : "\u9644\u5716\u5DF2\u96A8\u8A0A\u606F\u63D0\u4F9B\uFF1A\u8ACB\u7528\u8996\u89BA\u8FA8\u8B58\u5708\u9078\u5340\u5F8C\u518D\u5206\u7D44\uFF0C\u4E0D\u53EF\u53EA\u9760\u6A94\u540D\u6216\u8DEF\u5F91\u731C\u6E2C\u3002" : "";
  const guideBlock = customGuide?.markdown?.trim() ? buildCustomGuideBlock(customGuide) : "";
  if (compact) {
    return `${systemPrefix}

# Skill
${skillText}

` + guideBlock + `${prompt}
` + (guideBlock ? "\u5957\u7528 .md \u660E\u78BA\u898F\u5247\uFF1B\u5176\u9918\u4F9D Skill\u3002\n" : "") + visionNote;
  }
  return `${systemPrefix}

# Skill (DEFAULT BUSINESS LOGIC \u2014 OVERRIDDEN BY EXPLICIT USER .md RULES)
${skillText}

` + guideBlock + `# Task
${prompt}

\u786C\u7D04\u675F\u8207 Skill \u9810\u8A2D\u5FC5\u5B88\uFF1B\u4F7F\u7528\u8005 .md \u4E2D**\u660E\u78BA\u5BEB\u51FA**\u7684\u696D\u52D9\u908F\u8F2F\u512A\u5148\u65BC Skill \u5C0D\u61C9\u9810\u8A2D\u3002
` + (guideBlock ? "\u5957\u7528\u4F7F\u7528\u8005 .md \u7684\u660E\u78BA\u696D\u52D9\u898F\u5247\uFF1B\u672A\u63D0\u53CA\u8655\u4ECD\u4F9D Skill\u3002\n" : "") + visionNote;
}
async function runAgentPrompt(composedPrompt, repoRoot, images) {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      '\u672A\u8A2D\u5B9A CURSOR_API_KEY\u3002\n  1. \u81F3 Cursor Dashboard \u2192 Integrations \u5EFA\u7ACB API Key\n  2. PowerShell: $env:CURSOR_API_KEY = "cursor_..."\n  3. \u6216\u5BEB\u5165 tools/ai-organizer/.env'
    );
  }
  const model = process.env.CURSOR_MODEL ?? "composer-2.5";
  const cwd = (0, import_path3.resolve)(process.env.CURSOR_CWD ?? repoRoot);
  const stateRoot = (0, import_path3.resolve)(repoRoot, ".cursor-sdk-state");
  (0, import_fs3.mkdirSync)(stateRoot, { recursive: true });
  const agentOptions = {
    apiKey,
    model: { id: model },
    local: { cwd, settingSources: [] },
    platform: {
      workspaceRef: cwd,
      stateRoot
    }
  };
  if (images?.length) {
    const agent = await import_sdk.Agent.create(agentOptions);
    try {
      const run = await agent.send({ text: composedPrompt, images });
      const result2 = await run.wait();
      if (result2.status === "error") {
        throw new Error(`Cursor Agent \u57F7\u884C\u5931\u6557\uFF08run=${result2.id ?? "unknown"}\uFF09`);
      }
      return typeof result2.result === "string" ? result2.result : String(result2.result ?? "");
    } finally {
      await agent.close();
    }
  }
  const result = await import_sdk.Agent.prompt(composedPrompt, agentOptions);
  if (result.status === "error") {
    throw new Error(`Cursor Agent \u57F7\u884C\u5931\u6557\uFF08run=${result.id ?? "unknown"}\uFF09`);
  }
  return typeof result.result === "string" ? result.result : String(result.result ?? "");
}
async function callCursorAgent(prompt, repoRoot, options) {
  const skillText = loadOrganizerSkillOrThrow(repoRoot);
  const images = options?.images;
  const composedPrompt = buildComposedPrompt(
    prompt,
    skillText,
    Boolean(images?.length),
    options?.customGuide
  );
  const estTokens = estimatePromptTokens(composedPrompt);
  console.log(
    `[cursor-organize] prompt size: ${composedPrompt.length} chars (~${estTokens} tokens text${images?.length ? " + vision image" : ""})` + (useCompactOrganizePrompt() ? " [compact]" : " [full]")
  );
  console.log(`Cursor Agent: local cwd=${(0, import_path3.resolve)(process.env.CURSOR_CWD ?? repoRoot)}  model=${process.env.CURSOR_MODEL ?? "composer-2.5"}`);
  console.log(`Cursor SDK stateRoot=${(0, import_path3.resolve)(repoRoot, ".cursor-sdk-state")}`);
  if (images?.length) {
    console.log(`[cursor-organize] reference image attached (${images.length})`);
  }
  if (options?.customGuide?.markdown?.trim()) {
    console.log(
      `[cursor-organize] custom guide attached: ${options.customGuide.name ?? "user-guide.md"}`
    );
    const resolved = resolveCustomGuide(options.customGuide);
    if (resolved?.overrides.buttonGroupMinSize) {
      console.log(
        `[cursor-organize] guide override: buttonGroupMinSize=${resolved.overrides.buttonGroupMinSize}`
      );
    }
  }
  try {
    const text = await runAgentPrompt(composedPrompt, repoRoot, images);
    return parseAgentJsonFromText(text);
  } catch (err) {
    if (err instanceof import_sdk.CursorAgentError) {
      throw new Error(
        `Cursor Agent \u555F\u52D5\u5931\u6557: ${err.message}
  retryable=${err.isRetryable}
  \u5E38\u898B\u539F\u56E0\uFF1AAPI Key \u7121\u6548\u3001\u672C\u6A5F Cursor \u672A\u5C31\u7DD2\u3001cwd \u8DEF\u5F91\u932F\u8AA4`
      );
    }
    throw err;
  }
}

// ../../shared/organize-validation.ts
var DEFAULT_BUTTON_GROUP_MIN = 60;
var ABS_RECT_EPSILON = 0.51;
var BTN_IN_NAME2 = /\bbtn\b|_btn_|^btn_/i;
var DEFAULT_FIGMA_NAME = /^(rectangle|frame|group|ellipse|vector|text|image|component|instance|section)\s*\d*$/i;
function isVirtualNode(node) {
  return node.figmaType === "VIRTUAL" || node.figmaId.startsWith("vc_");
}
function isIncludedLeaf(node) {
  if (node.included === false) return false;
  if (isVirtualNode(node)) return false;
  return !node.children?.length;
}
function collectIncludedLeaves2(root) {
  const out = [];
  const walk = (n) => {
    if (n.included === false) return;
    if (isIncludedLeaf(n)) out.push(n);
    for (const c of n.children ?? []) walk(c);
  };
  for (const c of root.children ?? []) walk(c);
  return out;
}
function indexLeavesById(root) {
  const map = /* @__PURE__ */ new Map();
  for (const leaf of collectIncludedLeaves2(root)) {
    map.set(leaf.figmaId, leaf);
  }
  return map;
}
function collectAllFigmaIds(root) {
  const ids = [];
  const walk = (n) => {
    if (n.figmaId) ids.push(n.figmaId);
    for (const c of n.children ?? []) walk(c);
  };
  walk(root);
  return ids;
}
function rectDrift(a, b) {
  return Math.max(
    Math.abs(a.x - b.x),
    Math.abs(a.y - b.y),
    Math.abs(a.width - b.width),
    Math.abs(a.height - b.height)
  );
}
function isDefaultFigmaName(name) {
  return DEFAULT_FIGMA_NAME.test(name.trim());
}
function isButtonGroupVirtual(node) {
  if (!isVirtualNode(node)) return false;
  const name = node.name ?? "";
  if (/btn_.*_(item|group)\b/i.test(name) || /\bbtn\b.*\b(item|group)\b/i.test(name)) {
    return true;
  }
  if (BTN_IN_NAME2.test(name) && (node.children?.length ?? 0) >= 2) return true;
  if (BTN_IN_NAME2.test(name) && /item|group/i.test(name)) return true;
  return false;
}
function leafToInnerVirtualId(root) {
  const map = /* @__PURE__ */ new Map();
  const walk = (n, innerVc) => {
    const vc = isVirtualNode(n) ? n.figmaId : innerVc;
    if (isIncludedLeaf(n) && vc) map.set(n.figmaId, vc);
    for (const c of n.children ?? []) walk(c, vc);
  };
  for (const c of root.children ?? []) walk(c, null);
  return map;
}
function pushIssue(issues, issue) {
  issues.push(issue);
}
function summarize(report) {
  report.errorCount = report.issues.filter((i) => i.severity === "error").length;
  report.warnCount = report.issues.filter((i) => i.severity === "warn").length;
  report.infoCount = report.issues.filter((i) => i.severity === "info").length;
  report.ok = report.errorCount === 0;
  return report;
}
function validateOrganizedIR(organized, options = {}) {
  const issues = [];
  const minBtn = options.buttonGroupMinSize ?? DEFAULT_BUTTON_GROUP_MIN;
  const allIds = collectAllFigmaIds(organized.root);
  const seen = /* @__PURE__ */ new Set();
  for (const id of allIds) {
    if (seen.has(id)) {
      pushIssue(issues, {
        code: "DUPLICATE_FIGMA_ID",
        severity: "error",
        message: `figmaId \u91CD\u8907\u51FA\u73FE\uFF1A${id}`,
        figmaId: id
      });
    }
    seen.add(id);
  }
  const orgLeaves = indexLeavesById(organized.root);
  const sourceLeaves = options.sourceIr ? indexLeavesById(options.sourceIr.root) : null;
  if (sourceLeaves) {
    for (const [figmaId, src] of sourceLeaves) {
      const out = orgLeaves.get(figmaId);
      if (!out) {
        pushIssue(issues, {
          code: "MISSING_LEAF",
          severity: "error",
          message: `\u6574\u7406\u5F8C\u7F3A\u5C11 included \u8449\u7BC0\u9EDE\uFF1A${src.name}\uFF08${figmaId}\uFF09`,
          figmaId
        });
        continue;
      }
      const drift = rectDrift(src.absRect, out.absRect);
      if (drift > ABS_RECT_EPSILON) {
        pushIssue(issues, {
          code: "ABS_RECT_DRIFT",
          severity: "error",
          message: `absRect \u504F\u79FB ${drift.toFixed(2)}px\uFF1A${src.name}\uFF08${figmaId}\uFF09`,
          figmaId
        });
      }
    }
    for (const [figmaId, out] of orgLeaves) {
      if (!sourceLeaves.has(figmaId)) {
        pushIssue(issues, {
          code: "EXTRA_LEAF",
          severity: "warn",
          message: `\u6574\u7406\u5F8C\u51FA\u73FE source \u6C92\u6709\u7684\u8449\u7BC0\u9EDE\uFF1A${out.name}\uFF08${figmaId}\uFF09`,
          figmaId
        });
      }
    }
  }
  for (const leaf of orgLeaves.values()) {
    const hasText = Boolean(leaf.text?.length) || leaf.figmaType === "TEXT";
    if (hasText && leaf.type !== "label") {
      pushIssue(issues, {
        code: "TEXT_NOT_LABEL",
        severity: "warn",
        message: `\u6587\u5B57\u7BC0\u9EDE type=${leaf.type}\uFF08\u61C9\u70BA label\uFF0C\u5426\u5247 Prefab \u53EF\u80FD\u4E0D\u986F\u793A\u6587\u5B57\uFF09\uFF1A${leaf.name}`,
        figmaId: leaf.figmaId
      });
    }
    if (leaf.included !== false && isDefaultFigmaName(leaf.name)) {
      pushIssue(issues, {
        code: "DEFAULT_FIGMA_NAME",
        severity: "warn",
        message: `\u8449\u7BC0\u9EDE\u4ECD\u70BA Figma \u9810\u8A2D\u540D\u7A31\uFF0C\u5EFA\u8B70\u8A9E\u610F\u547D\u540D\uFF1A${leaf.name}`,
        figmaId: leaf.figmaId
      });
    }
  }
  const walkVirtual = (n) => {
    if (isButtonGroupVirtual(n)) {
      const w = n.absRect.width;
      const h = n.absRect.height;
      if (w < minBtn || h < minBtn) {
        pushIssue(issues, {
          code: "BUTTON_GROUP_TOO_SMALL",
          severity: "warn",
          message: `\u6309\u9215\u7FA4\u7D44\u5BB9\u5668 ${n.name} \u70BA ${w.toFixed(0)}\xD7${h.toFixed(0)}\uFF0C\u5C0F\u65BC\u6700\u5C0F ${minBtn}\xD7${minBtn}`,
          figmaId: n.figmaId
        });
      }
    }
    for (const c of n.children ?? []) walkVirtual(c);
  };
  walkVirtual(organized.root);
  if (options.sourceIr) {
    const leafVc = leafToInnerVirtualId(organized.root);
    const groupLeaves = /* @__PURE__ */ new Map();
    const collectGroups = (n, activeGroupId) => {
      const gid = isFigmaUserGroup(n) ? n.figmaId : activeGroupId;
      if (isIncludedLeaf(n) && gid) {
        const list = groupLeaves.get(gid) ?? [];
        list.push(n.figmaId);
        groupLeaves.set(gid, list);
      }
      for (const c of n.children ?? []) collectGroups(c, gid);
    };
    for (const c of options.sourceIr.root.children ?? []) collectGroups(c, null);
    for (const [groupId, leafIds] of groupLeaves) {
      if (leafIds.length < 2) continue;
      const zones = /* @__PURE__ */ new Set();
      for (const lid of leafIds) {
        const z = leafVc.get(lid);
        if (z) zones.add(z);
      }
      if (zones.size > 1) {
        const groupNode = findNodeById(options.sourceIr.root, groupId);
        pushIssue(issues, {
          code: "USER_GROUP_SPLIT",
          severity: "warn",
          message: `Figma Group\u300C${groupNode?.name ?? groupId}\u300D\u7684\u6210\u54E1\u88AB\u5206\u5230 ${zones.size} \u500B\u865B\u64EC\u5BB9\u5668\uFF0C\u53EF\u80FD\u9055\u53CD\u4E0D\u53EF\u62C6\u6563\u898F\u5247`,
          figmaId: groupId
        });
      }
    }
  }
  if (options.referenceOrganize) {
    let virtualCount = 0;
    const countVc = (n) => {
      if (isVirtualNode(n)) virtualCount += 1;
      for (const c of n.children ?? []) countVc(c);
    };
    countVc(organized.root);
    if (virtualCount < 2) {
      pushIssue(issues, {
        code: "FEW_VIRTUAL_CONTAINERS",
        severity: "info",
        message: `\u793A\u610F\u5716\u6574\u7406\u50C5\u7522\u751F ${virtualCount} \u500B\u865B\u64EC\u5BB9\u5668\uFF0C\u82E5\u9644\u5716\u6709\u591A\u500B\u5708\u9078\u5340\u8ACB\u6AA2\u67E5\u5206\u7D44\u662F\u5426\u5B8C\u6574`
      });
    }
  }
  return summarize({
    ok: true,
    errorCount: 0,
    warnCount: 0,
    infoCount: 0,
    issues
  });
}
function findNodeById(root, figmaId) {
  if (root.figmaId === figmaId) return root;
  for (const c of root.children ?? []) {
    const found = findNodeById(c, figmaId);
    if (found) return found;
  }
  return void 0;
}

// src/organize-service.ts
function buildValidation(sourceIr, organized, options) {
  const report = validateOrganizedIR(organized, {
    sourceIr,
    buttonGroupMinSize: options?.buttonGroupMinSize ?? BUTTON_GROUP_MIN_SIZE,
    referenceOrganize: options?.referenceOrganize
  });
  if (!report.ok || report.warnCount > 0) {
    console.warn(
      `[organize-validation] errors=${report.errorCount} warns=${report.warnCount} infos=${report.infoCount}`
    );
    for (const issue of report.issues) {
      console.warn(`  [${issue.severity}] ${issue.code}: ${issue.message}`);
    }
  }
  return report;
}
async function organizeWithCursor(ir, repoRoot, options) {
  if (isOrganizedIR(ir)) {
    throw new Error("IR \u5DF2\u662F organized \u7248\u672C\uFF0C\u8ACB\u91CD\u65B0\u89E3\u6790 Figma Page");
  }
  const customGuide = resolveCustomGuide(options?.customGuide);
  const raw = await callCursorAgent(
    buildAgentPrompt(ir),
    repoRoot,
    customGuide ? { customGuide } : void 0
  );
  const plan = normalizeAgentPlan(raw, ir);
  plan.organizer = "cursor-agent";
  const validation = validateAgentPlan(ir, plan);
  if (!validation.ok) {
    const errors = "errors" in validation ? validation.errors : ["unknown"];
    throw new Error(`Plan \u9A57\u8B49\u5931\u6557\uFF1A${errors.join("\uFF1B")}`);
  }
  const organized = applyAgentPlan(ir, plan, { guideOverrides: customGuide?.overrides });
  const postValidation = buildValidation(ir, organized, {
    buttonGroupMinSize: customGuide?.overrides.buttonGroupMinSize
  });
  return { plan, organized, validation: postValidation };
}
async function organizeWithCursorReference(ir, repoRoot, options) {
  if (isOrganizedIR(ir)) {
    throw new Error("IR \u5DF2\u662F organized \u7248\u672C\uFF0C\u8ACB\u91CD\u65B0\u89E3\u6790 Figma Page");
  }
  const refImage = await referenceImageToSdkImage({
    referenceImagePath: options?.referenceImagePath,
    referenceImageBase64: options?.referenceImageBase64,
    referenceImageName: options?.referenceImageName
  });
  if (!refImage) {
    throw new Error(
      "\u627E\u4E0D\u5230\u793A\u610F\u5716\u6A94\u6848\uFF0C\u7121\u6CD5\u505A\u5708\u9078\u5340\u5206\u7D44\u3002\u8ACB\u5148\u8F09\u5165\u793A\u610F\u5716\u5F8C\u518D\u57F7\u884C AI \u6574\u7406\u3002"
    );
  }
  const prompt = buildReferenceAgentPrompt(ir, {
    referenceImageName: options?.referenceImageName
  });
  const customGuide = resolveCustomGuide(options?.customGuide);
  const raw = await callCursorAgent(prompt, repoRoot, {
    images: [refImage],
    ...customGuide ? { customGuide } : {}
  });
  const plan = normalizeAgentPlan(raw, ir);
  plan.organizer = "cursor-agent";
  if (!plan.summary?.trim()) {
    plan.summary = options?.referenceImageName ? `\u6839\u64DA IR \u8207\u793A\u610F\u5716(${options.referenceImageName})\u5708\u9078\u5340\u751F\u6210 hierarchy` : "\u6839\u64DA IR \u8207\u793A\u610F\u5716\u5708\u9078\u5340\u751F\u6210 hierarchy";
  }
  const validation = validateAgentPlan(ir, plan);
  if (!validation.ok) {
    const errors = "errors" in validation ? validation.errors : ["unknown"];
    throw new Error(`Plan \u9A57\u8B49\u5931\u6557\uFF1A${errors.join("\uFF1B")}`);
  }
  const organized = applyAgentPlan(ir, plan, { guideOverrides: customGuide?.overrides });
  const postValidation = buildValidation(ir, organized, {
    buttonGroupMinSize: customGuide?.overrides.buttonGroupMinSize,
    referenceOrganize: true
  });
  return { plan, organized, validation: postValidation };
}

// src/bridge-server.ts
var REPO_ROOT = (0, import_path4.resolve)(__dirname, "../../..");
var PORT = Number(process.env.FTC_BRIDGE_PORT ?? 3847);
var BRIDGE_VERSION = "v1";
loadEnvFiles((0, import_path4.resolve)(__dirname, ".."));
loadEnvFiles(REPO_ROOT);
function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(payload);
}
function getRequestId(req, urlObj, bodyRequestId) {
  if (typeof bodyRequestId === "number" || typeof bodyRequestId === "string") {
    const fromBody = String(bodyRequestId).trim();
    if (fromBody) return fromBody;
  }
  const queryId = (urlObj.searchParams.get("requestId") ?? "").trim();
  if (queryId) return queryId;
  const headerId = req.headers["x-ftc-request-id"];
  if (typeof headerId === "string" && headerId.trim()) return headerId.trim();
  if (Array.isArray(headerId) && headerId[0]?.trim()) return headerId[0].trim();
  return "n/a";
}
function readBody(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolveBody(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
function sanitizeSegment(name) {
  return name.trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").replace(/\s+/g, "_") || "page";
}
function cloneWithPrefixedAssets(ir, prefix) {
  function walk(node) {
    return {
      ...node,
      asset: node.asset ? `${prefix}/${node.asset}` : void 0,
      children: node.children.map((c) => walk(c))
    };
  }
  return {
    ...ir,
    root: walk(ir.root)
  };
}
function collectAssetMap(root, out) {
  if (root.asset) out[root.figmaId] = root.asset;
  for (const c of root.children) collectAssetMap(c, out);
}
var server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }
  const rawUrl = req.url ?? "/";
  const urlObj = new URL(rawUrl, `http://${req.headers.host ?? `localhost:${PORT}`}`);
  const pathname = urlObj.pathname;
  if (req.method === "GET" && pathname === "/health") {
    const requestId = getRequestId(req, urlObj);
    sendJson(res, 200, {
      ok: true,
      requestId,
      version: BRIDGE_VERSION,
      service: "figma-cursor-bridge",
      port: PORT,
      hasCursorKey: Boolean(process.env.CURSOR_API_KEY?.trim())
    });
    return;
  }
  if (req.method === "POST" && pathname === "/organize") {
    try {
      const body = JSON.parse(await readBody(req));
      const requestId = getRequestId(req, urlObj, body.requestId);
      if (!body.ir?.root) {
        sendJson(res, 400, { ok: false, requestId, error: "\u7F3A\u5C11 ir.root" });
        return;
      }
      const customGuide = resolveCustomGuide({
        name: body.customGuideName,
        markdown: body.customGuideMarkdown
      });
      console.log(
        `[bridge][req:${requestId}] Cursor \u6574\u7406\u4E2D\u2026`,
        body.ir.source?.pageName,
        customGuide ? `(+ guide: ${customGuide.name ?? "user-guide.md"})` : ""
      );
      const { plan, organized, validation } = await organizeWithCursor(
        body.ir,
        REPO_ROOT,
        customGuide ? { customGuide } : void 0
      );
      sendJson(res, 200, {
        ok: true,
        requestId,
        plan,
        organized,
        summary: plan.summary,
        organizer: plan.organizer,
        validation
      });
    } catch (e) {
      const requestId = getRequestId(req, urlObj);
      const message = e instanceof Error ? e.message : String(e);
      console.error(`[bridge][req:${requestId}]`, message);
      sendJson(res, 500, { ok: false, requestId, error: message });
    }
    return;
  }
  if (req.method === "POST" && pathname === "/save-export") {
    try {
      const body = JSON.parse(await readBody(req));
      const requestId = getRequestId(req, urlObj, body.requestId);
      if (!body.ir?.root) {
        sendJson(res, 400, { ok: false, requestId, error: "\u7F3A\u5C11 ir.root" });
        return;
      }
      const pageName = (body.ir.source?.pageName ?? body.ir.root.name ?? "Page").trim();
      const pageFolder = sanitizeSegment(pageName);
      const prefix = pageFolder;
      const outRoot = (0, import_path4.join)(REPO_ROOT, "assets", "figma-import", pageFolder);
      (0, import_fs4.mkdirSync)(outRoot, { recursive: true });
      const irWithPrefix = cloneWithPrefixedAssets(body.ir, prefix);
      const irPath = (0, import_path4.join)(outRoot, `${pageFolder}.ir.json`);
      (0, import_fs4.writeFileSync)(irPath, JSON.stringify(irWithPrefix, null, 2), "utf8");
      const assetMap = {};
      collectAssetMap(irWithPrefix.root, assetMap);
      let savedImages = 0;
      for (const [figmaId, b64] of Object.entries(body.images ?? {})) {
        const rel = assetMap[figmaId];
        if (!rel) continue;
        const filePath = (0, import_path4.join)(REPO_ROOT, "assets", "figma-import", rel);
        (0, import_fs4.mkdirSync)((0, import_path4.join)(filePath, ".."), { recursive: true });
        (0, import_fs4.writeFileSync)(filePath, Buffer.from(b64, "base64"));
        savedImages++;
      }
      sendJson(res, 200, {
        ok: true,
        requestId,
        pageName,
        folder: `assets/figma-import/${pageFolder}`,
        irFile: `assets/figma-import/${pageFolder}/${pageFolder}.ir.json`,
        savedImages
      });
    } catch (e) {
      const requestId = getRequestId(req, urlObj);
      const message = e instanceof Error ? e.message : String(e);
      console.error(`[bridge save-export][req:${requestId}]`, message);
      sendJson(res, 500, { ok: false, requestId, error: message });
    }
    return;
  }
  if (req.method === "POST" && pathname === "/hierarchy-from-reference") {
    try {
      const body = JSON.parse(await readBody(req));
      const requestId = getRequestId(req, urlObj, body.requestId);
      if (!body.ir?.root) {
        sendJson(res, 400, { ok: false, requestId, error: "\u7F3A\u5C11 ir.root" });
        return;
      }
      const pageName = (body.ir.source?.pageName ?? body.ir.root.name ?? "Page").trim();
      const pageFolder = sanitizeSegment(pageName);
      const outRoot = (0, import_path4.join)(REPO_ROOT, "assets", "figma-import", pageFolder);
      (0, import_fs4.mkdirSync)(outRoot, { recursive: true });
      const sourceIrFile = `${pageFolder}.source.ir.json`;
      (0, import_fs4.writeFileSync)((0, import_path4.join)(outRoot, sourceIrFile), JSON.stringify(body.ir, null, 2), "utf8");
      let savedReferenceImage;
      if (body.referenceImageBase64?.trim()) {
        const ext = (body.referenceImageName?.split(".").pop() ?? "png").toLowerCase();
        const safeExt = ["png", "jpg", "jpeg", "webp"].includes(ext) ? ext : "png";
        savedReferenceImage = `reference.${safeExt}`;
        (0, import_fs4.writeFileSync)(
          (0, import_path4.join)(outRoot, savedReferenceImage),
          Buffer.from(body.referenceImageBase64, "base64")
        );
      }
      const referenceImagePath = savedReferenceImage ? (0, import_path4.join)(outRoot, savedReferenceImage) : void 0;
      const customGuide = resolveCustomGuide({
        name: body.customGuideName,
        markdown: body.customGuideMarkdown
      });
      const { plan, organized, validation } = await organizeWithCursorReference(
        body.ir,
        REPO_ROOT,
        {
          referenceImageName: body.referenceImageName,
          referenceImagePath,
          referenceImageBase64: body.referenceImageBase64,
          ...customGuide ? { customGuide } : {}
        }
      );
      const hierarchy = {
        summary: plan.summary,
        organizer: plan.organizer,
        virtualRoot: plan.virtualRoot,
        virtualContainers: plan.virtualContainers ?? []
      };
      const organizedFile = `${pageFolder}.hierarchy.ir.json`;
      const hierarchyFile = `${pageFolder}.hierarchy.json`;
      (0, import_fs4.writeFileSync)((0, import_path4.join)(outRoot, organizedFile), JSON.stringify(organized, null, 2), "utf8");
      (0, import_fs4.writeFileSync)((0, import_path4.join)(outRoot, hierarchyFile), JSON.stringify(hierarchy, null, 2), "utf8");
      sendJson(res, 200, {
        ok: true,
        requestId,
        pageName,
        organized,
        summary: plan.summary,
        validation,
        hierarchy,
        files: {
          folder: `assets/figma-import/${pageFolder}`,
          sourceIr: `assets/figma-import/${pageFolder}/${sourceIrFile}`,
          organizedIr: `assets/figma-import/${pageFolder}/${organizedFile}`,
          hierarchy: `assets/figma-import/${pageFolder}/${hierarchyFile}`,
          referenceImage: savedReferenceImage ? `assets/figma-import/${pageFolder}/${savedReferenceImage}` : null
        }
      });
    } catch (e) {
      const requestId = getRequestId(req, urlObj);
      const message = e instanceof Error ? e.message : String(e);
      console.error(`[bridge hierarchy-from-reference][req:${requestId}]`, message);
      sendJson(res, 500, { ok: false, requestId, error: message });
    }
    return;
  }
  sendJson(res, 404, { ok: false, requestId: getRequestId(req, urlObj), error: "Not found" });
});
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} \u5DF2\u88AB\u5360\u7528\uFF0Cbridge \u53EF\u80FD\u5DF2\u5728\u57F7\u884C\u3002`);
    console.error(`  \u76F4\u63A5\u4F7F\u7528\uFF1Ahttp://127.0.0.1:${PORT}/health`);
    console.error("  \u82E5\u8981\u91CD\u555F\uFF0C\u8ACB\u5148\u95DC\u9589\u820A process\uFF0C\u6216\u8A2D\u5B9A FTC_BRIDGE_PORT \u63DB\u57E0\u3002");
    process.exit(1);
  }
  throw err;
});
server.listen(PORT, () => {
  console.log(`FigmaToCreator Cursor bridge: http://localhost:${PORT}`);
  console.log(`Bridge version: ${BRIDGE_VERSION}`);
  console.log("  GET  /health");
  console.log("  POST /organize  { ir: IRDocument }");
  console.log("CURSOR_API_KEY:", process.env.CURSOR_API_KEY ? "\u5DF2\u8A2D\u5B9A \u2713" : "\u672A\u8A2D\u5B9A \u2717");
});
