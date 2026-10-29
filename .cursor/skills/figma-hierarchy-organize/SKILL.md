---
name: figma-hierarchy-organize
description: Organize Figma page hierarchy into Cocos Creator friendly virtual containers while preserving absRect and layer order. Use when converting Figma nodes or IR JSON into stable game UI hierarchy, grouping tabs/messages/inputs into deterministic containers.
disable-model-invocation: true
---

# Figma Hierarchy Organize

## Purpose
- Keep visual output unchanged: never modify any leaf node `absRect`.
- Convert flat Figma layers into stable, script-friendly hierarchy for Cocos Creator.
- Produce deterministic output so repeated runs generate the same structure.

## Trigger
Use this skill when the user asks to:
- organize/rebuild hierarchy for Cocos Creator
- convert Figma/IR JSON to game UI tree
- group repeated items like tabs/messages/list rows
- output tree text (`└─`, `├─`) or `AgentOrganizePlan` JSON

## Inputs
- Preferred: IR JSON with `root.children[]`, each node containing `figmaId`, `name`, `type`, `rect`, `absRect`
- Optional: direct Figma layer list with equivalent geometry and names
- Optional but recommended: reference image (示意圖) that reflects intended game UI grouping and semantic zones

## Hard Constraints
1. Never invent `figmaId`.
2. Preserve all leaf `absRect`.
3. Preserve visual z-intent (background-first containers, content after).
4. Preserve stable order inside each container (top-to-bottom by `rect.y`, tie by `rect.x`).
5. **Figma User Group (`figmaType=GROUP`)**: treat each Group as one atomic unit. Never split Group members into different virtual containers. Reference the **Group node figmaId** in `virtualContainers[].children`; do not re-parent individual leaves out of the Group. Internal relative layout inside the Group must stay unchanged.
6. Use `absolute` layout for virtual content containers unless explicitly requested otherwise.
7. If uncertain, prefer fewer structural changes.
8. Never generate containers that extend outside source page bounds (`ir.root.absRect`) unless source IR itself is confirmed valid for that range.
9. If source IR appears polluted (e.g., `root.width` far larger than `panel_chat.width`, or `panel_chat` left edge is far right of `tab_group`), STOP and return an error requesting re-parse from clean page.
10. The output hierarchy must be directly usable by Cocos Creator runtime scripts (stable node names, deterministic sibling order, and reproducible grouping).

## User-Uploaded .md Rules (Figma Plugin, Supplementary)
When the user also uploads a custom `.md` organize guide:
- **Hard constraints** (absRect, figmaId, Group preservation, etc.) **cannot** be overridden by user .md.
- For **business logic** (naming conventions, button container min size, grouping heuristics, etc.):
  - If the user .md **explicitly states** a rule or value, **follow the user .md** (it overrides Skill defaults).
  - Example: Skill default button group min is **60×60**; user .md says **70×70** → use **70×70** (also enforced in `apply-plan` via parsed overrides).
- If the user .md is silent on a topic, use Skill defaults.

## Image-Guided Hierarchy Mode (IR + 示意圖)
When both IR and reference image are provided, use this priority:
1. **Geometry truth comes from IR** (`absRect` is source of truth for placement).
2. **Semantic grouping comes from image** (which elements should belong together).
3. If image intent conflicts with IR geometry preservation, keep geometry unchanged and adapt grouping conservatively.

Required behavior in image-guided mode:
- Build virtual containers that mirror game-logic regions (left nav/tab area, main content, footer/input, etc.).
- Keep each real node exactly once; only add virtual/group containers.
- Keep visual result unchanged in Figma and downstream Prefab generation.
- Reject output if grouping would force overflow beyond `ir.root.absRect`.
- If the reference image explicitly circles/boxes/highlights a region, treat that annotated region as a **must-group zone**:
  - Nodes visually inside that marked zone should be grouped under one semantic container first.
  - Preserve existing geometry (`absRect`) and only add container hierarchy.
  - If multiple marked zones exist, create one deterministic container per zone and keep their order stable (top-to-bottom, then left-to-right).
  - This rule is **mandatory** (not optional). Do not flatten marked-zone nodes back into generic containers.
  - **Do not refuse or abort** when node count is small: if circled zones are visible, still output one container per zone with best-effort mapping from IR `absRect` overlap / visual position.
  - If a single node in IR clearly falls inside a circled zone, put it in that zone's container even if the zone would otherwise have only one child.
  - Only use fallback (nearest semantic parent) for nodes that truly cannot be assigned to any circled zone; never fail the whole organize step for low leaf count alone.

