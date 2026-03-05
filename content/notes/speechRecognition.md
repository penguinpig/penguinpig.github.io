---
author: ["PenguinPig"]
title: "語音辨識筆記"
date: "2026-03-04T04:04:39Z"
description: "語音辨識." # 文章簡易描述(顯示在文章最上頭文件標題之前)
summary: "語音辨識." # 文章概要    (顯示在首頁供快速查看)
tags: ["notes"]
categories: []
series: ["語音辨識筆記"]
ShowToc: true
TocOpen: true
draft: true 
---

# 語音辨識

## 需求

- 根據一串文字內容，分析出特定欄位(ex: 金額、人名、單位...)

## 解決方案

### 框架選擇

- python 打包程式給exe給外部呼叫
  - pyinstaller
  - Nutika
- ONNX runtime
  - Nuget package ONNX runtime，在python上訓練好並繪出模型
