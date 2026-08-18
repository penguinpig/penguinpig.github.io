---
author: ["PenguinPig"]
title: "Clean Code && OOP && SOLID"
date: "2026-08-18T05:52:00.000Z"
description: "程式設計原則"
summary: "程式設計原則"
tags: ["程式設計"]
categories: ["note"]
series: []
ShowToc: true
TocOpen: true
draft: false
notion_id: "3c0b8bba-f3ba-803a-b065-df65f351259c"
---
## 📥 收集區（先丟進來就好）

### 內容／片段

- Clean Code

```javascript
│
├─ 1. Good Naming — 好的命名
│  └─ 名稱直接表達用途
│     ├─ n           ❌
│     └─ userCount   ✅
│
├─ 2. One Function, One Responsibility — 一個函式一個責任
│  └─ 不要一個 Method 包辦所有事情
│     ├─ Validate()
│     ├─ Calculate()
│     ├─ Save()
│     └─ SendEmail()
│
├─ 3. Avoid Deep Nesting — 避免過深巢狀
│  └─ 使用 Guard Clause / Early Return
│     ├─ 不合法 → return
│     ├─ 無權限 → return
│     └─ 合法   → 執行主要邏輯
│
├─ 4. DRY — 不要重複自己
│  └─ 相同的知識/規則不要散落各處
│     ├─ 共用計算 → Method
│     ├─ 共用數值 → Constant / Config
│     └─ Business Rule → 集中管理
│
├─ 5. Avoid Magic Values — 避免魔術數字/字串
│  └─ 替數值賦予意義
│     ├─ "A"   → Status.Approved
│     ├─ 5     → MaxRetryCount
│     └─ 0.05m → TaxRate
│
├─ 6. Comments Explain Why — 註解解釋 Why
│  └─ 不要用註解重複程式碼
│     ├─ Code    → What / How
│     └─ Comment → Why
│
├─ 7. Keep Functions Focused — Function 保持單純
│  └─ High-level Method 描述流程
│     └─ ProcessOrder()
│        ├─ ValidateOrder()
│        ├─ CalculateTotal()
│        ├─ SaveOrder()
│        └─ SendConfirmation()
│
├─ 8. Separate Responsibilities — 分離不同職責
│  └─ 不要全部塞在同一層
│     ├─ Controller → HTTP
│     ├─ Service    → Business Logic
│     ├─ Repository → Data Access
│     └─ Database   → Storage
│
├─ 9. Handle Errors Clearly — 清楚處理錯誤
│  └─ Catch 是為了「處理」而不是「隱藏」
│     ├─ 能恢復 → Recover
│     ├─ 需要紀錄 → Log
│     ├─ 無法處理 → throw
│     └─ catch { } ❌
│
└─ 10. Readability > Cleverness — 可讀性優先
└─ 不要為了少幾行而讓程式難懂
├─ Clear naming
├─ Clear conditions
├─ Simple flow
└─ Easy maintenance
```

- OOP

```javascript
│
├─ Encapsulation 封裝
│  └─ 保護內部資料
│     "你不能隨便改我的狀態"
│
├─ Abstraction 抽象
│  └─ 隱藏實作細節
│     "你只需要知道怎麼使用我"
│
├─ Inheritance 繼承
│  └─ 重用父類別功能
│     "我是 Animal 的一種"
│
└─ Polymorphism 多型
└─ 相同介面，不同實作
"都是 Animal，但行為可以不同"
```

- Solid

```javascript
SOLID Principles
│
├─ S — Single Responsibility Principle (SRP)
│  ├─ 單一職責原則
│  ├─ 一個 Class 應該只有一個主要職責
│  │  "一個 Class 不要什麼事情都做"
│  │
│  └─ Example
│     OrderService    → Order 邏輯
│     EmailService    → Email
│     LoggingService  → Logging
│
├─ O — Open/Closed Principle (OCP)
│  ├─ 開放封閉原則
│  ├─ 對擴充開放，對修改封閉
│  │  "增加新功能，盡量不要一直改舊程式"
│  │
│  └─ Example
│     interface IDiscountStrategy
│     ├─ VipDiscount
│     ├─ EmployeeDiscount
│     └─ StudentDiscount
│
├─ L — Liskov Substitution Principle (LSP)
│  ├─ 里氏替換原則
│  ├─ 子類別應該可以安全替代父類別
│  │  "換成子類別後，原本程式不能壞掉"
│  │
│  └─ Example
│     Bird
│     ├─ Sparrow → IFlyable
│     └─ Penguin → 不實作 IFlyable
│
├─ I — Interface Segregation Principle (ISP)
│  ├─ 介面隔離原則
│  ├─ Interface 應該小而專一
│  │  "不要逼 Class 實作它不需要的方法"
│  │
│  └─ Example
│     IWorkable → Work()
│     IEatable  → Eat()
│     IFlyable  → Fly()
│
└─ D — Dependency Inversion Principle (DIP)
   ├─ 依賴反轉原則
   ├─ 依賴抽象，而不是具體實作
   │  "依賴 Interface，不要綁死某個 Class"
   │
   └─ Example
      OrderService
          ↓
      IOrderRepository
          ↑
      SqlOrderRepository
```

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
