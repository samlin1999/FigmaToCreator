# FigmaToCreator

將 Figma **整個 Page** 的圖層整理成語意標記（Panel / Button / Label 等），**保留原始階層與視覺位置**，經美術確認後匯出，並在 **Cocos Creator 3.8.8** 產生 Prefab。

## 視覺不變原則

整理只做兩件事：

1. **語意標記**：依命名推論 Cocos 元件類型（`Btn_` → Button 等）
2. **保留原始階層**：Figma 的 Group / Frame / 子節點順序 **1:1 保留**，不做扁平化或重新分組

每個節點記錄 `absRect`（Figma 畫布絕對座標），Cocos 匯入時依此定位，確保整理前後顯示一致。

## AI Agent 整理（延展性 + 自適應）

在**不修改 absRect** 的前提下，Agent 會：
建立**虛擬容器**（`BackgroundLayer` / `ContentRoot` 等）

**Figma Plugin + Cursor Bridge**（主要流程）：

```bash
# 終端 1：啟動 Cursor bridge（保持執行）
cd tools/ai-organizer
npm install
copy .env.example .env   # 填入 CURSOR_API_KEY
npm run bridge

# 終端 2：建置 Figma Plugin（修改後重跑）
cd tools/figma-plugin
npm install
npm run build
```

```
拖曳 Page → Cursor AI 整理 → 自動預覽 Figma 圖層 → 美術確認 → 匯出 IR/PNG → Cocos Prefab
```

CLI（進階批次用）：`npm run organize:cursor -- Login.ir.json`

環境變數：`CURSOR_API_KEY`、`CURSOR_MODEL`、`FTC_BRIDGE_PORT`（預設 3847）

**Prompt / 示意圖**：預設使用完整 `SKILL.md`；節點列表仍為緊湊 JSON。過大示意圖會自動壓縮（需 `sharp`）。若要精簡 Skill 可設 `FTC_ORGANIZE_COMPACT=1`。Bridge 日誌：`prompt size`、示意圖壓縮結果。

## 整體流程（簡化版）

```
Figma（美術）                    Cocos Creator（程式／TA）
     │                                    │
     ├─ 1. 拖曳 Page 到 Plugin 整理區     │
     ├─ 2. 解析整頁階層（1:1 保留，附加語意標記）
     ├─ 3. 美術勾選／確認節點             │
     ├─ 4. 匯出 IR JSON + PNG ──────────► assets/figma-import/
     │                                    ├─ 5. figma-importer 擴展讀 IR
     │                                    ├─ 6. 建立 UI 節點樹
     │                                    └─ 7. 儲存 Prefab + 場景預覽
```

## 專案結構

| 路徑 | 說明 |
|------|------|
| `tools/figma-plugin/` | Figma Plugin：Page 拖曳選取、整頁階層整理、確認 UI、匯出 |
| `extensions/figma-importer/` | Cocos 編輯器擴展：IR → Prefab |
| `shared/ir-types.ts` | 中間格式 (IR) 型別 |
| `shared/sample-export.json` | 範例 IR（Page 匯出） |
| `assets/figma-import/` | 匯入檔案放置處 |
| `assets/prefabs/figma/` | 產出的 Prefab |

## 美術命名慣例（自動推論）

| 前綴／型別 | Cocos 對應 |
|-----------|-----------|
| Page 頂層 Frame / Section | 語意：Panel（階層不變） |
| `Panel_*` | 語意：Panel 容器 |
| `Btn_*` | Button + Sprite |
| `Bg_*` | Sprite 背景 |
| `Txt_*` / TEXT | Label |
| `Icon_*` / `Img_*` | Sprite |

## 快速開始

### 1. Bridge（先啟動）

```bash
cd tools/ai-organizer
npm install
copy .env.example .env
# 填入 CURSOR_API_KEY
npm run bridge
```

確認 `http://localhost:3847/health` 回傳 `ok: true`。

### 2. Figma Plugin

```bash
cd tools/figma-plugin
npm install
npm run build
```

在 Figma：**Plugins → Development → Import plugin from manifest**，選 `tools/figma-plugin/manifest.json`（之後修改程式請 Reload plugin）。

1. 執行 Plugin
2. **拖曳**要整理的 Page 到整理區（或雙擊 Page 標籤）
3. 按 **Cursor 整理並預覽**
4. 確認 Figma 畫面無誤後按 **確認並匯出**
5. 預設會自動寫入 `assets/figma-import/<PageName>/`；若 bridge 掛掉才 fallback 下載

### 2. Cocos Creator 擴展

```bash
cd extensions/figma-importer
npm install
npm run build
```

在 Cocos Creator：**擴展 → 擴展管理器 → 重新載入** `figma-importer`。

選單 **FigmaToCreator → 從 IR 產生 Prefab**，或開啟 **Figma 匯入** 面板。

Page 匯出會產生以 Page 名稱命名的 Prefab，例如 `Login.prefab`。

### 3. 測試（無 Figma）

可用 `shared/sample-export.json` 測試 Prefab 產生流程。

## Plugin+Bridge Smoke Test

1. 啟動 bridge：`cd tools/ai-organizer && npm run bridge`
2. 健康檢查：開啟 [http://localhost:3847/health](http://localhost:3847/health)（應看到 `ok: true`、`hasCursorKey`）
3. Figma 重新載入 plugin，狀態列應顯示 bridge ready
4. 拖一個 Page，按「AI整理並預覽」，等待 30–90 秒仍不應誤判 timeout
5. 匯出後確認有 `assets/figma-import/<Page>/<Page>.ir.json` 與 PNG

### 常見排查順序

1. `npm run bridge` 是否仍在執行（終端不可關）
2. `tools/ai-organizer/.env` 是否有 `CURSOR_API_KEY`
3. `tools/figma-plugin` 是否為最新 build，且已 reload plugin
4. 若 port 衝突，設定 `FTC_BRIDGE_PORT` 並同步更新 plugin 端 bridge 位址

## IR 格式（v1.0 · Page 匯出）

```json
{
  "version": "1.0",
  "scope": "page",
  "preserveVisual": true,
  "source": { "pageId": "...", "pageName": "Login", "exportedAt": "..." },
  "designSize": { "width": 720, "height": 1280 },
  "root": {
    "name": "Login",
    "type": "page",
    "absRect": { "x": 0, "y": 0, "width": 720, "height": 1280 },
    "children": [
      {
        "name": "LoginPanel",
        "figmaType": "FRAME",
        "type": "panel",
        "absRect": { "x": 0, "y": 0, "width": 720, "height": 1280 },
        "children": [ "..." ]
      }
    ]
  }
}
```

詳見 `shared/ir-types.ts`。
## 環境

- Cocos Creator **3.8.8**
- Node.js **≥ 18**
- Figma Desktop（Plugin 開發）
