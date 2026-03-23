---
author: ["PenguinPig"]
title: "Git"
date: "2026-03-05T03:36:00.000Z"
description: "Git相關使用，包含多使用者"
summary: "Git相關使用，包含多使用者"
tags: ["git"]
categories: ["note"]
series: []
ShowToc: true
TocOpen: true
draft: true
notion_id: "31ab8bba-f3ba-806a-b1b0-eb994abe8079"
---
---

## 📥 收集區（先丟進來就好）

### 內容／片段

## Pull Only a Specific Subpath from a Git Repository

- Shallow Clone + Filter (for Large Repos)

```shell
git clone --depth=1 --filter=blob:none --sparse <REPO_URL>
cd <REPO_NAME>
git sparse-checkout set <subdirectory_path>
git checkout main
```

## Push Force

```shell
# 強制讓遠端 branch 變成和本地完全一樣，不管遠端目前有沒有新的 commit。
git push --force
# 用來保護其他人的commit
# 先檢查遠端 branch 有沒有在我最後 fetch 之後被別人改過？
# 如果遠端 沒有變化：push 成功
# 如果遠端 有變化，push 失敗
git push --force-with-lease
```

### 設定不同GitHub帳號

- 用於控制Push / Pull權限

```shell
# sample
# path: ~/.ssh/config

# git clone git@github-work:company/project.git
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa_work

# git clone git@github-personal:penguinpig/penguinpig.github.io
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa_persona
```

- 不同Repos設定userName、Email

```shell
git config user.name "123213123"
git config user.email "123123@gmail.com"
```

# Git Submodule 完整概念說明

## 1. 什麼是 Submodule

**Git Submodule** 是一種讓「一個 Git repository 嵌入另一個 Git repository」的機制。

簡單理解：

> Submodule 就是「在一個 repo 裡面放另一個 repo」。

但重要的是：

**主 repo 並不追蹤 submodule 裡面的檔案，而是只追蹤它指向哪一個 commit。**

---

## 2. 為什麼需要 Submodule

有些專案會依賴其他 repository，例如：

- 共用 library

- UI framework

- theme

- 工具模組

例如：

```plain text
MyProject
 ├─ src
 ├─ docs
 └─ themes
     └─ PaperMod
```

`PaperMod` 是另一個 Git repository。

使用 Submodule 的好處：

- 可以直接使用別人的 repo

- 可以控制版本

- 不需要把整個 repo copy 進來

---

## 3. Submodule 的核心概念

Submodule 有 **兩層 Git repository**

### 第一層：主 repository

主 repo 只會記錄：

```plain text
themes/PaperMod → commit abc123
```

意思是：

> 「這個 submodule 現在使用 PaperMod repo 的 abc123 commit」

主 repo **不會記錄裡面的每個檔案**。

---

### 第二層：Submodule repository

Submodule 自己是一個完整的 Git repo。

它會自己追蹤：

```plain text
themes/PaperMod/layouts
themes/PaperMod/assets
themes/PaperMod/config
```

這些檔案的 commit。

---

## 4. Submodule 的結構

當你加入 submodule 時，Git 會建立兩個東西：

### `.gitmodules`

```plain text
[submodule "themes/PaperMod"]
    path = themes/PaperMod
    url = https://github.com/adityatelange/hugo-PaperMod.git
```

這個檔案記錄：

- submodule 在哪個資料夾

- submodule repo URL

---

### 主 repo commit 記錄

主 repo 會記錄：

```plain text
themes/PaperMod (commit abc123)
```

只是一個 commit pointer。

---

## 5. Clone 時發生什麼事

如果你執行：

```plain text
git clone repo
```

Git **只會下載主 repo**。

Submodule 只會留下：

```plain text
themes/PaperMod
```

資料夾，但內容還沒下載。

要執行：

```plain text
git submodule update --init --recursive
```

Git 才會：

1. 下載 submodule repo

1. checkout 到主 repo 指定的 commit

---

## 6. Clone Submodule 的正確方式

推薦：

```plain text
git clone --recurse-submodules repo
```

這會：

1. clone 主 repo

1. 初始化 submodule

1. 下載 submodule repo

---

## 7. 修改 Submodule 時的流程

假設你修改：