## Semantic Renaming (示意圖標籤)
When a reference image includes text labels, arrows, or annotations on UI regions:
- Set **`nodeHints[figmaId].name`** for each included leaf that should match the diagram label (English snake_case, close in meaning).
- Set **`virtualContainers[].name`** for each zone/container using the same rule.
- If the diagram labels a zone (e.g. 「Tab區」「輸入列」「訊息區」), prefer semantic names (`tab_group`, `panel_input`, `message_list`) over generic `zone_*` when meaning is clear.
- For repeated rows/items inside a labeled zone, use deterministic indexed names (`tab_item_01`, `message_item_02`, zero-padded).
- If no diagram label exists for a node, **still assign** `nodeHints[figmaId].name` with a best-effort generic snake_case name (do not leave Figma default names like `Frame 123` / `Rectangle 45`).
- Do **not** change `figmaId` or `absRect` when renaming.
- **Preserve original object tokens**: if the source Figma layer name already contains a clear object descriptor (e.g. `diamond`, `gold`, `shop`, `vip`), the new `nodeHints[].name` must still include those tokens (e.g. `currency_diamond` → `icon_currency_diamond_01`, not `icon_01`). Skip generic Figma names like `Rectangle 123`.
- **Non-English layer names**: translate source layer names to English tokens first (e.g. `鑽石` → `diamond`, `金幣` → `gold`) before merging into `nodeHints[].name`. Do not leave raw CJK in final names.
- **Buttons (required)**: if the diagram labels a node/zone as a button (按鈕 / button), `nodeHints[figmaId].name` and related `virtualContainers[].name` **must include `btn`** (e.g. `btn_shop_01`, `btn_nav_left_01`). Set `type: "button"` when appropriate.
- **Button group containers (required)**: when a virtual container groups button parts (e.g. `btn_nav_item_03` with sprite + label children), the container bounds must be **at least 60×60**. If the union of children is smaller, expand the container (centered); if already larger, keep as-is. Never change child leaf `absRect`.

### Unlabeled Fallback Names (Required)
For every included leaf without a diagram label, output `nodeHints[figmaId].name` using this priority:
1. **Name pattern** (from IR `name`): `tab`, `tab_text`, `head`, `message`, `message_text`, `input`, `edit_text`, `title`, `bg` → use as prefix + `_01..N`
2. **Geometry / type**:
   - `areaRatio > 0.5` → `page_bg_01`
   - `type=label` or has `text`: top → `title_01`; bottom → `label_footer_01`; else → `label_01`
   - `type=button` → `btn_01`
   - sprite/asset: large → `panel_bg_01`; top/bottom icons → `icon_header_01` / `icon_footer_01`; else → `image_01`
3. **Zone by `relCenter`**: `elem_top_left_01`, `elem_top_01`, `elem_mid_01`, `elem_bottom_right_01`, etc.
4. Sort siblings by `y` then `x`; zero-pad index (`_01`, `_02`, …) per prefix group.

## Cocos-Ready Output Requirements
Hierarchy must be practical for gameplay/UI scripting:
- Use stable semantic container names (`tab_group`, `message_list`, `panel_input`, `content_root`, etc.).
- For repeated rows/items, use deterministic indexed names (`*_01..N`, zero-padded).
- Keep sibling order deterministic (same input => same output).
- Prefer shallow, readable grouping over excessive nesting.
- Keep role hints aligned with runtime usage:
  - `background`: large static backing layers
  - `content`: interactive/readable gameplay content
  - `header/footer`: top/bottom bars for fixed HUD zones

