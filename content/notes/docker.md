---
author: ["PenguinPig"]
title: "Docker 筆記"
date: "2026-03-24T07:09:00.000Z"
description: "docker 使用筆記"
summary: "docker 使用筆記"
tags: ["容器化"]
categories: ["note"]
series: []
ShowToc: true
TocOpen: true
draft: true
notion_id: "32db8bba-f3ba-80c7-9438-cbc3e109e25f"
---
## 📥 收集區（先丟進來就好）

### 內容／片段

- Docker Compose
  - 常用指令

```yaml
# build image start container
# -d detach mode run in background
docker compose up -d 
# stop and keep containers
docker compose stop
# stop and remove containers and its network 
# -v remove volumes
docker compose down -v 
# restart all services
docker compose restart
# check current running containers
docker compose ps
# Exec inside container
docker compose exec {containerName} {command}
# log
docker compose logs -f
```

- 用來同時管理多個容器的工具，相比一個一個docker run

- 用來同時運行多個服務，來建置一個完整的解決方案(前端、後端、資料庫)

| 項目 | Docker | Docker Compose |
| --- | --- | --- |
| 使用方式 | 指令啟動 | YAML設定 |
| 管理數量 | 單一Container | 多個 Container |
| 網路設定 | 手動 | 自動 |
| 維護姓 | 難 | 易(集中管理) |
| 適用場景 | 單服務 | 多服務架構 |

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
