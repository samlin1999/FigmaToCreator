/** IR 節點可見性（與 Figma / Prefab 對齊） */
export interface IRVisibilityNode {
  figmaId: string;
  figmaType?: string;
  visible?: boolean;
  included?: boolean;
  children?: IRVisibilityNode[];
}

export function isVirtualIRNode(node: { figmaType?: string; figmaId: string }): boolean {
  return node.figmaType === 'VIRTUAL' || node.figmaId.startsWith('vc_');
}
