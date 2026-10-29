/**
 * AI Agent 整理計畫 — 與 IR 搭配使用
 * 原則：不修改任何節點 absRect，僅重組邏輯階層 + 附加自適應元資料
 */

export type ContainerRole =
  | 'root'
  | 'background'
  | 'content'
  | 'header'
  | 'footer'
  | 'overlay'
  | 'list'
  | 'custom';

export type LayoutMode = 'none' | 'vertical' | 'horizontal' | 'absolute';

export interface WidgetHint {
  /** 0~1 相對父容器 */
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  horizontalCenter?: number;
  verticalCenter?: number;
  /** 是否隨父容器拉伸寬/高 */
  stretchWidth?: boolean;
  stretchHeight?: boolean;
}

export interface LayoutHint {
  mode: LayoutMode;
  spacing?: number;
  padding?: { top?: number; right?: number; bottom?: number; left?: number };
  /** vertical / horizontal 時子項是否等比填充 */
  resizeMode?: 'none' | 'container' | 'children';
}

export interface AgentNodeHint {
  figmaId: string;
  /** 語意化節點名稱（對應示意圖標籤；套用至 IR/Cocos） */
  name?: string;
  containerRole?: ContainerRole;
  layout?: LayoutHint;
  widget?: WidgetHint;
  organizeHint?: string;
  /** 邏輯類型覆寫（可選） */
  type?: string;
}

export interface AgentVirtualContainer {
  /** 虛擬容器 id（非 Figma id） */
  id: string;
  name: string;
  containerRole: ContainerRole;
  layout?: LayoutHint;
  /** 子項為 figmaId 或虛擬容器 id */
  children: string[];
  organizeHint?: string;
}

export interface AgentOrganizePlan {
  version: '1.0';
  organizer: 'ai-agent' | 'heuristic-agent' | 'cursor-agent';
  preserveVisual: true;
  summary?: string;
  /** 針對現有 Figma 節點的提示，key = figmaId */
  nodeHints: Record<string, AgentNodeHint>;
  /** 虛擬容器樹（可選；有則重組邏輯階層） */
  virtualRoot?: {
    children: string[];
  };
  virtualContainers?: AgentVirtualContainer[];
}

export interface IRRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IRNodeLike {
  figmaId: string;
  name: string;
  figmaType?: string;
  type: string;
  rect: IRRect;
  absRect: IRRect;
  asset?: string;
  text?: string;
  textColor?: string;
  fontSize?: number;
  visible: boolean;
  included: boolean;
  organizeHint?: string;
  /** Figma 原始繪製順序（越小越底層），供 Cocos 還原 z-order */
  paintOrder?: number;
  containerRole?: ContainerRole;
  layout?: LayoutHint;
  widget?: WidgetHint;
  children: IRNodeLike[];
}

export interface IRDocumentLike {
  version: string;
  scope: string;
  preserveVisual: boolean;
  organizedBy?: 'rules' | 'ai-agent' | 'heuristic-agent' | 'cursor-agent';
  agentSummary?: string;
  source: object;
  designSize: { width: number; height: number };
  root: IRNodeLike;
}
