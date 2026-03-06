# PenguinPig Blog Repo Note

這個 repo 有兩個用途：

- `dev` 分支：Hugo 原始碼（文章、設定、theme/submodule）。
- `master` 分支：Hugo build 後的靜態網站（GitHub Pages 發佈內容）。

## README 顯示規則（GitHub）

GitHub 專案首頁會顯示「預設分支」的 `README.md`。

- 如果預設分支是 `master`，就要讓 `master` 有 `README.md`。
- 如果預設分支是 `dev`，就會顯示 `dev` 的 `README.md`。

## Deploy 腳本

- 使用 `AutoDeploy.ps1`。
- 腳本會保留 `.github` 並同步 `README.md` 到 deploy 分支，避免首頁說明消失。

## 常用指令

```powershell
# 測試部署流程（不 push）
.\AutoDeploy.ps1 -NoPush

# 正式部署
.\AutoDeploy.ps1
```