```plain text
themes/PaperMod/layouts/baseof.html
```

### 第一步：進入 submodule

```plain text
cd themes/PaperMod
```

### 第二步：commit submodule

```plain text
git add .
git commit -m "modify theme"
```

### 第三步：回到主 repo

```plain text
cd ../..
```

### 第四步：更新 submodule pointer

```plain text
git add themes/PaperMod
git commit -m "update submodule"
```

這時主 repo 會記錄：

```plain text
PaperMod commit 從 abc123 → def456
```

---

## 8. 為什麼 Git 要設計成這樣

原因是：

**Submodule 必須保持獨立 repository。**

否則：

- upstream repo 無法更新

- fork 會混亂

- 版本控制會破壞

所以 Git 設計成：

```plain text
主 repo
  ↓
只記錄 submodule commit
```

而不是直接追蹤檔案。

---

## 9. 常見指令

查看 submodule 狀態

```plain text
git submodule status
```

初始化 submodule

```plain text
git submodule update --init
```

更新 submodule

```plain text
git submodule update --recursive
```

拉取 submodule 最新版本

```plain text
git submodule update --remote
```

---

## 10. 視覺化理解

普通資料夾：

```plain text
repo
 └─ lib
     ├─ a.js
     ├─ b.js
     └─ c.js
```

Git 會追蹤每個檔案。

---

Submodule：

```plain text
repo
 └─ lib (submodule)
```

Git 只記錄：

```plain text
lib → commit abc123
```

而不是裡面的檔案。

---

## 11. 一句話理解

**Submodule = 在 repo 裡面放另一個 repo，但主 repo 只記錄它使用哪個 commit。**

---

## 12. 常見使用案例

- Hugo theme（PaperMod）

- vendor libraries

- shared modules

- mono-repo 依賴

- external framework

---

## 13. 最容易踩的坑

### clone 後 submodule 是空的

原因：

```plain text
git clone
```

沒有下載 submodule。

解法：

```plain text
git submodule update --init --recursive
```

---

### CI / GitHub Actions build 失敗

原因：

CI 沒有下載 submodule。

解法：

```plain text
actions/checkout
with:
  submodules: recursive
```

---

# 總結

Submodule 的核心就是：

```plain text
主 repo
   ↓
只記錄 submodule commit
```

而不是追蹤裡面的檔案。

所以你需要：

1. clone submodule

1. 在 submodule 裡 commit

1. 在主 repo 更新 pointer

# Git Worktree 概念完整說明

## 1. 什麼是 Git Worktree

**Git Worktree** 是一個讓「同一個 Git repository 可以同時存在多個工作目錄 (working directory)」的功能。

每一個工作目錄可以：

- checkout **不同的 branch**

- 同時進行開發

- 共享同一個 Git repository 的歷史與物件

簡單理解：

> **Git Worktree = 一個 repo 可以同時開多個資料夾，每個資料夾用不同 branch。**

---

# 2. 一般 Git 的限制

一般 Git repository 的結構：

```plain text
project/
 ├─ .git
 ├─ src
 ├─ README.md
```

在這個資料夾中：

```plain text
一次只能 checkout 一個 branch
```

如果你要切換 branch：

```plain text
git checkout feature-A
git checkout main
git checkout feature-B
```

每次切換：

- working files 會被覆蓋

- build 可能被破壞

- 未 commit 的檔案會衝突

這就是 Git 的限制。

---

# 3. Worktree 解決的問題

Git Worktree 讓你可以：

```plain text
project-main/
project-featureA/
project-featureB/
```

每個資料夾：

- 使用同一個 repository

- checkout 不同 branch

例如：

```plain text
project-main       → main
project-featureA   → featureA
project-featureB   → featureB
```

這樣就可以：

- 同時開發多個功能

- 不需要一直 `git checkout`

---

# 4. Worktree 的實際結構

假設你的 repo 是：

```plain text
repo/
 ├─ .git
 ├─ src
 └─ README.md
```

建立 worktree：

```plain text
git worktree add ../repo-feature feature
```

結果：

```plain text
repo/
 ├─ .git
 ├─ src
 └─ README.md

repo-feature/
 ├─ src
 └─ README.md
```

兩個資料夾：

```plain text
repo/         → main branch
repo-feature/ → feature branch
```

