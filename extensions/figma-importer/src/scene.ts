/**
 * 場景腳本：在編輯器場景環境建立 UI 節點樹並存成 Prefab
 * 使用 absRect 定位，確保與 Figma 視覺一致。
 */
/// <reference path="./types.d.ts" />

import { join } from 'path';
import * as cc from 'cc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(module as any).paths.push(join(Editor.App.path, 'node_modules'));

interface IRRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface IRNode {
  figmaId: string;
  name: string;
  figmaType?: string;
  type: string;
  rect: IRRect;
  absRect?: IRRect;
  asset?: string;
  text?: string;
  textColor?: string;
  fontSize?: number;
  visible: boolean;
  included: boolean;
  layout?: { mode?: string; spacing?: number; resizeMode?: string };
  widget?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    horizontalCenter?: number;
    verticalCenter?: number;
    stretchWidth?: boolean;
    stretchHeight?: boolean;
  };
  containerRole?: string;
  children: IRNode[];
  paintOrder?: number;
}

interface IRDocument {
  designSize: { width: number; height: number };
  root: IRNode;
}

const FIGMA_IMPORT_ROOT = 'db://assets/figma-import';
const PREFAB_ANCHOR_X = 0.5;
const PREFAB_ANCHOR_Y = 0.5;

function relativeFromAbs(nodeAbs: IRRect, parentAbs: IRRect): IRRect {
  return {
    x: nodeAbs.x - parentAbs.x,
    y: nodeAbs.y - parentAbs.y,
    width: nodeAbs.width,
    height: nodeAbs.height,
  };
}

function hexToColor(hex: string): cc.Color {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return new cc.Color(r, g, b, 255);
}

function resolveAbsRect(nodeData: IRNode, parentAbs: IRRect): IRRect {
  if (nodeData.absRect) return nodeData.absRect;
  const rel = nodeData.rect;
  return {
    x: parentAbs.x + rel.x,
    y: parentAbs.y + rel.y,
    width: rel.width,
    height: rel.height,
  };
}

/**
 * 父節點 anchor 為 (0.5,0.5) 時，local 原點在父內容中心。
 * rel 為 Figma 相對父層左上角的矩形 → 換算本節點中心點的 local position。
 */
function positionForCenterAnchor(rel: IRRect, parentAbs: IRRect): { x: number; y: number } {
  return {
    x: -parentAbs.width / 2 + rel.x + rel.width * PREFAB_ANCHOR_X,
    y: parentAbs.height / 2 - rel.y - rel.height * PREFAB_ANCHOR_Y,
  };
}

function setupTransform(node: cc.Node, rel: IRRect, parentAbs: IRRect): void {
  const ui = node.getComponent(cc.UITransform) ?? node.addComponent(cc.UITransform);
  ui.setContentSize(rel.width, rel.height);
  ui.setAnchorPoint(PREFAB_ANCHOR_X, PREFAB_ANCHOR_Y);
  const pos = positionForCenterAnchor(rel, parentAbs);
  node.setPosition(pos.x, pos.y, 0);
}

