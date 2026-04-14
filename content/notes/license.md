---
author: ["PenguinPig"]
title: "軟體授權問題 License "
date: "2026-04-08T05:54:00.000Z"
description: "認識軟體授權"
summary: "認識軟體授權"
tags: ["Software"]
categories: ["note"]
series: []
ShowToc: true
TocOpen: true
draft: true
notion_id: "33cb8bba-f3ba-80c6-8d60-e12fa3279daf"
---
## 📥 收集區（先丟進來就好）

### 內容／片段

- 軟體授權表格

| 授權 | 類型 | 可商用 | 可修改 | 可散布 | 是否必須開源整個專案 | 是否需保留聲明 | 專利保護 | 風險 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MIT | Permissive | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | 🟢 低 |
| BSD (2/3-Clause) | Permissive | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | 🟢 低 |
| ISC | Permissive | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | 🟢 低 |
| Apache 2.0 | Permissive | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | 🟢 低 |
| MPL 2.0 | Weak Copyleft | ✅ | ✅ | ✅ | ⚠️ 檔案層級 | ✅ | ✅ | 🟡 中 |
| LGPL 2.1/3.0 | Weak Copyleft | ✅ | ✅ | ✅ | ⚠️ 函式庫層級 | ✅ | ❌ | 🟡 中 |
| EPL 2.0 | Weak Copyleft | ✅ | ✅ | ✅ | ⚠️ 模組層級 | ✅ | ✅ | 🟡 中 |
| CDDL | Weak Copyleft | ✅ | ✅ | ✅ | ⚠️ 檔案層級 | ✅ | ❌ | 🟡 中 |
| GPL 2.0 | Strong Copyleft | ⚠️ | ✅ | ✅ | 🔴 必須整個開源 | ✅ | ❌ | 🔴 高 |
| GPL 3.0 | Strong Copyleft | ⚠️ | ✅ | ✅ | 🔴 必須整個開源 | ✅ | ✅ | 🔴 高 |
| AGPL 3.0 | Strong Copyleft | ⚠️ | ✅ | ✅ | 🔴 SaaS也要開源 | ✅ | ✅ | 🔴 極高 |
| SSPL | Source-Available | ⚠️ | ✅ | ✅ | 🔴 SaaS需開整個服務 | ✅ | ❌ | 🔴 極高 |
| BSL | Source-Available | ⚠️ | ✅ | ⚠️ | ❌ (限制用途) | ✅ | ❌ | 🟡 中 |
| Unlicense | Public Domain | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | 🟢 極低 |
| CC0 | Public Domain | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | 🟢 極低 |
| Proprietary | Commercial | ⚠️ | ⚠️ | ⚠️ | ❌ | ✅ | ⚠️ | 🟡~🔴 |

- 核心概念
### 1️⃣ Permissive（寬鬆）

  - 幾乎沒限制（MIT / BSD）

  - 👉 商業專案最安全

---

### 2️⃣ Weak Copyleft（弱傳染）

  - 只影響「部分」程式碼

  - 👉 例如：
    - 改 library 才要開源

    - 用 library 不用開源

---

### 3️⃣ Strong Copyleft（強傳染）

  - 只要用 → 整個專案要開源

  - 👉 企業通常禁止

---

### 4️⃣ SaaS Trap（AGPL / SSPL）

  - 連 backend API 都算「distribution」

  - 👉 很容易踩雷

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
