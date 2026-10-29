import type { AgentNodeHint, AgentVirtualContainer, IRNodeLike, IRRect } from '../../../shared/agent-plan-types';
import type { CustomGuideOverrides } from '../../../shared/custom-guide-overrides';
import { BTN_IN_NAME, isButtonAnnotatedText, isButtonHint } from './infer-node-names';

/** 按鈕群組虛擬容器的最小點擊區預設（與 Skill 一致；可被補充規則覆寫） */
export const BUTTON_GROUP_MIN_SIZE = 60;

function isButtonLikeNode(node: IRNodeLike, nodeHints: Record<string, AgentNodeHint>): boolean {
  if (node.figmaType === 'VIRTUAL' || node.figmaId.startsWith('vc_')) {
    return /btn_.*_(item|group)\b/i.test(node.name) || /\bbtn\b.*\b(item|group)\b/i.test(node.name);
  }
  const hint = nodeHints[node.figmaId];
  return isButtonHint(hint, node) || node.type === 'button' || BTN_IN_NAME.test(node.name);
}

/** 是否為「按鈕群組」虛擬容器（如 btn_nav_item_03 包住 sprite + label） */
export function isButtonGroupContainer(
  vc: AgentVirtualContainer,
  childNodes: IRNodeLike[],
  nodeHints: Record<string, AgentNodeHint>,
): boolean {
  if (!childNodes.length) return false;

  const name = vc.name ?? '';
  if (/btn_.*_(item|group)\b/i.test(name) || /\bbtn\b.*\b(item|group)\b/i.test(name)) {
    return true;
  }

  const blob = `${name} ${vc.organizeHint ?? ''}`;
  const buttonKids = childNodes.filter((c) => isButtonLikeNode(c, nodeHints));
  if (buttonKids.length === 0) return false;

  if (isButtonAnnotatedText(blob)) return true;

  // btn_* 容器且含至少一個按鈕子項；多子項或名稱含 item/group 視為群組
  if (BTN_IN_NAME.test(name)) {
    if (childNodes.length >= 2) return true;
    if (/item|group/i.test(name)) return true;
  }

  return false;
}

/** 以中心為基準擴充至不小於 minW×minH；子節點 absRect 不變 */
export function expandRectToMinSize(rect: IRRect, minW: number, minH: number): IRRect {
  const width = Math.max(rect.width, minW);
  const height = Math.max(rect.height, minH);
  if (width === rect.width && height === rect.height) return rect;

  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  return {
    x: cx - width / 2,
    y: cy - height / 2,
    width,
    height,
  };
}

export function applyButtonGroupMinBounds(
  absRect: IRRect,
  vc: AgentVirtualContainer,
  childNodes: IRNodeLike[],
  nodeHints: Record<string, AgentNodeHint>,
  minSize = BUTTON_GROUP_MIN_SIZE,
): IRRect {
  if (!isButtonGroupContainer(vc, childNodes, nodeHints)) return absRect;
  return expandRectToMinSize(absRect, minSize, minSize);
}
