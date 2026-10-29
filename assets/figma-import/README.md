# Figma 匯入目錄

將 Figma Plugin 匯出的 Page 檔案放於此：

```
figma-import/
├── Page 1.ir.json
├── rectangle_1.png                    ← 可直接放根目錄
└── textures/
    └── page_1/
        └── rectangle_1.png          ← 或依 IR asset 路徑
```

IR 中 `asset` 欄位範例：`textures/page_1/rectangle_1.png`

Cocos 匯入器會依序嘗試：
1. `textures/page_1/rectangle_1.png`
2. `textures__page_1__rectangle_1.png`
3. `rectangle_1.png`

在 Cocos Creator 選單 **FigmaToCreator → 從 IR 產生 Prefab** 即可建立 Prefab。
