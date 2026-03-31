---
author: ["PenguinPig"]
title: "Kubectl 筆記"
date: "2026-03-31T02:28:00.000Z"
description: "紀錄 kubectl常用指令及問題"
summary: "紀錄 kubectl常用指令及問題"
tags: ["Cloud"]
categories: ["note"]
series: []
ShowToc: true
TocOpen: true
draft: true
notion_id: "334b8bba-f3ba-8013-a423-d6a5d7e2b38a"
---
## 📥 收集區（先丟進來就好）

### 內容／片段

- VMware AKO(Avi) as Ingress Controller
  -

- kubectl 網路拓樸

```mermaid
flowchart TD
    A[Ingress created or updated] --> B[AKO should watch Ingress]
    B --> C{AKO pod healthy?}
    C -- Yes --> D[AKO reconciles Ingress]
    D --> E[Add annotations]
    E --> F[Update ADDRESS]
    F --> G[Traffic can be routed]

    C -- No --> H[No reconciliation]
    H --> I[No new annotations]
    I --> J[No ADDRESS update]
    J --> K[Domain may timeout or have no route]
```

```mermaid
flowchart TD
    A[Create Ingress in namespace] --> B{Ingress class matches controller?}
    B -- No --> C[Controller ignores it]
    C --> D[No ADDRESS]

    B -- Yes --> E{Controller watches this namespace?}
    E -- No --> F[Ingress not reconciled]
    F --> D

    E -- Yes --> G{Controller can read namespace and ingress?}
    G -- No --> H[RBAC / permission issue]
    H --> D

    G -- Yes --> I{Ingress spec valid?}
    I -- No --> J[Rejected or ignored by controller]
    J --> D

    I -- Yes --> K[Controller reconciles Ingress]
    K --> L[Publish controller external address]
    L --> M[ADDRESS appears]
```

```mermaid
flowchart LR
    A[User Browser] -->|HTTP Request\nexample.com| B[DNS Server]
    B -->|Resolve to IP| C[(Ingress Controller Nginx Ingress)]
    
    C -->|Match Host/Path?| D{Ingress Rule}
    
    D -- Yes --> E[Service\nClusterIP]
    D -- No --> F[Nginx Default Backend\n404]
    
    E --> G[Pod\nNginx Container]
    
    G -->|Response| E
    E --> C
    C --> A
```

- kubectl 常用指令

```shell
kubectl config set-context --current --namespace={ns} # 設定預設命名空間
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
