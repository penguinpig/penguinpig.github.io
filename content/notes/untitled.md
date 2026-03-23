---
author: ["PenguinPig"]
title: "語音轉帳"
date: "2026-01-08T02:57:00.000Z"
description: "語音轉帳"
summary: "語音轉帳"
tags: ["LLM"]
categories: ["note"]
series: []
ShowToc: true
TocOpen: true
draft: false
notion_id: "2e2b8bba-f3ba-800d-b779-e7e50bf10abe"
---
## 📌 核心內容

### 主要想法／問題

- 建置window可執行檔方案，不管哪個都要使用window container
  - Pyinstaller
    - 會包含source，弱掃無法通過

  - Nutika
    - 編譯方式待確認可行(MSVC、MINGW)
      - MINGW，會遇到編譯器下載問題

      - MSVC，會遇到環境無法建立

  - ONNX runtime (最後確定解決方案)

- 模型準確率
  - 目前使用預訓練模型(bert-base-chinese)，出處: [google-bert/bert-base-uncased · Hugging Face](https://huggingface.co/google-bert/bert-base-uncased)

  - 須調整訓練及計算loss方式
    - 訓練和驗證資料集需分開

- 最終回應的欄位結構，遇到中文字的處理需額外處理數值(千、萬)
  - 內部
    - {"nickname": None, "amount": None, “amountValue”: None, “numeral”: None, "unit": None}

  - 外部
    - {"nickname": None, "amount": None, "unit": None}

- 中文字全形及半形比較
  - 全形 (Full-width) DBCS

  - 半形 (half-width) SBCS

- 英文正規化處理
  - 英文暱稱的開頭通常語音轉文字後會是大寫

  - 半形和全形的處理

### 詳細說明

*展開你的想法，補充更多細節、背景資訊或分析*

---

## 💡 關鍵發現／學習

### 我學到了什麼？

- 模型訓練
  - Early Stopping (提早停止訓練)
    - 在訓練模型時通常會觀察兩個指標
      - **Training Loss**：模型在訓練資料上的誤差

      - **Validation Loss**：模型在驗證資料上的誤差

    - 訓練過程通常會出現以下情況：
      1. **Training Loss 持續下降**

      1. **Validation Loss 一開始下降，但之後開始上升**

      當 Validation Loss 開始上升時，代表模型開始 **過度擬合訓練資料**。

    - 好處
      - **避免 Overfitting**

      - **節省訓練時間**

      - **自動找到最佳停止點**

- distribution shift (分布偏移)
  - 兩種方案
    - 正規化 → 模型處理

    - 模型處理 → 正規化

  - 兩種方案的選擇，需在訓練端及預測端程式一致

- pyNgrok 
  - 用於簡易測試

  - 暴露本地端口到外網

### 為什麼重要？

*這個筆記對你的價值是什麼？*

---

## 🔗 延伸思考

### 相關連結／資源

-

-

### 下一步行動

*這個筆記衍生出什麼待辦事項或想做的事？*

- [ ] 模型存放在sqlServer，且支援版本控制
  - [ ] OnnxRuntime

- [ ] 設定排成，訓練 → 更新模型權重

### 待解決的問題

*還有什麼不清楚或需要進一步探索的？*

-

-

---

## 📝 隨手記

*其他零碎的想法、參考資料或筆記*