但它們 **共用同一個 Git repository**。

---

# 5. Worktree 內部運作

Git 其實只有一個 repository：

```plain text
.git
```

但多個 working directory。

Git 會在：

```plain text
.git/worktrees/
```

記錄 worktree 的資訊。

例如：

```plain text
.git/
 ├─ objects
 ├─ refs
 └─ worktrees
     └─ repo-feature
```

---

# 6. 建立 Worktree

建立一個新的 branch 並建立 worktree：

```plain text
git worktree add ../feature-login -b feature-login
```

意思：

```plain text
建立資料夾 ../feature-login
並建立 branch feature-login
```

---

建立 worktree 使用已存在 branch：

```plain text
git worktree add ../feature-login feature-login
```

---

# 7. 查看 Worktree

```plain text
git worktree list
```

輸出範例：

```plain text
/repo/main           abc123 [main]
/repo/feature-login  def456 [feature-login]
```

---

# 8. 刪除 Worktree

```plain text
git worktree remove ../feature-login
```

刪除的是：

```plain text
working directory
```

不是 branch。

---

# 9. Worktree 的重要規則

## 規則 1：同一個 branch 不能同時存在兩個 worktree

Git 不允許：

```plain text
repo-A → main
repo-B → main
```

這樣會造成衝突。

---

## 規則 2：所有 worktree 共用 Git repository

共用：

```plain text
commit history
objects
refs
```

但每個 worktree 有自己的：

```plain text
working files
index
HEAD
```

---

# 10. Worktree vs Clone

Clone：

```plain text
repo1/
repo2/
```

兩個 repo：

- 兩份 Git history

- 兩份 objects

- 兩份 repository

佔用很多空間。

---

Worktree：

```plain text
repo-main/
repo-feature/
```

共用：

```plain text
.git
objects
history
```

節省空間。

---

# 11. 常見使用場景

### 同時開發多個功能

```plain text
repo-main
repo-featureA
repo-featureB
```

---

### Review Pull Request

```plain text
repo-main
repo-pr123
```

---

### build / release 分離

```plain text
repo-dev
repo-build
repo-release
```

---

# 12. 實務開發流程

假設你在 main：

```plain text
repo/
```

建立 feature worktree：

```plain text
git worktree add ../repo-login -b feature-login
```

結果：

```plain text
repo/        → main
repo-login/  → feature-login
```

你可以：

```plain text
repo/
  繼續 main 開發

repo-login/
  開發 login 功能
```

---

# 13. Worktree vs Submodule

很多人會混淆。

Submodule：

```plain text
repo
 └─ library (另一個 repo)
```

Worktree：

```plain text
repo-main
repo-feature
```

差別：

| 功能 | Submodule | Worktree |
| --- | --- | --- |
| 多 repo | ✓ | ✗ |
| 多 working directory | ✗ | ✓ |
| 同 repo branch 開發 | ✗ | ✓ |

---

# 14. 一句話理解

**Git Worktree = 一個 Git repository 可以同時開多個 working folder，每個 folder 使用不同 branch。**

---

# 15. 常用指令

建立 worktree

```plain text
git worktree add <path> <branch>
```

建立 branch 並建立 worktree

```plain text
git worktree add <path> -b <branch>
```

查看 worktree

```plain text
git worktree list
```

刪除 worktree

```plain text
git worktree remove <path>
```

---

# 16. 最重要的優點

使用 Worktree 可以：

- 同時開多個 branch

- 不需要一直 checkout

- build 不互相影響

- 節省 Git repository 空間

---

# 最終總結

Git Worktree 的核心概念：

```plain text
一個 repository
↓
多個 working directory
↓
每個 directory 使用不同 branch
```

讓開發流程更乾淨、更快速。

### 來源

- 連結：

- 截圖／檔案：

### 關鍵字（你之後會怎麼找回來？）

-

---

## 🧹 整理區（有空才做）

### 這段片段可以變成什麼？

- 可重做的步驟（操作指南）

- 可重用的 code（程式片段）

- 一句話理解（概念）

### 下一次要做的最小整理

- [ ] 補一句摘要

- [ ] 加 1–3 個 Tag

- [ ] 設定重要度

- [ ] 決定要不要勾精選
