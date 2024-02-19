---
author: ["PenguinPig"]
title: "{{ .File.ContentBaseName | title }}"
date: "{{ .Date }}"
description: "{{ .File.ContentBaseName | title }} Note."        # 文章簡易描述(顯示在文章最上頭文件標題之前)
summary: "{{ .File.ContentBaseName | title }} Note."            # 文章概要    (顯示在首頁供快速查看)
tags: ["notes"]
categories: []
series: ["{{ .File.ContentBaseName | title }} Note"]
ShowToc: true
TocOpen: true
---