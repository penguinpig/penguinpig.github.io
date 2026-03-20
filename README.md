# PenguinPig Blog Repo

## 結論

這個 repo 現在已整合：

- Hugo 部落格原始碼
- Notion -> Hugo 內容同步
- GitHub Actions 每日自動同步與建站部署

目前流程是：

1. `dev` 分支存放原始碼與內容
2. GitHub Actions 從 Notion 同步內容回 `dev`
3. Hugo 建站後把靜態檔部署到 `master`

現在只差最後一步驗證：

- 在 GitHub Actions 上實際跑成功一次

## Repo 說明

### 分支用途

- `dev`：Hugo 原始碼、文章內容、workflow、同步腳本
- `master`：Hugo build 後的靜態網站內容，用於 GitHub Pages

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
OUTPUT_PATH=synced/notion-sync-report.md
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

1. Repository 預設分支要設為 `dev`
2. `master` 分支要存在，作為靜態站部署分支
3. Notion integration 必須能讀取目標 page 或 database
4. Notion page 或 database 必須分享給該 integration

### Repository Secrets

到 `Settings -> Secrets and variables -> Actions -> Secrets` 建立：

- `NOTION_TOKEN`

### Repository Variables

到 `Settings -> Secrets and variables -> Actions -> Variables` 建立：

- `NOTION_ID`
- `OUTPUT_PATH`，建議值：`synced/notion-sync-report.md`
- `HUGO_CONTENT_ROOT`，建議值：`content`

### Workflow 行為

目前的 `sync-notion.yml` 會做這些事：

1. 從 `dev` checkout repo 與 theme submodule
2. 安裝 Node.js 20
3. 安裝 Hugo
4. 執行 `npm ci`
5. 執行 Notion 同步腳本
6. 若內容有變更，commit 並 push 回 `dev`
7. 執行 `hugo --minify`
8. 將 `public` 內容部署到 `master`

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
2. `dev` 分支有收到同步後的內容更新 commit
3. `master` 分支有收到新的靜態網站 commit
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

1. 確認 GitHub 預設分支是 `dev`
2. 確認 Secrets / Variables 都已建立
3. 到 GitHub 手動觸發一次 `Sync Notion Content`
4. 檢查 `dev` 與 `master` 是否都有新的 commit
5. 檢查 Pages 網站是否正常更新

如果第一次 workflow 失敗，優先檢查：

- `NOTION_TOKEN` 是否正確
- `NOTION_ID` 是否正確
- Notion database / page 是否有分享給 integration
- `master` 分支是否已存在
- GitHub Pages 是否指向 `master`
