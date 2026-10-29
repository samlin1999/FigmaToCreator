/**
 * Figma → Cocos Creator 中間格式 (IR) 型別定義
 * Figma Plugin 匯出、Cocos 擴展匯入共用此契約。
 */

export type IRNodeType =
  | 'page'
  | 'panel'
  | 'sprite'
  | 'label'
  | 'button'
  | 'container'
  | 'group';

export interface IRRect {
  /** 相對父節點左上角，單位 px */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IRSource {
  fileKey: string;
  fileName: string;
  /** Page 匯出時使用 */
  pageId?: string;
  pageName?: string;
  /** 單 Frame 匯出時使用（向下相容） */
  frameId?: string;
  frameName?: string;
  exportedAt: string;
}

export interface IRNode {
  /** Figma node id，供追溯與重新匯出 */
  figmaId: string;
  name: string;
  /** Figma 原始節點類型，如 FRAME / GROUP / TEXT */
  figmaType?: string;
  type: IRNodeType;
  rect: IRRect;
  /** Figma 畫布絕對座標；整理時不修改，確保視覺一致 */
  absRect: IRRect;
  /** 相對 export 根目錄的貼圖路徑，例如 textures/login/bg.png */
  asset?: string;
  /** 文字節點內容 */
  text?: string;
  /** 文字顏色 #RRGGBB */
  textColor?: string;
  /** 字級 px */
  fontSize?: number;
  visible: boolean;
  /** 美術確認後是否納入 Prefab */
  included: boolean;
  /** 自動推論理由，供確認 UI 顯示 */
  organizeHint?: string;
  containerRole?: string;
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
  children: IRNode[];
}

export interface IRDocument {
  version: '1.0';
  /** page = 整頁匯出；frame = 單一 Frame（向下相容） */
  scope: 'page' | 'frame';
  /** true = 保留 Figma 原始階層與視覺，只做語意標記 */
  preserveVisual: boolean;
  /** rules | heuristic-agent | ai-agent */
  organizedBy?: string;
  agentSummary?: string;
  source: IRSource;
  /** 設計稿邊界尺寸，供座標換算 */
  designSize: { width: number; height: number };
  root: IRNode;
}
