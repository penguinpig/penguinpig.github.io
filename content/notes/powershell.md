---
author: ["PenguinPig"]
title: "Powershell"
date: "2024-02-19T16:07:16+08:00"
description: "Powershell Note."        # 文章簡易描述(顯示在文章最上頭文件標題之前)
summary: "Powershell Note."            # 文章概要    (顯示在首頁供快速查看)
tags: ["notes"]
categories: []
series: ["Powershell Note"]
ShowToc: true
TocOpen: true
---

## Common command
- decode base64 string to string
    ```powershell
        [Text.Encoding]::Utf8.GetString([Convert]::FromBase64String('???')) 
    ```
- encode string to base64 string
    ```powershell
        [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('???'))
    ```