/** IR asset 路徑 → 多種 db 路徑候選（含扁平化 fallback） */
function buildDbPathCandidates(assetPath: string): string[] {
  const norm = assetPath.replace(/\\/g, '/').replace(/^\/+/, '');
  const fileName = norm.split('/').pop() ?? norm;
  const flatFromPath = norm.replace(/\//g, '__');
  const uniq = new Set<string>([
    `${FIGMA_IMPORT_ROOT}/${norm}`,
    `${FIGMA_IMPORT_ROOT}/${flatFromPath}`,
    `${FIGMA_IMPORT_ROOT}/${fileName}`,
  ]);
  return [...uniq];
}

async function querySpriteFrameUuid(imageDbPath: string): Promise<string | null> {
  const urls = [`${imageDbPath}@f9941`, imageDbPath];
  for (const url of urls) {
    try {
      const info = (await Editor.Message.request('asset-db', 'query-asset-info', url)) as {
        uuid?: string;
        type?: string;
        importer?: string;
      } | null;
      if (!info?.uuid) continue;
      const label = `${info.type ?? ''} ${info.importer ?? ''}`;
      if (label.includes('sprite-frame') || url.endsWith('@f9941')) {
        return info.uuid;
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

async function loadSpriteFrameByUuid(uuid: string): Promise<cc.SpriteFrame | null> {
  const cached = cc.assetManager.assets.get(uuid);
  if (cached instanceof cc.SpriteFrame) {
    return cached;
  }

  return new Promise((resolve) => {
    cc.assetManager.loadAny(uuid, (err: Error | null, asset: cc.SpriteFrame) => {
      resolve(err || !asset ? null : asset);
    });
  });
}

async function loadSpriteFrame(
  assetPath: string,
): Promise<{ spriteFrame: cc.SpriteFrame | null; resolvedPath?: string }> {
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

async function attachSprite(node: cc.Node, assetPath: string, missingAssets: string[]): Promise<void> {
  const sprite = node.getComponent(cc.Sprite) ?? node.addComponent(cc.Sprite);
  const { spriteFrame } = await loadSpriteFrame(assetPath);
  if (spriteFrame) {
    sprite.spriteFrame = spriteFrame;
    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    return;
  }
  missingAssets.push(assetPath);
  console.warn(`[figma-importer] 找不到貼圖: ${assetPath}（已嘗試 figma-import 內多種路徑）`);
}

function isVirtualContainer(node: IRNode): boolean {
  return node.figmaType === 'VIRTUAL' || node.figmaId.startsWith('vc_');
}

function isOrganizedPageRoot(parent: IRNode, children: IRNode[]): boolean {
  const isPage = parent.type === 'page' || parent.figmaType === 'PAGE';
  return isPage && children.some((c) => isVirtualContainer(c));
}

function zOrderKey(node: IRNode): number {
  const roleRank: Record<string, number> = {
    background: 0,
    content: 100,
    list: 200,
    header: 300,
    footer: 400,
    overlay: 500,
    custom: 600,
  };
  return roleRank[node.containerRole ?? 'custom'] ?? 999;
}

/** 虛擬分區等容器無 paintOrder 時，用子樹最小 paintOrder 代表整組疊序 */
function minPaintOrderInTree(node: IRNode): number | null {
  const values: number[] = [];
  if (typeof node.paintOrder === 'number') values.push(node.paintOrder);
  for (const c of node.children ?? []) {
    const sub = minPaintOrderInTree(c);
    if (sub !== null) values.push(sub);
  }
  return values.length ? Math.min(...values) : null;
}

function effectiveZOrder(node: IRNode): number {
  const painted = minPaintOrderInTree(node);
  if (painted !== null) return painted;
  return zOrderKey(node);
}

/** Cocos：先 addChild 的在底層（back-first） */
function orderChildrenForCocos(children: IRNode[], parent: IRNode): IRNode[] {
  if (!children.length) return children;

  const hasSubtreePaint = children.some((c) => minPaintOrderInTree(c) !== null);
  if (hasSubtreePaint || children.every((c) => typeof c.paintOrder === 'number')) {
    return [...children].sort((a, b) => effectiveZOrder(a) - effectiveZOrder(b));
  }

  if (isVirtualContainer(parent) || isOrganizedPageRoot(parent, children)) {
    return [...children].sort((a, b) => zOrderKey(a) - zOrderKey(b));
  }

  // 扁平解析為 Layers 面板順序（front-first）→ 反轉後 back-first 建立
  return [...children].reverse();
}

function shouldAttachLabel(nodeData: IRNode): boolean {
  return Boolean(nodeData.text?.length) || nodeData.figmaType === 'TEXT';
}

function attachLabel(node: cc.Node, nodeData: IRNode, nodeAbs: IRRect): void {
  if (!nodeData.text) return;
  const label = node.addComponent(cc.Label);
  label.string = nodeData.text;
  const fontSize = nodeData.fontSize ?? 24;
  label.fontSize = fontSize;
  label.lineHeight = Math.round(fontSize * 1.2);
  label.enableWrapText = false;
  // Figma 單字/數字常見極窄文字框（如按鈕上的 "7"），CLAMP 會裁切到不可見。
  const isNarrow = nodeAbs.width < fontSize * 0.75;
  if (isNarrow) {
    label.horizontalAlign = cc.HorizontalTextAlignment.CENTER;
    label.verticalAlign = cc.VerticalTextAlignment.CENTER;
    label.overflow = cc.Label.Overflow.NONE;
  } else {
    label.horizontalAlign = cc.HorizontalTextAlignment.LEFT;
    label.overflow = cc.Label.Overflow.CLAMP;
    const isTallTextBox = nodeAbs.height > fontSize * 1.6;
    label.verticalAlign = isTallTextBox
      ? cc.VerticalTextAlignment.CENTER
      : cc.VerticalTextAlignment.TOP;
  }
  if (nodeData.textColor) {
    label.color = hexToColor(nodeData.textColor);
  }
}

async function buildNodeTree(
  nodeData: IRNode,
  parent: cc.Node,
  parentAbs: IRRect,
  missingAssets: string[],
  parentActive = true,
): Promise<cc.Node | null> {
  if (nodeData.included === false) return null;

  const nodeAbs = resolveAbsRect(nodeData, parentAbs);
  const rel = relativeFromAbs(nodeAbs, parentAbs);
  const node = new cc.Node(nodeData.name);
  const selfActive = parentActive && nodeData.visible !== false;
  node.active = selfActive;
  setupTransform(node, rel, parentAbs);
  parent.addChild(node);
  // widget / layout 提示保留在 IR，建立 Prefab 時只用 absRect，避免覆寫視覺位置

  if (shouldAttachLabel(nodeData)) {
    attachLabel(node, nodeData, nodeAbs);
  } else if (nodeData.type === 'button') {
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

export const methods = {
  async buildPrefabFromIR(ir: IRDocument, _prefabSaveUrl: string) {
    try {
      const scene = cc.director.getScene();
      if (!scene) {
        return { ok: false, error: '請先開啟一個場景再匯入' };
      }

      const missingAssets: string[] = [];
      const rootAbs = resolveAbsRect(ir.root, { x: 0, y: 0, width: 0, height: 0 });
      const root = new cc.Node(ir.root.name);
      const sceneOrigin: IRRect = { x: 0, y: 0, width: 0, height: 0 };
      setupTransform(
        root,
        {
          x: rootAbs.x,
          y: rootAbs.y,
          width: rootAbs.width,
          height: rootAbs.height,
        },
        sceneOrigin,
      );
      scene.addChild(root);

      for (const child of orderChildrenForCocos(ir.root.children ?? [], ir.root)) {
        await buildNodeTree(child, root, rootAbs, missingAssets);
      }

      return {
        ok: true,
        rootUuid: root.uuid,
        rootName: root.name,
        missingAssets,
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, error: msg };
    }
  },

  removeNodeByUuid(uuid: string) {
    const scene = cc.director.getScene();
    if (!scene) return { ok: false };
    const queue: cc.Node[] = [scene];
    while (queue.length) {
      const n = queue.shift()!;
      if (n.uuid === uuid) {
        n.destroy();
        return { ok: true };
      }
      queue.push(...n.children);
    }
    return { ok: false };
  },
};

export function load() {}
export function unload() {}
