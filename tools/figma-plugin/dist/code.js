(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // ../ai-organizer/src/layer-name-i18n.ts
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
  function collectIncludedLeavesUnder(node) {
    const out = [];
    const walk = (n) => {
      var _a, _b;
      if (n.included === false) return;
      const isVirtual = n.figmaType === "VIRTUAL" || n.figmaId.startsWith("vc_");
      if (!isVirtual && !((_a = n.children) == null ? void 0 : _a.length)) out.push(n);
      for (const c of (_b = n.children) != null ? _b : []) walk(c);
    };
    walk(node);
    return out;
  }
  function collectOrganizeUnits(root) {
    var _a;
    const units = [];
    const walk = (n) => {
      var _a2;
      if (n.included === false) return;
      if (isFigmaUserGroup(n)) {
        const leaves = collectIncludedLeavesUnder(n);
        if (leaves.length) units.push({ node: n, leaves, isUserGroup: true });
        return;
      }
      if (!((_a2 = n.children) == null ? void 0 : _a2.length)) {
        units.push({ node: n, leaves: [n], isUserGroup: false });
        return;
      }
      for (const c of n.children) walk(c);
    };
    for (const c of (_a = root.children) != null ? _a : []) walk(c);
    return units;
  }

  // ../ai-organizer/src/normalize-plan.ts
  function sanitizeNodeName(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    return trimmed.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").replace(/\s+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  }

  // ../ai-organizer/src/infer-node-names.ts
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
    if (!(englishName == null ? void 0 : englishName.trim()) || isGenericFigmaLayerName(englishName)) return [];
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
    var _a, _b, _c, _d;
    if ((hint == null ? void 0 : hint.type) === "button" || (node == null ? void 0 : node.type) === "button") return true;
    const blob = `${(_a = hint == null ? void 0 : hint.organizeHint) != null ? _a : ""} ${(_b = hint == null ? void 0 : hint.name) != null ? _b : ""} ${(_c = node == null ? void 0 : node.name) != null ? _c : ""} ${(_d = node == null ? void 0 : node.organizeHint) != null ? _d : ""}`;
    return /按鈕|\bbutton\b/i.test(blob);
  }
  function isButtonAnnotatedText(text) {
    if (!(text == null ? void 0 : text.trim())) return false;
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
    var _a;
    const out = [];
    const walk = (n) => {
      var _a2;
      if (n.included === false) return;
      const isVirtual = n.figmaType === "VIRTUAL" || n.figmaId.startsWith("vc_");
      if (!isVirtual && !n.children.length) out.push(n);
      for (const c of (_a2 = n.children) != null ? _a2 : []) walk(c);
    };
    for (const c of (_a = root.children) != null ? _a : []) walk(c);
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
    var _a;
    const n = ((_a = counters.get(prefix)) != null ? _a : 0) + 1;
    counters.set(prefix, n);
    return `${prefix}_${String(n).padStart(2, "0")}`;
  }
  function applyGenericNamesToLeaves(root, page, options) {
    const skip = options == null ? void 0 : options.skipFigmaIds;
    const leaves = collectIncludedLeaves(root).sort(byYThenX);
    const counters = /* @__PURE__ */ new Map();
    for (const leaf of leaves) {
      if (skip == null ? void 0 : skip.has(leaf.figmaId)) continue;
      const prefix = inferGenericNamePrefix(leaf, page);
      const generated = sanitizeNodeName(nextIndexedName(prefix, counters));
      leaf.name = mergeNameWithOriginalTokens(leaf.name, generated);
    }
  }
  function fillMissingHintNames(nodeHints, ir) {
    var _a;
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
      if ((_a = hint == null ? void 0 : hint.name) == null ? void 0 : _a.trim()) continue;
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
    var _a, _b;
    for (const [figmaId, hint] of Object.entries(nodeHints)) {
      const node = nodeMap.get(figmaId);
      if (!isButtonHint(hint, node)) continue;
      if (((_a = hint.name) == null ? void 0 : _a.trim()) && node) {
        let merged = mergeNameWithOriginalTokens(node.name, hint.name);
        hint.name = ensureBtnInName(merged);
      } else if (node) {
        hint.name = ensureBtnInName(mergeNameWithOriginalTokens(node.name, node.name));
      }
    }
    for (const vc of virtualContainers != null ? virtualContainers : []) {
      if (!isButtonAnnotatedText(`${(_b = vc.organizeHint) != null ? _b : ""} ${vc.name}`)) continue;
      vc.name = ensureBtnInName(vc.name);
    }
  }

  // ../ai-organizer/src/button-group-bounds.ts
  var BUTTON_GROUP_MIN_SIZE = 60;
  function isButtonLikeNode(node, nodeHints) {
    if (node.figmaType === "VIRTUAL" || node.figmaId.startsWith("vc_")) {
      return /btn_.*_(item|group)\b/i.test(node.name) || /\bbtn\b.*\b(item|group)\b/i.test(node.name);
    }
    const hint = nodeHints[node.figmaId];
    return isButtonHint(hint, node) || node.type === "button" || BTN_IN_NAME.test(node.name);
  }
  function isButtonGroupContainer(vc, childNodes, nodeHints) {
    var _a, _b;
    if (!childNodes.length) return false;
    const name = (_a = vc.name) != null ? _a : "";
    if (/btn_.*_(item|group)\b/i.test(name) || /\bbtn\b.*\b(item|group)\b/i.test(name)) {
      return true;
    }
    const blob = `${name} ${(_b = vc.organizeHint) != null ? _b : ""}`;
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

  // ../ai-organizer/src/apply-plan.ts
  function cloneNode(node) {
    return __spreadProps(__spreadValues({}, node), {
      children: node.children.map(cloneNode)
    });
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
    var _a, _b, _c;
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
    const btnMin = (_a = guideOverrides == null ? void 0 : guideOverrides.buttonGroupMinSize) != null ? _a : BUTTON_GROUP_MIN_SIZE;
    absRect = applyButtonGroupMinBounds(absRect, vc, childNodes, nodeHints, btnMin);
    return {
      figmaId: vc.id,
      name: isButtonAnnotatedText(`${(_b = vc.organizeHint) != null ? _b : ""} ${vc.name}`) ? ensureBtnInName(vc.name) : vc.name,
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
      organizeHint: (_c = vc.organizeHint) != null ? _c : `\u865B\u64EC\u5BB9\u5668\uFF1A${vc.name}`,
      children: childNodes.map((n) => __spreadProps(__spreadValues({}, n), {
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
    var _a, _b, _c, _d;
    const result = cloneNode(ir.root);
    const doc = __spreadProps(__spreadValues({}, ir), {
      preserveVisual: true,
      organizedBy: plan.organizer,
      agentSummary: plan.summary,
      root: result
    });
    const namedByHint = /* @__PURE__ */ new Set();
    for (const [figmaId, hint] of Object.entries(plan.nodeHints)) {
      if ((_a = hint == null ? void 0 : hint.name) == null ? void 0 : _a.trim()) namedByHint.add(figmaId);
    }
    const nodeMap = indexNodes(result);
    for (const figmaId of Object.keys(plan.nodeHints)) {
      const hint = plan.nodeHints[figmaId];
      const node = nodeMap.get(figmaId);
      if (node && hint) applyHintToNode(node, __spreadProps(__spreadValues({}, hint), { figmaId }));
    }
    if (!((_c = (_b = plan.virtualRoot) == null ? void 0 : _b.children) == null ? void 0 : _c.length) || !((_d = plan.virtualContainers) == null ? void 0 : _d.length)) {
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
        const built = buildVirtualNode(vc, nodeMap, vcMap, pageAbs, plan.nodeHints, options == null ? void 0 : options.guideOverrides);
        if (built) newChildren.push(built);
      }
    }
    if (newChildren.length) {
      result.children = newChildren.map((n) => __spreadProps(__spreadValues({}, n), {
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

  // ../ai-organizer/src/geometry-heuristic.ts
  function ratio2(v, total) {
    return total > 0 ? v / total : 0;
  }
  function centerOf(node) {
    return {
      x: node.absRect.x + node.absRect.width / 2,
      y: node.absRect.y + node.absRect.height / 2
    };
  }
  function areaRatio2(node, page) {
    const pageArea = page.absRect.width * page.absRect.height;
    if (pageArea <= 0) return 0;
    return node.absRect.width * node.absRect.height / pageArea;
  }
  function unionAbsRect2(rects) {
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
  function byPaintThenY(a, b) {
    var _a, _b;
    const pa = (_a = a.paintOrder) != null ? _a : 0;
    const pb = (_b = b.paintOrder) != null ? _b : 0;
    if (pa !== pb) return pa - pb;
    const dy = a.absRect.y - b.absRect.y;
    if (dy !== 0) return dy;
    return a.absRect.x - b.absRect.x;
  }
  function inferWidget(node, page) {
    const pageAbs = page.absRect;
    const c = centerOf(node);
    const relX = ratio2(c.x - pageAbs.x, pageAbs.width);
    const relY = ratio2(c.y - pageAbs.y, pageAbs.height);
    const widthRatio = ratio2(node.absRect.width, pageAbs.width);
    const heightRatio = ratio2(node.absRect.height, pageAbs.height);
    if (areaRatio2(node, page) > 0.55) {
      return { top: 0, bottom: 0, left: 0, right: 0, stretchWidth: true, stretchHeight: true };
    }
    const widget = {};
    if (relY < 0.25) widget.top = Math.max(0, ratio2(node.absRect.y - pageAbs.y, pageAbs.height));
    if (relY > 0.75) {
      widget.bottom = Math.max(
        0,
        ratio2(pageAbs.y + pageAbs.height - (node.absRect.y + node.absRect.height), pageAbs.height)
      );
    }
    if (widthRatio > 0.85) {
      widget.left = Math.max(0, ratio2(node.absRect.x - pageAbs.x, pageAbs.width));
      widget.right = Math.max(
        0,
        ratio2(pageAbs.x + pageAbs.width - (node.absRect.x + node.absRect.width), pageAbs.width)
      );
      widget.stretchWidth = true;
    } else if (Math.abs(relX - 0.5) < 0.08) {
      widget.horizontalCenter = 0;
    } else if (relX < 0.35) {
      widget.left = Math.max(0, ratio2(node.absRect.x - pageAbs.x, pageAbs.width));
    } else if (relX > 0.65) {
      widget.right = Math.max(
        0,
        ratio2(pageAbs.x + pageAbs.width - (node.absRect.x + node.absRect.width), pageAbs.width)
      );
    }
    if (heightRatio > 0.7) widget.stretchHeight = true;
    return widget;
  }
  function zonePositionSlug(rect, page) {
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    const relX = ratio2(cx - page.absRect.x, page.absRect.width);
    const relY = ratio2(cy - page.absRect.y, page.absRect.height);
    if (relY < 0.33) {
      if (relX < 0.33) return "top_left";
      if (relX > 0.66) return "top_right";
      return "top";
    }
    if (relY > 0.66) {
      if (relX < 0.33) return "bottom_left";
      if (relX > 0.66) return "bottom_right";
      return "bottom";
    }
    if (relX < 0.33) return "mid_left";
    if (relX > 0.66) return "mid_right";
    return "mid";
  }
  function groupIntoRows(units, page) {
    const rowThreshold = Math.max(20, page.absRect.height * 0.045);
    const sorted = [...units].sort((a, b) => {
      const dy = a.node.absRect.y - b.node.absRect.y;
      if (dy !== 0) return dy;
      return a.node.absRect.x - b.node.absRect.x;
    });
    const rows = [];
    for (const unit of sorted) {
      const cy = centerOf(unit.node).y;
      let row = rows.find((r) => Math.abs(centerOf(r[0].node).y - cy) < rowThreshold);
      if (!row) {
        row = [];
        rows.push(row);
      }
      row.push(unit);
    }
    return rows;
  }
  function splitRowByXGaps(row, page) {
    if (row.length <= 1) return [row];
    const sorted = [...row].sort((a, b) => a.node.absRect.x - b.node.absRect.x);
    const gapThreshold = Math.max(28, page.absRect.width * 0.07);
    const groups = [[sorted[0]]];
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].node;
      const cur = sorted[i].node;
      const gap = cur.absRect.x - (prev.absRect.x + prev.absRect.width);
      if (gap > gapThreshold) groups.push([sorted[i]]);
      else groups[groups.length - 1].push(sorted[i]);
    }
    return groups;
  }
  function buildGeometryZones(units, page) {
    var _a;
    const positionCounters = /* @__PURE__ */ new Map();
    const zones = [];
    for (const row of groupIntoRows(units, page)) {
      for (const group of splitRowByXGaps(row, page)) {
        const bounds = unionAbsRect2(group.map((u) => u.node.absRect));
        const slug = zonePositionSlug(bounds, page);
        const seq = ((_a = positionCounters.get(slug)) != null ? _a : 0) + 1;
        positionCounters.set(slug, seq);
        zones.push({
          name: `zone_${slug}_${String(seq).padStart(2, "0")}`,
          units: group
        });
      }
    }
    return zones;
  }
  function roleFromZoneName(name) {
    const n = name.toLowerCase();
    if (n.includes("bg") || n.includes("background")) return "background";
    if (n.includes("top")) return "header";
    if (n.includes("bottom")) return "footer";
    if (n.includes("btn")) return "custom";
    return "content";
  }
  function unitOrganizeHint(units) {
    const leafCount = units.reduce((n, u) => n + u.leaves.length, 0);
    const groupCount = units.filter((u) => u.isUserGroup).length;
    if (groupCount) return `\u4F4D\u7F6E\u5206\u5340\uFF08${leafCount} \u500B\u7BC0\u9EDE\uFF0C\u542B ${groupCount} \u500B Figma Group\uFF09`;
    return `\u4F4D\u7F6E\u5206\u5340\uFF08${leafCount} \u500B\u7BC0\u9EDE\uFF09`;
  }
  function buildGeometryHeuristicPlan(ir) {
    const page = ir.root;
    const allUnits = collectOrganizeUnits(page);
    const allLeaves = allUnits.flatMap((u) => u.leaves);
    const backgrounds = [];
    const contentUnits = [];
    for (const unit of allUnits) {
      if (areaRatio2(unit.node, page) > 0.42) backgrounds.push(unit);
      else contentUnits.push(unit);
    }
    const zones = buildGeometryZones(contentUnits, page);
    const nodeHints = {};
    const virtualContainers = [];
    const virtualRootChildren = [];
    const nameCounters = /* @__PURE__ */ new Map();
    const assignLeafHints = (leaf, path) => {
      var _a;
      const prefix = inferGenericNamePrefix(leaf, page);
      const seq = ((_a = nameCounters.get(prefix)) != null ? _a : 0) + 1;
      nameCounters.set(prefix, seq);
      const generated = sanitizeNodeName(`${prefix}_${String(seq).padStart(2, "0")}`);
      const name = mergeNameWithOriginalTokens(leaf.name, generated);
      let containerRole = "content";
      if (backgrounds.some((u) => u.leaves.includes(leaf))) containerRole = "background";
      else if (path.includes("top")) containerRole = "header";
      else if (path.includes("bottom")) containerRole = "footer";
      nodeHints[leaf.figmaId] = {
        figmaId: leaf.figmaId,
        name,
        containerRole,
        widget: inferWidget(leaf, page),
        layout: { mode: "none" },
        organizeHint: `\u96E2\u7DDA\u6574\u7406\uFF1A${path}`
      };
    };
    if (backgrounds.length) {
      backgrounds.sort((a, b) => byPaintThenY(a.node, b.node));
      for (const unit of backgrounds) {
        for (const leaf of unit.leaves) assignLeafHints(leaf, "page_bg");
      }
      virtualContainers.push({
        id: "vc_page_bg",
        name: "page_bg",
        containerRole: "background",
        layout: { mode: "absolute" },
        children: backgrounds.map((u) => u.node.figmaId),
        organizeHint: "\u5168\u9801\u80CC\u666F\uFF08\u9762\u7A4D > 42%\uFF09"
      });
      virtualRootChildren.push("vc_page_bg");
    }
    const zoneVcIds = [];
    let zoneSeq = 0;
    for (const zone of zones) {
      zone.units.sort((a, b) => byPaintThenY(a.node, b.node));
      const path = zone.name;
      for (const unit of zone.units) {
        for (const leaf of unit.leaves) assignLeafHints(leaf, path);
      }
      const vcId = `vc_zone_${zoneSeq++}`;
      zoneVcIds.push(vcId);
      virtualContainers.push({
        id: vcId,
        name: zone.name,
        containerRole: roleFromZoneName(zone.name),
        layout: { mode: "absolute" },
        children: zone.units.map((u) => u.node.figmaId),
        organizeHint: unitOrganizeHint(zone.units)
      });
    }
    if (zoneVcIds.length) {
      virtualContainers.push({
        id: "vc_content",
        name: "content_root",
        containerRole: "content",
        layout: { mode: "absolute" },
        // back-first for Figma preview append
        children: [...zoneVcIds].reverse(),
        organizeHint: "\u4E3B\u5167\u5BB9\uFF1A\u4F9D\u4F4D\u7F6E\u81EA\u52D5\u5206\u5340"
      });
      virtualRootChildren.push("vc_content");
    } else if (contentUnits.length) {
      contentUnits.sort((a, b) => byPaintThenY(a.node, b.node));
      for (const unit of contentUnits) {
        for (const leaf of unit.leaves) assignLeafHints(leaf, "content_root");
      }
      virtualContainers.push({
        id: "vc_content",
        name: "content_root",
        containerRole: "content",
        layout: { mode: "absolute" },
        children: contentUnits.map((u) => u.node.figmaId),
        organizeHint: "\u4E3B\u5167\u5BB9\uFF08\u672A\u5206\u5340\uFF09"
      });
      virtualRootChildren.push("vc_content");
    }
    const leafMap = /* @__PURE__ */ new Map();
    for (const leaf of allLeaves) leafMap.set(leaf.figmaId, leaf);
    fillMissingHintNames(nodeHints, ir);
    enforceButtonNamesInPlan(nodeHints, leafMap, virtualContainers);
    return {
      version: "1.0",
      organizer: "heuristic-agent",
      preserveVisual: true,
      summary: `\u96E2\u7DDA\u5E7E\u4F55\u6574\u7406\uFF1A${zones.length} \u500B\u4F4D\u7F6E\u5206\u5340\u3001${backgrounds.length} \u500B\u80CC\u666F\u3001Widget \u951A\u70B9\u8207\u8A9E\u610F\u547D\u540D`,
      nodeHints,
      virtualRoot: { children: virtualRootChildren },
      virtualContainers
    };
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
    var _a;
    if (node.included === false) return false;
    if (isVirtualNode(node)) return false;
    return !((_a = node.children) == null ? void 0 : _a.length);
  }
  function collectIncludedLeaves2(root) {
    var _a;
    const out = [];
    const walk = (n) => {
      var _a2;
      if (n.included === false) return;
      if (isIncludedLeaf(n)) out.push(n);
      for (const c of (_a2 = n.children) != null ? _a2 : []) walk(c);
    };
    for (const c of (_a = root.children) != null ? _a : []) walk(c);
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
      var _a;
      if (n.figmaId) ids.push(n.figmaId);
      for (const c of (_a = n.children) != null ? _a : []) walk(c);
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
    var _a, _b, _c;
    if (!isVirtualNode(node)) return false;
    const name = (_a = node.name) != null ? _a : "";
    if (/btn_.*_(item|group)\b/i.test(name) || /\bbtn\b.*\b(item|group)\b/i.test(name)) {
      return true;
    }
    if (BTN_IN_NAME2.test(name) && ((_c = (_b = node.children) == null ? void 0 : _b.length) != null ? _c : 0) >= 2) return true;
    if (BTN_IN_NAME2.test(name) && /item|group/i.test(name)) return true;
    return false;
  }
  function leafToInnerVirtualId(root) {
    var _a;
    const map = /* @__PURE__ */ new Map();
    const walk = (n, innerVc) => {
      var _a2;
      const vc = isVirtualNode(n) ? n.figmaId : innerVc;
      if (isIncludedLeaf(n) && vc) map.set(n.figmaId, vc);
      for (const c of (_a2 = n.children) != null ? _a2 : []) walk(c, vc);
    };
    for (const c of (_a = root.children) != null ? _a : []) walk(c, null);
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
    var _a, _b, _c, _d;
    const issues = [];
    const minBtn = (_a = options.buttonGroupMinSize) != null ? _a : DEFAULT_BUTTON_GROUP_MIN;
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
      const hasText = Boolean((_b = leaf.text) == null ? void 0 : _b.length) || leaf.figmaType === "TEXT";
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
      var _a2;
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
      for (const c of (_a2 = n.children) != null ? _a2 : []) walkVirtual(c);
    };
    walkVirtual(organized.root);
    if (options.sourceIr) {
      const leafVc = leafToInnerVirtualId(organized.root);
      const groupLeaves = /* @__PURE__ */ new Map();
      const collectGroups = (n, activeGroupId) => {
        var _a2, _b2;
        const gid = isFigmaUserGroup(n) ? n.figmaId : activeGroupId;
        if (isIncludedLeaf(n) && gid) {
          const list = (_a2 = groupLeaves.get(gid)) != null ? _a2 : [];
          list.push(n.figmaId);
          groupLeaves.set(gid, list);
        }
        for (const c of (_b2 = n.children) != null ? _b2 : []) collectGroups(c, gid);
      };
      for (const c of (_c = options.sourceIr.root.children) != null ? _c : []) collectGroups(c, null);
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
            message: `Figma Group\u300C${(_d = groupNode == null ? void 0 : groupNode.name) != null ? _d : groupId}\u300D\u7684\u6210\u54E1\u88AB\u5206\u5230 ${zones.size} \u500B\u865B\u64EC\u5BB9\u5668\uFF0C\u53EF\u80FD\u9055\u53CD\u4E0D\u53EF\u62C6\u6563\u898F\u5247`,
            figmaId: groupId
          });
        }
      }
    }
    if (options.referenceOrganize) {
      let virtualCount = 0;
      const countVc = (n) => {
        var _a2;
        if (isVirtualNode(n)) virtualCount += 1;
        for (const c of (_a2 = n.children) != null ? _a2 : []) countVc(c);
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
    var _a;
    if (root.figmaId === figmaId) return root;
    for (const c of (_a = root.children) != null ? _a : []) {
      const found = findNodeById(c, figmaId);
      if (found) return found;
    }
    return void 0;
  }
  function formatValidationReportForUi(report) {
    if (!report.issues.length) {
      return "\u3010\u6574\u7406\u9A57\u8B49\u3011\u901A\u904E\uFF0C\u672A\u767C\u73FE\u554F\u984C\u3002";
    }
    const lines = [
      `\u3010\u6574\u7406\u9A57\u8B49\u3011${report.errorCount} \u932F\u8AA4\u3001${report.warnCount} \u8B66\u544A\u3001${report.infoCount} \u63D0\u793A`
    ];
    const maxShow = 12;
    for (let i = 0; i < Math.min(report.issues.length, maxShow); i++) {
      const issue = report.issues[i];
      const tag = issue.severity === "error" ? "\u932F\u8AA4" : issue.severity === "warn" ? "\u8B66\u544A" : "\u63D0\u793A";
      lines.push(`\u2022 [${tag}] ${issue.message}`);
    }
    if (report.issues.length > maxShow) {
      lines.push(`\u2022 \u2026\u53E6\u6709 ${report.issues.length - maxShow} \u9805\uFF08\u898B bridge \u65E5\u8A8C\u6216 IR\uFF09`);
    }
    return lines.join("\n");
  }

  // ../../shared/organize-timeouts.ts
  var ORGANIZE_TIMEOUT_DEFAULT_MIN = 3;
  var ORGANIZE_TIMEOUT_MIN_MIN = 1;
  var ORGANIZE_TIMEOUT_MAX_MIN = 15;
  var ORGANIZE_TIMEOUT_RPC_BUFFER_MS = 15e3;
  var ORGANIZE_TIMEOUT_STORAGE_KEY = "ftc_organize_timeout_min";
  function clampOrganizeTimeoutMin(value) {
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n)) return ORGANIZE_TIMEOUT_DEFAULT_MIN;
    return Math.min(
      ORGANIZE_TIMEOUT_MAX_MIN,
      Math.max(ORGANIZE_TIMEOUT_MIN_MIN, Math.round(n))
    );
  }
  function organizeTimeoutMsFromMin(minutes) {
    const min = clampOrganizeTimeoutMin(minutes);
    const bridgeMs = min * 60 * 1e3;
    return {
      bridgeMs,
      rpcMs: bridgeMs + ORGANIZE_TIMEOUT_RPC_BUFFER_MS
    };
  }

  // src/figma-preview.ts
  var sessionStack = [];
  var VIRTUAL_FRAME_PREFIX = "[FTC] ";
  function isVirtualNode2(node) {
    return node.figmaType === "VIRTUAL" || node.figmaId.startsWith("vc_") || node.name.startsWith(VIRTUAL_FRAME_PREFIX);
  }
  function isVirtualFrame(node) {
    return node.type === "FRAME" && node.name.startsWith(VIRTUAL_FRAME_PREFIX);
  }
  function nodeDepth(node) {
    let depth = 0;
    let cursor = node;
    while (cursor == null ? void 0 : cursor.parent) {
      depth++;
      cursor = cursor.parent;
    }
    return depth;
  }
  function visualAbsoluteXY(node) {
    const withBounds = node;
    if (withBounds.absoluteBoundingBox) {
      return { x: withBounds.absoluteBoundingBox.x, y: withBounds.absoluteBoundingBox.y };
    }
    const t = node.absoluteTransform;
    return { x: t[0][2], y: t[1][2] };
  }
  function unwrapVirtualFrames(page) {
    const frames = page.findAll((n) => isVirtualFrame(n)).filter((n) => n.type === "FRAME");
    if (frames.length === 0) return false;
    frames.sort((a, b) => nodeDepth(b) - nodeDepth(a));
    for (const frame of frames) {
      if (frame.removed) continue;
      const children = [...frame.children];
      for (const child of children) {
        const abs = visualAbsoluteXY(child);
        page.appendChild(child);
        if ("x" in child) {
          child.x = abs.x;
          child.y = abs.y;
        }
      }
      frame.remove();
    }
    return true;
  }
  function buildPaintOrderMap(page) {
    const map = /* @__PURE__ */ new Map();
    let order = 0;
    const walk = (parent) => {
      const children = parent.children;
      for (const child of children) {
        order += 1;
        map.set(child.id, order);
        if ("children" in child) walk(child);
      }
    };
    walk(page);
    return map;
  }
  function paintIndexForIRNode(node, paintOrder) {
    var _a;
    if (!isVirtualNode2(node)) {
      return (_a = paintOrder.get(node.figmaId)) != null ? _a : Number.MAX_SAFE_INTEGER;
    }
    let min = Number.MAX_SAFE_INTEGER;
    const walk = (n) => {
      var _a2;
      if (!isVirtualNode2(n)) {
        const v = paintOrder.get(n.figmaId);
        if (v !== void 0) min = Math.min(min, v);
        return;
      }
      for (const c of (_a2 = n.children) != null ? _a2 : []) walk(c);
    };
    walk(node);
    return min;
  }
  function sortChildrenForFigmaAppend(children, paintOrder) {
    return [...children].sort(
      (a, b) => paintIndexForIRNode(a, paintOrder) - paintIndexForIRNode(b, paintOrder)
    );
  }
  function localPositionFor(node, parentAbs) {
    if (node.absRect) {
      return {
        x: node.absRect.x - parentAbs.x,
        y: node.absRect.y - parentAbs.y,
        width: node.absRect.width,
        height: node.absRect.height
      };
    }
    return {
      x: node.rect.x,
      y: node.rect.y,
      width: node.rect.width,
      height: node.rect.height
    };
  }
  function flattenRealNodesWithAbs(node, out = []) {
    var _a;
    if (!isVirtualNode2(node) && node.absRect) out.push(node);
    for (const child of (_a = node.children) != null ? _a : []) flattenRealNodesWithAbs(child, out);
    return out;
  }
  async function reconcileAbsolutePositions(irRoot) {
    const targets = flattenRealNodesWithAbs(irRoot);
    let driftCount = 0;
    let driftMax = 0;
    for (const irNode of targets) {
      const figmaNode = await figma.getNodeByIdAsync(irNode.figmaId);
      if (!figmaNode || !("x" in figmaNode) || !irNode.absRect) continue;
      const now = visualAbsoluteXY(figmaNode);
      const dx = now.x - irNode.absRect.x;
      const dy = now.y - irNode.absRect.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0.1) {
        figmaNode.x -= dx;
        figmaNode.y -= dy;
        driftCount += 1;
        driftMax = Math.max(driftMax, dist);
      }
    }
    return { driftCount, driftMax };
  }
  function recordMove(node, session) {
    if (session.moves.some((m) => m.nodeId === node.id)) return;
    const parent = node.parent;
    if (!parent || !("children" in parent)) return;
    const siblings = parent.children;
    session.moves.push({
      nodeId: node.id,
      nodeName: node.name,
      parentId: parent.id,
      parentName: parent.name,
      index: siblings.indexOf(node),
      x: "x" in node ? node.x : 0,
      y: "y" in node ? node.y : 0
    });
  }
  function createVirtualFrame(node, parent, parentAbs) {
    const frame = figma.createFrame();
    frame.name = `${VIRTUAL_FRAME_PREFIX}${node.name}`;
    frame.layoutMode = "NONE";
    frame.clipsContent = false;
    frame.fills = [];
    frame.strokes = [];
    frame.strokeWeight = 0;
    frame.dashPattern = [];
    parent.appendChild(frame);
    const target = localPositionFor(node, parentAbs);
    frame.resize(Math.max(target.width, 1), Math.max(target.height, 1));
    frame.x = target.x;
    frame.y = target.y;
    return frame;
  }
  async function syncIRNodeToFigma(node, parent, session, parentAbs, paintOrder) {
    var _a, _b, _c, _d, _e;
    if (isVirtualNode2(node)) {
      const frame = createVirtualFrame(node, parent, parentAbs);
      session.virtualFrameIds.push(frame.id);
      const nextParentAbs = node.absRect ? { x: node.absRect.x, y: node.absRect.y } : { x: parentAbs.x + node.rect.x, y: parentAbs.y + node.rect.y };
      for (const child of sortChildrenForFigmaAppend((_a = node.children) != null ? _a : [], paintOrder)) {
        await syncIRNodeToFigma(child, frame, session, nextParentAbs, paintOrder);
      }
      return;
    }
    const figmaNode = await figma.getNodeByIdAsync(node.figmaId);
    if (!figmaNode) {
      throw new Error(`\u627E\u4E0D\u5230 Figma \u7BC0\u9EDE\u300C${node.name}\u300D\uFF08${node.figmaId}\uFF09`);
    }
    recordMove(figmaNode, session);
    const targetLayerName = (_b = node.name) == null ? void 0 : _b.trim();
    if (targetLayerName && figmaNode.name !== targetLayerName) {
      figmaNode.name = targetLayerName;
    }
    const fromParent = (_d = (_c = figmaNode.parent) == null ? void 0 : _c.name) != null ? _d : "Unknown";
    parent.appendChild(figmaNode);
    const toParent = parent.name;
    if (fromParent !== toParent) {
      session.diffs.push({
        nodeId: figmaNode.id,
        nodeName: figmaNode.name,
        fromParent,
        toParent
      });
    }
    if ("x" in figmaNode) {
      const target = localPositionFor(node, parentAbs);
      figmaNode.x = target.x;
      figmaNode.y = target.y;
    }
    const children = (_e = node.children) != null ? _e : [];
    if (children.length > 0) {
      if (!("children" in figmaNode)) {
        throw new Error(`\u7BC0\u9EDE\u300C${node.name}\u300D\u4E0D\u662F\u5BB9\u5668\uFF0C\u7121\u6CD5\u639B\u8F09\u5B50\u7BC0\u9EDE`);
      }
      const parentNode = figmaNode;
      const nextParentAbs = node.absRect ? { x: node.absRect.x, y: node.absRect.y } : { x: parentAbs.x + node.rect.x, y: parentAbs.y + node.rect.y };
      for (const child of sortChildrenForFigmaAppend(children, paintOrder)) {
        await syncIRNodeToFigma(child, parentNode, session, nextParentAbs, paintOrder);
      }
    }
  }
  async function applyOrganizedPreview(page, irRoot) {
    var _a;
    const paintOrder = buildPaintOrderMap(page);
    const cleared = await clearOrganizedPreview("all");
    if (!cleared) {
      unwrapVirtualFrames(page);
    }
    const session = {
      pageId: page.id,
      virtualFrameIds: [],
      moves: [],
      diffs: []
    };
    const children = (_a = irRoot.children) != null ? _a : [];
    for (const child of sortChildrenForFigmaAppend(children, paintOrder)) {
      await syncIRNodeToFigma(child, page, session, { x: 0, y: 0 }, paintOrder);
    }
    const drift = await reconcileAbsolutePositions(irRoot);
    sessionStack.push(session);
    return {
      moved: session.moves.length,
      virtualFrames: session.virtualFrameIds.length,
      diffs: session.diffs,
      driftCount: drift.driftCount,
      driftMax: drift.driftMax
    };
  }
  async function clearOrganizedPreview(scope = "all") {
    var _a;
    if (sessionStack.length === 0) {
      return false;
    }
    const targets = scope === "all" ? [...sessionStack].reverse() : [sessionStack[sessionStack.length - 1]];
    if (scope === "all") sessionStack.length = 0;
    else sessionStack.pop();
    for (const session of targets) {
      for (const move of [...session.moves].reverse()) {
        const node = await figma.getNodeByIdAsync(move.nodeId);
        const parent = await figma.getNodeByIdAsync(move.parentId);
        if (!node || !parent || !("appendChild" in parent)) continue;
        const siblings = parent.children;
        const index = Math.min(move.index, siblings.length);
        parent.insertChild(index, node);
        if (move.nodeName && node.name !== move.nodeName) {
          node.name = move.nodeName;
        }
        if ("x" in node) {
          node.x = move.x;
          node.y = move.y;
        }
      }
      for (const frameId of session.virtualFrameIds) {
        const frame = await figma.getNodeByIdAsync(frameId);
        if (frame) frame.remove();
      }
    }
    if (scope === "all") {
      const pageId = (_a = targets[0]) == null ? void 0 : _a.pageId;
      const page = pageId ? await figma.getNodeByIdAsync(pageId) : null;
      if (page) unwrapVirtualFrames(page);
    }
    return true;
  }
  function hasActivePreview() {
    return sessionStack.length > 0;
  }
  function getPreviewSessionCount() {
    return sessionStack.length;
  }

  // src/organizer.ts
  var PREFIX_RULES = [
    { pattern: /^panel[_-]/i, type: "panel", hint: "\u8A9E\u610F\uFF1APanel \u5BB9\u5668" },
    { pattern: /^btn[_-]/i, type: "button", hint: "\u8A9E\u610F\uFF1AButton" },
    { pattern: /^(bg|background)[_-]/i, type: "sprite", hint: "\u8A9E\u610F\uFF1ASprite \u80CC\u666F" },
    { pattern: /^(txt|text|label)[_-]/i, type: "label", hint: "\u8A9E\u610F\uFF1ALabel" },
    { pattern: /^(icon|img|image)[_-]/i, type: "sprite", hint: "\u8A9E\u610F\uFF1ASprite" }
  ];
  var SUFFIX_RULES = [
    { pattern: /panel$/i, type: "panel", hint: "\u8A9E\u610F\uFF1APanel \u5BB9\u5668" },
    { pattern: /btn$/i, type: "button", hint: "\u8A9E\u610F\uFF1AButton" }
  ];
  function inferNodeType(name, figmaType) {
    for (const rule of PREFIX_RULES) {
      if (rule.pattern.test(name)) {
        return { type: rule.type, hint: rule.hint };
      }
    }
    for (const rule of SUFFIX_RULES) {
      if (rule.pattern.test(name)) {
        return { type: rule.type, hint: rule.hint };
      }
    }
    if (figmaType === "TEXT") {
      return { type: "label", hint: "\u8A9E\u610F\uFF1ALabel\uFF08Figma TEXT\uFF09" };
    }
    if (figmaType === "FRAME" || figmaType === "COMPONENT" || figmaType === "INSTANCE") {
      return { type: "panel", hint: "\u8A9E\u610F\uFF1APanel \u5BB9\u5668\uFF08Figma Frame\uFF09" };
    }
    if (figmaType === "GROUP") {
      return { type: "group", hint: "\u4FDD\u7559\u539F\u59CB Group \u968E\u5C64" };
    }
    if (figmaType === "SECTION") {
      return { type: "container", hint: "\u4FDD\u7559\u539F\u59CB Section \u968E\u5C64" };
    }
    return { type: "sprite", hint: "\u8A9E\u610F\uFF1ASprite" };
  }
  function defaultIncluded(node) {
    if (/^(_|ignore|temp|draft)/i.test(node.name)) return false;
    return true;
  }

  // src/parser.ts
  function sanitizeFileName(name) {
    return name.replace(/[^\w\u4e00-\u9fff-]+/g, "_").replace(/_+/g, "_").toLowerCase();
  }
  function assetPathFor(node, scopeName) {
    if (node.figmaType === "TEXT") return void 0;
    const folder = sanitizeFileName(scopeName);
    const file = sanitizeFileName(node.name);
    return `textures/${folder}/${file}.png`;
  }
  function toAbsRect(node) {
    return { x: node.x, y: node.y, width: node.width, height: node.height };
  }
  function relativeRect(absRect, parentAbs) {
    return {
      x: absRect.x - parentAbs.x,
      y: absRect.y - parentAbs.y,
      width: absRect.width,
      height: absRect.height
    };
  }
  function toIRNode(node, scopeName, parentAbs) {
    var _a;
    const absRect = toAbsRect(node);
    const { type, hint } = inferNodeType(node.name, node.figmaType);
    const childNodes = ((_a = node.children) != null ? _a : []).map((child) => toIRNode(child, scopeName, absRect));
    return {
      figmaId: node.id,
      name: node.name,
      figmaType: node.figmaType,
      type,
      rect: relativeRect(absRect, parentAbs),
      absRect,
      asset: node.exportable ? assetPathFor(node, scopeName) : void 0,
      text: node.text,
      textColor: node.textColor,
      fontSize: node.fontSize,
      visible: node.visible,
      included: defaultIncluded(node),
      organizeHint: hint,
      paintOrder: node.paintOrder,
      children: childNodes
    };
  }
  function computeContentBounds(nodes) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const node of nodes) {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    }
    if (!Number.isFinite(minX)) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }
  function buildIRPageDocument(page, meta) {
    const contentBounds = computeContentBounds(page.children);
    const pageAbs = contentBounds;
    const children = page.children.map((child) => toIRNode(child, page.name, pageAbs));
    return {
      version: "1.0",
      scope: "page",
      preserveVisual: true,
      source: {
        fileKey: meta.fileKey,
        fileName: meta.fileName,
        pageId: page.id,
        pageName: page.name,
        exportedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      designSize: { width: contentBounds.width, height: contentBounds.height },
      root: {
        figmaId: page.id,
        name: page.name,
        figmaType: "PAGE",
        type: "page",
        rect: { x: 0, y: 0, width: contentBounds.width, height: contentBounds.height },
        absRect: pageAbs,
        visible: true,
        included: true,
        organizeHint: "Page \u6839\u7BC0\u9EDE\uFF08\u5167\u5BB9\u908A\u754C\uFF0C\u4E0D\u6539\u8B8A\u5B50\u7BC0\u9EDE\u4F4D\u7F6E\uFF09",
        children
      }
    };
  }

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

  // src/code.ts
  function childrenInLayerPanelOrder(node) {
    if (!("children" in node) || !Array.isArray(node.children)) return [];
    return [...node.children].reverse();
  }
  function parseRootsFromPageChildren(children) {
    return [...children];
  }
  function buildPaintOrderMap2(page) {
    const map = /* @__PURE__ */ new Map();
    let order = 0;
    const walk = (parent) => {
      const children = parent.children;
      for (const child of children) {
        order += 1;
        map.set(child.id, order);
        if ("children" in child) walk(child);
      }
    };
    walk(page);
    return map;
  }
  function rgbToHex(r, g, b) {
    const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }
  function extractTextColor(node) {
    const fill = node.fills;
    if (!Array.isArray(fill) || fill.length === 0) return void 0;
    const solid = fill.find((f) => f.type === "SOLID" && f.visible !== false);
    if (!(solid == null ? void 0 : solid.color)) return void 0;
    return rgbToHex(solid.color.r, solid.color.g, solid.color.b);
  }
  function getAbsoluteRect(node) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const sx = "absoluteTransform" in node && Array.isArray(node.absoluteTransform) ? (_a = node.absoluteTransform[0]) == null ? void 0 : _a[0] : void 0;
    const sy = "absoluteTransform" in node && Array.isArray(node.absoluteTransform) ? (_b = node.absoluteTransform[1]) == null ? void 0 : _b[1] : void 0;
    const tx = "absoluteTransform" in node && Array.isArray(node.absoluteTransform) ? (_c = node.absoluteTransform[0]) == null ? void 0 : _c[2] : void 0;
    const ty = "absoluteTransform" in node && Array.isArray(node.absoluteTransform) ? (_d = node.absoluteTransform[1]) == null ? void 0 : _d[2] : void 0;
    const width = typeof node.width === "number" ? node.width : void 0;
    const height = typeof node.height === "number" ? node.height : void 0;
    const bbox = "absoluteBoundingBox" in node ? node.absoluteBoundingBox : void 0;
    if (bbox && Number.isFinite(width) && Number.isFinite(height)) {
      let x = bbox.x;
      let y = bbox.y;
      if (Number.isFinite(tx) && Number.isFinite(sx) && sx < 0) {
        const correctedX = tx - width;
        if (Math.abs(bbox.x - tx) < 0.5) x = correctedX;
      }
      if (Number.isFinite(ty) && Number.isFinite(sy) && sy < 0) {
        const correctedY = ty - height;
        if (Math.abs(bbox.y - ty) < 0.5) y = correctedY;
      }
      return { x, y, width: bbox.width, height: bbox.height };
    }
    if (Number.isFinite(tx) && Number.isFinite(ty) && Number.isFinite(width) && Number.isFinite(height)) {
      const x = Number.isFinite(sx) && sx < 0 ? tx - width : tx;
      const y = Number.isFinite(sy) && sy < 0 ? ty - height : ty;
      return { x, y, width, height };
    }
    return { x: (_e = node.x) != null ? _e : 0, y: (_f = node.y) != null ? _f : 0, width: (_g = node.width) != null ? _g : 0, height: (_h = node.height) != null ? _h : 0 };
  }
  function isExportable(node) {
    if (node.type === "TEXT") return false;
    if ("children" in node && node.children.length > 0) return false;
    return node.type === "RECTANGLE" || node.type === "ELLIPSE" || node.type === "VECTOR" || node.type === "STAR" || node.type === "LINE" || node.type === "POLYGON" || node.type === "BOOLEAN_OPERATION";
  }
  function parseNode(node, paintOrderMap) {
    const absBounds = getAbsoluteRect(node);
    const base = {
      id: node.id,
      name: node.name,
      figmaType: node.type,
      x: absBounds.x,
      y: absBounds.y,
      width: absBounds.width,
      height: absBounds.height,
      visible: node.visible !== false,
      exportable: isExportable(node),
      paintOrder: paintOrderMap.get(node.id),
      children: []
    };
    if (node.type === "TEXT") {
      const textNode = node;
      return __spreadProps(__spreadValues({}, base), {
        text: textNode.characters,
        fontSize: typeof textNode.fontSize === "number" ? textNode.fontSize : 24,
        textColor: extractTextColor(textNode),
        exportable: false,
        children: []
      });
    }
    base.children = childrenInLayerPanelOrder(node).map((c) => parseNode(c, paintOrderMap));
    return base;
  }
  async function listPages() {
    const pages = figma.root.children.map((page) => ({
      id: page.id,
      name: page.name
    }));
    figma.ui.postMessage({
      type: "pages-list",
      pages,
      currentPageId: figma.currentPage.id
    });
  }
  figma.showUI(__html__, { width: 1280, height: 920, themeColors: true });
  void listPages();
  var BRIDGE_BASES = ["http://localhost:3847", "http://127.0.0.1:3847"];
  async function refreshIRVisibilityFromFigma(root) {
    const walk = async (node) => {
      var _a;
      const isVirtual = node.figmaType === "VIRTUAL" || node.figmaId.startsWith("vc_");
      if (!isVirtual && node.figmaId) {
        const figmaNode = await figma.getNodeByIdAsync(node.figmaId);
        if (figmaNode && "visible" in figmaNode) {
          node.visible = figmaNode.visible;
        }
      }
      for (const child of (_a = node.children) != null ? _a : []) await walk(child);
    };
    await walk(root);
  }
  async function refreshIRDocumentFromFigma(ir) {
    await refreshIRVisibilityFromFigma(ir.root);
  }
  function validationUiPayload(report) {
    if (!report) return {};
    return {
      validation: report,
      validationSummary: formatValidationReportForUi(report)
    };
  }
  var BRIDGE_TIMEOUT_MS = {
    health: 1e4,
    saveExport: 3e4
  };
  async function readOrganizeTimeoutMin() {
    const raw = await figma.clientStorage.getAsync(ORGANIZE_TIMEOUT_STORAGE_KEY);
    return clampOrganizeTimeoutMin(raw);
  }
  async function resolveOrganizeBridgeTimeoutMs(msg) {
    const min = typeof msg.organizeTimeoutMin === "number" ? clampOrganizeTimeoutMin(msg.organizeTimeoutMin) : await readOrganizeTimeoutMin();
    if (typeof msg.organizeTimeoutMin === "number") {
      await figma.clientStorage.setAsync(ORGANIZE_TIMEOUT_STORAGE_KEY, min);
    }
    return organizeTimeoutMsFromMin(min).bridgeMs;
  }
  function errorToString(e) {
    if (e instanceof Error) {
      const parts = [e.name, e.message].filter(Boolean);
      if (parts.length) return parts.join(": ");
      return e.toString();
    }
    if (typeof e === "string") return e;
    try {
      const json = JSON.stringify(e);
      if (json) return json;
    } catch (e2) {
    }
    return String(e);
  }
  function rpcError(source, code, error) {
    return {
      source,
      code,
      message: errorToString(error)
    };
  }
  async function fetchBridge(path, init, timeoutMs, requestId) {
    const pathWithRequestId = typeof requestId === "number" ? `${path}${path.includes("?") ? "&" : "?"}requestId=${encodeURIComponent(String(requestId))}` : path;
    const errors = [];
    for (const base of BRIDGE_BASES) {
      let timeoutHandle;
      try {
        const fetchPromise = fetch(`${base}${pathWithRequestId}`, init);
        const timeoutPromise = new Promise((_, reject) => {
          timeoutHandle = setTimeout(() => {
            reject(new Error(`bridge timeout (${timeoutMs}ms)`));
          }, timeoutMs);
        });
        return await Promise.race([fetchPromise, timeoutPromise]);
      } catch (e) {
        errors.push(`${base}${pathWithRequestId} -> ${errorToString(e)}`);
      } finally {
        if (timeoutHandle) clearTimeout(timeoutHandle);
      }
    }
    throw new Error(`bridge request failed (${pathWithRequestId}): ${errors.join(" | ")}`);
  }
  function buildOrganizeBridgeBody(msg, extra = {}) {
    var _a, _b;
    const body = __spreadValues({
      ir: msg.ir,
      requestId: msg.requestId
    }, extra);
    const markdown = (_a = msg.customGuideMarkdown) == null ? void 0 : _a.trim();
    if (markdown) {
      body.customGuideName = ((_b = msg.customGuideName) == null ? void 0 : _b.trim()) || "user-guide.md";
      body.customGuideMarkdown = markdown;
    }
    return JSON.stringify(body);
  }
  figma.ui.onmessage = async (msg) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    if (msg.type === "get-organize-timeout") {
      const organizeTimeoutMin = await readOrganizeTimeoutMin();
      figma.ui.postMessage({
        type: "get-organize-timeout-result",
        requestId: msg.requestId,
        ok: true,
        organizeTimeoutMin
      });
      return;
    }
    if (msg.type === "set-organize-timeout") {
      const organizeTimeoutMin = clampOrganizeTimeoutMin(msg.organizeTimeoutMin);
      await figma.clientStorage.setAsync(ORGANIZE_TIMEOUT_STORAGE_KEY, organizeTimeoutMin);
      figma.ui.postMessage({
        type: "set-organize-timeout-result",
        requestId: msg.requestId,
        ok: true,
        organizeTimeoutMin
      });
      return;
    }
    if (msg.type === "preview-custom-guide") {
      const markdown = (_b = (_a = msg.customGuideMarkdown) == null ? void 0 : _a.trim()) != null ? _b : "";
      const overrides = parseCustomGuideOverrides(markdown);
      const summary = formatGuideOverridesSummary(overrides).trim();
      figma.ui.postMessage({
        type: "preview-custom-guide-result",
        requestId: msg.requestId,
        ok: true,
        overrides,
        summary,
        hasProgrammaticRules: Boolean(overrides.buttonGroupMinSize)
      });
      return;
    }
    if (msg.type === "bridge-health") {
      try {
        const res = await fetchBridge("/health", void 0, BRIDGE_TIMEOUT_MS.health, msg.requestId);
        const data = await res.json();
        figma.ui.postMessage({
          type: "bridge-health-result",
          requestId: msg.requestId,
          ok: res.ok,
          source: "bridge-health",
          hasCursorKey: Boolean(data == null ? void 0 : data.hasCursorKey),
          version: data == null ? void 0 : data.version
        });
      } catch (e) {
        figma.ui.postMessage({
          type: "bridge-health-result",
          requestId: msg.requestId,
          ok: false,
          source: "bridge-health",
          error: rpcError("bridge", "HEALTH_REQUEST_FAILED", e)
        });
      }
      return;
    }
    if (msg.type === "cursor-organize" && msg.ir) {
      try {
        await refreshIRDocumentFromFigma(msg.ir);
        const organizeBridgeTimeoutMs = await resolveOrganizeBridgeTimeoutMs(msg);
        const res = await fetchBridge(
          "/organize",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: buildOrganizeBridgeBody(msg)
          },
          organizeBridgeTimeoutMs,
          msg.requestId
        );
        const data = await res.json();
        if (!res.ok || !data.ok || !data.organized) {
          throw new Error((_c = data.error) != null ? _c : `bridge organize failed: HTTP ${res.status}`);
        }
        const organized = data.organized;
        if (!organized.root) {
          throw new Error("bridge organize \u56DE\u50B3\u7F3A\u5C11 organized.root");
        }
        const page = figma.currentPage;
        const previewResult = await applyOrganizedPreview(
          page,
          organized.root
        );
        figma.ui.postMessage(__spreadValues({
          type: "cursor-organize-result",
          requestId: msg.requestId,
          ok: true,
          source: "cursor-organize",
          ir: data.organized,
          pageName: (_e = (_d = organized.source) == null ? void 0 : _d.pageName) != null ? _e : page.name,
          agentSummary: (_f = data.summary) != null ? _f : organized.agentSummary,
          moved: previewResult.moved,
          virtualFrames: previewResult.virtualFrames,
          diffs: previewResult.diffs,
          driftCount: previewResult.driftCount,
          driftMax: previewResult.driftMax,
          remainingSessions: getPreviewSessionCount()
        }, validationUiPayload(data.validation)));
      } catch (e) {
        figma.ui.postMessage({
          type: "cursor-organize-result",
          requestId: msg.requestId,
          ok: false,
          source: "cursor-organize",
          error: rpcError("organize", "ORGANIZE_FAILED", e)
        });
      }
      return;
    }
    if (msg.type === "reference-hierarchy-organize" && msg.ir) {
      try {
        await refreshIRDocumentFromFigma(msg.ir);
        const organizeBridgeTimeoutMs = await resolveOrganizeBridgeTimeoutMs(msg);
        const res = await fetchBridge(
          "/hierarchy-from-reference",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: buildOrganizeBridgeBody(msg, {
              referenceImageBase64: msg.referenceImageBase64,
              referenceImageName: msg.referenceImageName
            })
          },
          organizeBridgeTimeoutMs,
          msg.requestId
        );
        const data = await res.json();
        if (!res.ok || !data.ok || !data.organized) {
          throw new Error((_g = data.error) != null ? _g : `hierarchy organize failed: HTTP ${res.status}`);
        }
        const organized = data.organized;
        if (!organized.root) throw new Error("hierarchy organize \u56DE\u50B3\u7F3A\u5C11 organized.root");
        const page = figma.currentPage;
        const previewResult = await applyOrganizedPreview(
          page,
          organized.root
        );
        figma.ui.postMessage(__spreadValues({
          type: "reference-hierarchy-result",
          requestId: msg.requestId,
          ok: true,
          ir: data.organized,
          pageName: (_i = (_h = organized.source) == null ? void 0 : _h.pageName) != null ? _i : page.name,
          summary: data.summary,
          moved: previewResult.moved,
          virtualFrames: previewResult.virtualFrames,
          diffs: previewResult.diffs,
          driftCount: previewResult.driftCount,
          driftMax: previewResult.driftMax,
          remainingSessions: getPreviewSessionCount(),
          files: data.files
        }, validationUiPayload(data.validation)));
      } catch (e) {
        figma.ui.postMessage({
          type: "reference-hierarchy-result",
          requestId: msg.requestId,
          ok: false,
          error: rpcError("reference-hierarchy", "REFERENCE_ORGANIZE_FAILED", e)
        });
      }
      return;
    }
    if (msg.type === "list-pages") {
      await listPages();
      return;
    }
    if (msg.type === "organize-page") {
      if (!msg.pageId) {
        if (typeof msg.requestId === "number") {
          figma.ui.postMessage({
            type: "organize-page-result",
            requestId: msg.requestId,
            ok: false,
            error: "\u8ACB\u62D6\u66F3 Page \u5230\u6574\u7406\u5340"
          });
        }
        figma.ui.postMessage({ type: "error", message: "\u8ACB\u62D6\u66F3 Page \u5230\u6574\u7406\u5340" });
        return;
      }
      const page = await figma.getNodeByIdAsync(msg.pageId);
      if (!page || page.type !== "PAGE") {
        if (typeof msg.requestId === "number") {
          figma.ui.postMessage({
            type: "organize-page-result",
            requestId: msg.requestId,
            ok: false,
            error: "\u627E\u4E0D\u5230\u6307\u5B9A\u7684 Page"
          });
        }
        figma.ui.postMessage({ type: "error", message: "\u627E\u4E0D\u5230\u6307\u5B9A\u7684 Page" });
        return;
      }
      await figma.setCurrentPageAsync(page);
      const paintOrderMap = buildPaintOrderMap2(page);
      const parsedChildren = parseRootsFromPageChildren(page.children).reverse().map((c) => parseNode(c, paintOrderMap));
      const ir = buildIRPageDocument(
        {
          id: page.id,
          name: page.name,
          children: parsedChildren
        },
        {
          fileKey: (_j = figma.fileKey) != null ? _j : "local",
          fileName: figma.root.name
        }
      );
      figma.ui.postMessage({ type: "ir-ready", ir, pageName: page.name });
      if (typeof msg.requestId === "number") {
        figma.ui.postMessage({
          type: "organize-page-result",
          requestId: msg.requestId,
          ok: true,
          ir,
          pageName: page.name
        });
      }
      return;
    }
    if (msg.type === "agent-organize-heuristic" && msg.ir) {
      try {
        const sourceIr = msg.ir;
        await refreshIRDocumentFromFigma(sourceIr);
        const plan = buildGeometryHeuristicPlan(sourceIr);
        const organized = applyAgentPlan(sourceIr, plan);
        const validation = validateOrganizedIR(organized, {
          sourceIr,
          buttonGroupMinSize: BUTTON_GROUP_MIN_SIZE
        });
        const page = figma.currentPage;
        const previewResult = await applyOrganizedPreview(
          page,
          organized.root
        );
        figma.ui.postMessage(__spreadValues({
          type: "heuristic-organize-result",
          requestId: msg.requestId,
          ok: true,
          ir: organized,
          pageName: (_k = organized.source.pageName) != null ? _k : page.name,
          agentSummary: plan.summary,
          moved: previewResult.moved,
          virtualFrames: previewResult.virtualFrames,
          diffs: previewResult.diffs,
          driftCount: previewResult.driftCount,
          driftMax: previewResult.driftMax,
          remainingSessions: getPreviewSessionCount()
        }, validationUiPayload(validation)));
      } catch (e) {
        figma.ui.postMessage({
          type: "heuristic-organize-result",
          requestId: msg.requestId,
          ok: false,
          error: e instanceof Error ? e.message : String(e)
        });
      }
      return;
    }
    if (msg.type === "apply-organized-and-preview" && msg.ir) {
      try {
        const ir = msg.ir;
        if (!((_m = (_l = ir.root) == null ? void 0 : _l.children) == null ? void 0 : _m.length)) {
          figma.ui.postMessage({ type: "error", message: "organized IR \u7F3A\u5C11 root.children" });
          return;
        }
        const page = figma.currentPage;
        const result = await applyOrganizedPreview(
          page,
          ir.root
        );
        figma.ui.postMessage({
          type: "organize-preview-done",
          ir: msg.ir,
          pageName: (_o = (_n = ir.source) == null ? void 0 : _n.pageName) != null ? _o : page.name,
          agentSummary: msg.ir.agentSummary,
          moved: result.moved,
          virtualFrames: result.virtualFrames,
          diffs: result.diffs,
          driftCount: result.driftCount,
          driftMax: result.driftMax,
          remainingSessions: getPreviewSessionCount()
        });
      } catch (e) {
        figma.ui.postMessage({
          type: "error",
          message: e instanceof Error ? e.message : String(e)
        });
      }
      return;
    }
    if (msg.type === "preview-to-figma" && msg.ir) {
      try {
        const ir = msg.ir;
        if (!((_q = (_p = ir.root) == null ? void 0 : _p.children) == null ? void 0 : _q.length)) {
          figma.ui.postMessage({ type: "error", message: "\u8ACB\u5148\u5B8C\u6210 AI \u6574\u7406" });
          return;
        }
        const page = figma.currentPage;
        const result = await applyOrganizedPreview(
          page,
          ir.root
        );
        figma.ui.postMessage({
          type: "preview-applied",
          moved: result.moved,
          virtualFrames: result.virtualFrames,
          pageName: page.name,
          diffs: result.diffs,
          driftCount: result.driftCount,
          driftMax: result.driftMax,
          remainingSessions: getPreviewSessionCount()
        });
      } catch (e) {
        figma.ui.postMessage({
          type: "error",
          message: e instanceof Error ? e.message : String(e)
        });
      }
    }
    if (msg.type === "clear-figma-preview") {
      const before = getPreviewSessionCount();
      const cleared = await clearOrganizedPreview((_r = msg.scope) != null ? _r : "all");
      const after = getPreviewSessionCount();
      figma.ui.postMessage({
        type: "preview-cleared",
        cleared,
        pageId: figma.currentPage.id,
        pageName: figma.currentPage.name,
        scope: (_s = msg.scope) != null ? _s : "all",
        restoredSessions: Math.max(before - after, 0),
        remainingSessions: after
      });
    }
    if (msg.type === "get-preview-state") {
      figma.ui.postMessage({ type: "preview-state", active: hasActivePreview() });
    }
    if (msg.type === "export-confirmed" && msg.ir) {
      figma.ui.postMessage({ type: "export-start" });
      try {
        const ir = msg.ir;
        if (!ir.root) {
          figma.ui.postMessage({ type: "export-error", message: "IR \u683C\u5F0F\u932F\u8AA4\uFF1A\u7F3A\u5C11 root" });
          return;
        }
        await refreshIRDocumentFromFigma(ir);
        const exportIds = collectExportableIds(ir.root);
        const images = {};
        const errors = [];
        for (let i = 0; i < exportIds.length; i++) {
          const id = exportIds[i];
          figma.ui.postMessage({
            type: "export-progress",
            current: i + 1,
            total: exportIds.length
          });
          try {
            const n = await figma.getNodeByIdAsync(id);
            if (!n || !("exportAsync" in n)) {
              errors.push(`${id}: \u7BC0\u9EDE\u4E0D\u652F\u63F4\u532F\u51FA`);
              continue;
            }
            const bytes = await n.exportAsync({
              format: "PNG",
              constraint: { type: "SCALE", value: 1 }
            });
            images[id] = figma.base64Encode(bytes);
          } catch (e) {
            const name = (_u = (_t = await figma.getNodeByIdAsync(id)) == null ? void 0 : _t.name) != null ? _u : id;
            errors.push(`${name}: ${e instanceof Error ? e.message : String(e)}`);
          }
        }
        try {
          const exportRequestId = Date.now();
          const saveRes = await fetchBridge(
            "/save-export",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ir: msg.ir, images, requestId: exportRequestId })
            },
            BRIDGE_TIMEOUT_MS.saveExport,
            exportRequestId
          );
          const saveData = await saveRes.json();
          if (!saveRes.ok || !saveData.ok) {
            throw new Error((_v = saveData.error) != null ? _v : `HTTP ${saveRes.status}`);
          }
          figma.ui.postMessage({
            type: "export-saved",
            folder: saveData.folder,
            irFile: saveData.irFile,
            savedImages: (_w = saveData.savedImages) != null ? _w : 0,
            errors
          });
        } catch (saveErr) {
          figma.ui.postMessage({
            type: "export-save-fallback",
            message: `\u81EA\u52D5\u5B58\u6A94\u5931\u6557\uFF0C\u6539\u7528\u4E0B\u8F09\uFF1A${errorToString(saveErr)}`
          });
          figma.ui.postMessage({ type: "export-images", images, ir: msg.ir, errors });
        }
      } catch (e) {
        figma.ui.postMessage({
          type: "export-error",
          message: e instanceof Error ? e.message : String(e)
        });
      }
    }
    if (msg.type === "close") {
      figma.closePlugin();
    }
  };
  function collectExportableIds(node) {
    var _a;
    const ids = [];
    if (node.included === false) return ids;
    if (node.asset) {
      ids.push(node.figmaId);
    }
    for (const child of (_a = node.children) != null ? _a : []) {
      ids.push(...collectExportableIds(child));
    }
    return ids;
  }
})();
