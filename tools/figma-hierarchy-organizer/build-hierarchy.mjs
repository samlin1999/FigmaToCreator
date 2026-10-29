#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = { format: "tree" };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith("--")) continue;
    if (key === "--ir") args.ir = value;
    if (key === "--format") args.format = value;
  }
  return args;
}

function byYThenX(a, b) {
  const dy = (a?.rect?.y ?? 0) - (b?.rect?.y ?? 0);
  if (dy !== 0) return dy;
  return (a?.rect?.x ?? 0) - (b?.rect?.x ?? 0);
}

function asNode(name, source = null, children = []) {
  return {
    name,
    figmaId: source?.figmaId ?? null,
    children,
  };
}

function treeLines(node, prefix = "", isLast = true, depth = 0) {
  const selfLine = depth === 0 ? node.name : `${prefix}${isLast ? "└─ " : "├─ "}${node.name}`;
  const nextPrefix = depth === 0 ? "" : `${prefix}${isLast ? "   " : "│  "}`;
  const lines = [selfLine];
  const kids = node.children ?? [];
  for (let i = 0; i < kids.length; i += 1) {
    lines.push(...treeLines(kids[i], nextPrefix, i === kids.length - 1, depth + 1));
  }
  return lines;
}

function pairByIndex(listA, listB, itemName, aName, bName) {
  const pairs = [];
  const count = Math.min(listA.length, listB.length);
  for (let i = 0; i < count; i += 1) {
    pairs.push(
      asNode(`${itemName}_${String(i + 1).padStart(2, "0")}`, null, [
        asNode(aName, listA[i]),
        asNode(bName, listB[i]),
      ])
    );
  }
  return pairs;
}

function tripleByIndex(aList, bList, cList, itemName, aName, bName, cName) {
  const items = [];
  const count = Math.min(aList.length, bList.length, cList.length);
  for (let i = 0; i < count; i += 1) {
    items.push(
      asNode(`${itemName}_${String(i + 1).padStart(2, "0")}`, null, [
        asNode(aName, aList[i]),
        asNode(bName, bList[i]),
        asNode(cName, cList[i]),
      ])
    );
  }
  return items;
}

function flattenNodes(node) {
  const out = [];
  const walk = (n) => {
    out.push(n);
    for (const child of n?.children ?? []) walk(child);
  };
  walk(node);
  return out;
}

function buildHierarchy(ir) {
  const allNodes = flattenNodes(ir?.root ?? {});
  const byName = (name) => allNodes.filter((n) => n?.name === name).sort(byYThenX);
  const first = (name) => byName(name)[0] ?? null;

  const panelChat = first("panel_chat") ?? ir?.root ?? null;
  const panelChatBg = first("panel_chat_bg") ?? null;
  const tabGroupBg = first("tab_group");
  const panelTitleBg = first("panel_title");
  const panelInputBg = first("panel_input");

  const tabs = byName("tab");
  const tabTexts = byName("tab_text");
  const messages = byName("message");
  const heads = byName("head");
  const messageTexts = byName("message_text");

  const tabItems = pairByIndex(tabs, tabTexts, "tab_item", "tab", "tab_text");
  const messageItems = tripleByIndex(messages, heads, messageTexts, "message_item", "message", "head", "message_text");

  const hierarchy = asNode("panel_chat", panelChat, [
    asNode("panel_chat_bg", panelChatBg ?? panelChat),
    asNode("tab_group", tabGroupBg, [
      asNode("tab_group_bg", tabGroupBg),
      ...tabItems,
    ]),
    asNode("panel_title", panelTitleBg, [
      asNode("panel_title_bg", panelTitleBg),
      asNode("title", first("title")),
    ]),
    asNode("message_list", null, messageItems),
    asNode("panel_input", panelInputBg, [
      asNode("panel_input_bg", panelInputBg),
      asNode("input", first("input")),
      asNode("edit_text", first("edit_text")),
    ]),
  ]);

  return hierarchy;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.ir) {
    throw new Error("Missing required argument: --ir <path-to-ir-json>");
  }

  const irPath = path.resolve(process.cwd(), args.ir);
  const raw = fs.readFileSync(irPath, "utf8");
  const ir = JSON.parse(raw);
  const hierarchy = buildHierarchy(ir);

  if (args.format === "json") {
    process.stdout.write(`${JSON.stringify(hierarchy, null, 2)}\n`);
    return;
  }

  process.stdout.write(`${treeLines(hierarchy).join("\n")}\n`);
}

main();
