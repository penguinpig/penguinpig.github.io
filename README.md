# PenguinPig Blog Repo

## 結論

這個 repo 現在已整合：

- Hugo 部落格原始碼
- Notion -> Hugo 內容同步
- GitHub Actions 每日自動同步與建站部署

目前流程是：

1. `master` 分支存放 Hugo 原始碼與內容
2. GitHub Actions 從 Notion 同步內容回 `master`
3. Hugo 建站後透過 GitHub Pages 官方 Actions 直接部署

現在只差最後一步驗證：

- 在 GitHub Actions 上實際跑成功一次

## Repo 說明

### 分支用途

- `master`：Hugo 原始碼、文章內容、workflow、同步腳本

目前不再需要額外的靜態檔部署分支，GitHub Pages 會直接接收 workflow 上傳的 build artifact。

### 主要目錄

- `content/notes`：筆記
- `content/posts`：文章
- `content/bikes`：Bike 類內容
- `scripts/notion-fetch.mjs`：Notion 同步腳本
- `.github/workflows/sync-notion.yml`：每日同步與部署流程
- `themes/PaperMod`：Hugo theme submodule

### Notion 同步後的目錄對應

- `Bike` -> `content/bikes`
- `Note` -> `content/notes`
- `Post` -> `content/posts`

## 本機使用方式

### 1. 安裝依賴

```powershell
npm install
```

### 2. 建立 `.env`

可參考 `.env.example`：

```dotenv
NOTION_TOKEN=secret_xxxxx
NOTION_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OUTPUT_PATH=synced/notion-page.md
HUGO_CONTENT_ROOT=content
```

### 3. 本機測試同步

```powershell
npm run notion:test
```

### 4. 本機建站

如果本機已安裝 Hugo：

```powershell
hugo --minify
```

## Notion Database 欄位建議

至少需要：

- `SyncToGit`：Checkbox，是否同步
- `HugoArchives`：Select，值只能是 `Bike`、`Note`、`Post`

建議再加：

- `Slug`：自訂檔名
- `Summary`：文章摘要
- `Tags`：標籤
- `Categories`：Hugo categories
- `Status`：例如 `進行中`、`Published`
- `Author`
- `Description`
- `Series`

## GitHub Actions 正確使用方式

### 必要條件

1. Repository 預設分支要設為 `master`
2. GitHub Pages 的 `Source` 要設為 `GitHub Actions`
3. Notion integration 必須能讀取目標 page 或 database
4. Notion page 或 database 必須分享給該 integration

### Repository Secrets

到 `Settings -> Secrets and variables -> Actions -> Secrets` 建立：

- `NOTION_TOKEN`

### Repository Variables

到 `Settings -> Secrets and variables -> Actions -> Variables` 建立：

- `NOTION_ID`
- `OUTPUT_PATH`，建議值：`synced/notion-page.md`
- `HUGO_CONTENT_ROOT`，建議值：`content`

### Workflow 行為

目前的 `sync-notion.yml` 會做這些事：

1. 從 `master` checkout repo 與 theme submodule
2. 安裝 Node.js 20
3. 安裝 Hugo 與 GitHub Pages 設定
4. 執行 `npm ci`
5. 執行 Notion 同步腳本
6. 若內容有變更，commit 並 push 回 `master`
7. 執行 `hugo --minify`
8. 上傳 `public` 為 GitHub Pages artifact
9. 由 GitHub Pages 官方部署流程發布網站

### 排程時間

workflow 目前設定為：

- 每天 UTC `17:00`
- 也就是台灣時間每天 `01:00`

### 手動執行

到 GitHub：

`Actions -> Sync Notion Content -> Run workflow`

## 成功驗證標準

第一次手動執行時，確認以下幾點：

1. Workflow 成功結束，沒有紅字失敗步驟
2. `master` 分支有收到同步後的內容更新 commit
3. GitHub Pages 顯示新的 deploy 紀錄
4. GitHub Pages 顯示的是最新內容
5. 若 Notion 沒有內容變更，workflow 也能正常結束，只是略過 commit

## 目前狀態

已完成：

- Notion 同步腳本已合併到本 repo
- Hugo 內容目錄已對齊
- GitHub Actions workflow 已建立
- README 已更新為目前流程

尚未完成：

- GitHub Actions 線上實跑驗證

## 建議最後驗證步驟

1. 確認 GitHub 預設分支是 `master`
2. 確認 GitHub Pages Source 是 `GitHub Actions`
3. 確認 Secrets / Variables 都已建立
4. 到 GitHub 手動觸發一次 `Sync Notion Content`
5. 檢查 `master` 是否有新的內容 commit
6. 檢查 Pages 網站是否正常更新

如果第一次 workflow 失敗，優先檢查：

- `NOTION_TOKEN` 是否正確
- `NOTION_ID` 是否正確
- Notion database / page 是否有分享給 integration
- GitHub Pages 是否已設為 `GitHub Actions`
