# figma-hierarchy-organizer

將 `Page_*.ir.json` 轉成 Cocos Creator 友善的 hierarchy。

## Usage

```bash
node tools/figma-hierarchy-organizer/build-hierarchy.mjs --ir assets/figma-import/Page_1/Page_1.ir.json
```

輸出預設為文字樹。

## JSON mode

```bash
node tools/figma-hierarchy-organizer/build-hierarchy.mjs --ir assets/figma-import/Page_1/Page_1.ir.json --format json
```

## Current canonical structure

- `panel_chat`
- `panel_chat_bg`
- `tab_group` / `tab_group_bg` / `tab_item_01..N`
- `panel_title` / `panel_title_bg` / `title`
- `message_list` / `message_item_01..N`
- `panel_input` / `panel_input_bg` / `input` / `edit_text`

若輸入節點命名與上述語意不一致，請先在 IR 產生前統一命名，或擴充 `build-hierarchy.mjs` 內的命名映射規則。
