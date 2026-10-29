# Figma Hierarchy Organize (compact)

## Hard constraints (never override)
- Never invent `figmaId`; all ids from user node list.
- Never change leaf `absRect`.
- Figma `GROUP` / `isUserGroup`: atomic unit; reference Group `figmaId` in `virtualContainers.children`, never split members (`lockedInUserGroupId` leaves stay inside group).
- `virtualRoot.children`: background-first; container children keep Figma z-order (front-first).
- Content virtual containers: `layout.mode` = `"absolute"` only (not vertical/horizontal).
- Bounds within `ir.root.absRect`.

## Business defaults (user .md explicit rules override)
- Every included leaf: `nodeHints[figmaId].name` (snake_case English). Diagram label → semantic name; no label → generic (`label_01`, `image_02`, `btn_01`, `page_bg_01`, `elem_top_left_01`). Keep object tokens from original name (`diamond`, `gold`); translate CJK to English tokens first.
- Buttons: name must contain `btn`; `type: "button"` when appropriate.
- Button group virtual container min **60×60** (expand bounds only, not child absRect).
- Prefer 2–4 virtual containers; conservative if uncertain.

## Image-guided (when image attached)
- Geometry from IR (`absRect`, `relCenter`); grouping from image circles/boxes.
- Each marked zone → one virtual container; do not put all nodes in single `BackgroundLayer`.
- Map nodes by visual overlap / `relCenter`; one-node zones allowed.
- Zone names: semantic (`tab_group`, `panel_input`) or `zone_*`.

## Output
- One `AgentOrganizePlan` JSON only (no markdown). Fields: `version`, `organizer`, `preserveVisual`, `summary`, `nodeHints`, `virtualRoot`, `virtualContainers`.
- `nodeHints` keys must be leaf/group ids from list; each leaf needs `name`.

## Widget hints (optional, save tokens in output)
- Large background (`areaRatio>0.5`): `containerRole: background`, widget edges 0 + stretch.
- Top `relCenter.y<0.2`: header/top anchors; bottom `y>0.75`: footer/bottom; center `x≈0.5`: horizontalCenter.
- Omit verbose `organizeHint` unless necessary.
