---
author: ["PenguinPig"]
title: "My Hugo Note"
date: "2024-02-01"
description: "My Hugo Note."
summary: "My Hugo Note."
tags: ["hugo", "coomand"]
categories: ["hugo"]
series: ["My Hugo Note"]
ShowToc: true
TocOpen: true
---
## Basic settings
1. 在VsCode裡預覽md的圖片路徑，在hugo production上會存取不到，因為hugo會把static的路徑解析成網站根目錄，例如
     - source的路徑為 {rootProject}/static/images/test.png
     - md裡寫的路徑為 /static/images/test.png
     - Production的路徑會是 {baseUrl}/images/test.png
     - 解決方式在設定檔新增路徑對應，如下
        ```yaml
        module:
         mounts:
         - source: "static/images"          #對應source的路徑
           target: "static/static/images"   #對應baseUrl的路徑
        ```  
## Basic command

```sh
hugo new content -k {archetypes} {filename}.md  # Create a article and specefic the file type
hugo new content {filename}.md -c {path}        # Create a file and specific file path
hugo server -e production                       # Debug with production mode
```