## Canonical Container Model
For chat-like/game HUD pages, use this default:
- `panel_chat`
  - `panel_chat_bg` (optional)
  - `tab_group`
    - `tab_group_bg` (optional)
    - `tab_item_01..N` each containing `tab` + `tab_text`
  - `panel_title` containing `panel_title_bg` + `title`
  - `message_list`
    - `message_item_01..N` each containing `head` + `message` + `message_text`
  - `panel_input` containing `panel_input_bg` + `input` + `edit_text`

If names differ, infer by geometry and role:
- `*_bg`: large area rectangle behind a container
- tab row: repeated pair (`tab`, `tab_text`) with similar `y`
- message row: repeated triple (`head`, `message`, `message_text`) with similar `y`

## Grouping Heuristics
Apply rules in this order:
1. **Annotated-zone priority (image-guided, first)**: if示意圖有圈選/框選/手繪圈，先依每個圈選區建立一個容器，將 IR 節點依 `absRect` 與圈選區視覺位置對應進去（允許一區僅一個 leaf）。
2. **Anchor background**: node with largest area ratio (`> 0.5`) likely background (within each zone or page as applicable).
3. **Cluster by role name**: exact names first (`tab`, `tab_text`, `message`, `head`, `message_text`, `input`, `edit_text`, `title`).
4. **Pairing by Y proximity**:
   - tab pair threshold: `abs(tab.y - tab_text.y) <= 16`
   - message triple threshold: elements whose centerY distance is minimal in same row
5. **Row ordering**: sort row containers by `y` ascending, rename with zero-padded index.
6. **Fallback**: unmatched nodes stay under nearest semantic parent (`panel_chat` or `ContentRoot`).

### Diagram Label → `nodeHints.name` (Required in image-guided mode)
- Map each visible diagram label to the nearest included node(s) by `absRect` overlap / visual position.
- Output the chosen name in `nodeHints[figmaId].name` (and container names in `virtualContainers[].name`).
- Use snake_case English; avoid spaces and special characters.
- **Every included leaf must have `nodeHints[figmaId].name`** — labeled nodes use diagram semantics; unlabeled nodes use Unlabeled Fallback Names above.

### Annotated-Zone Naming (Required)
When image-guided mode contains circled/boxed regions:
- Create explicit containers per zone using deterministic names:
  - `zone_top_left_01`, `zone_top_mid_01`, `zone_top_right_01`
  - `zone_mid_01`, `zone_bottom_01`, `zone_bottom_left_01`, `zone_bottom_right_01`
- If exact semantics are clear, semantic names may replace zone names (`tab_group`, `panel_input`, etc.), but each annotated zone must still map to exactly one primary container.
- Do not merge two distinct annotated zones into one container unless they clearly represent one logical module in the image.

## Output Modes
### A) Tree text mode
Return only a plain text hierarchy, e.g.:
`panel_chat`
`├─ tab_group`
`│  └─ tab_item_01`

### B) AgentOrganizePlan mode
Return exactly one JSON object in `AgentOrganizePlan` shape.
No markdown fence. No extra explanation.

## Safety Checks
Before final output, verify:
- every original leaf node still exists exactly once
- no duplicated `figmaId`
- node count is preserved except newly created virtual/group containers
- row indices are contiguous (`01..N`)
- all virtual container bounds are within `ir.root.absRect`
- `panel_chat` remains the visual outer container for chat layout (no accidental overflow expansion)
- resulting hierarchy can be mapped 1:1 into Cocos Prefab node tree without post-fix coordinate hacks
- every annotated zone in reference image is represented by one primary container in output hierarchy

## Fallback Policy
- If confidence is low, keep nodes under `ContentRoot`.
- Prefer stable, conservative hierarchy over aggressive auto-inference.
- Prioritize reproducibility and scriptability for game code.
