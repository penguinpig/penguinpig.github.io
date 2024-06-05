---
author: ["PenguinPig"]
title: "IsolateDevEnv"
date: "2024-06-05T11:25:29+08:00"
description: "IsolateDevEnv Note."        # 文章簡易描述(顯示在文章最上頭文件標題之前)
summary: "IsolateDevEnv Note."            # 文章概要    (顯示在首頁供快速查看)
tags: ["notes"]
categories: []
series: ["IsolateDevEnv Note"]
ShowToc: true
TocOpen: true
---

# Establish an isolated development environment

## Environment
```ini
Host OS: Window 11
Guest OS: Linux 22.04 LTS
Virtual Machine Platform: Hyper-V
```
1.  Enable Window feature Hyper-V
    1.  Open powershell terminal as administror(Alt + X)
    2.  Type command
        ```powershell
        Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
        ```
        ![alt text](/static/images/IsolateDevEnv/step0.png)
        
2. Opne Hyper-V manager,Create a Network switch
   1. Click virtual swtich manager
        ![alt text](/static/images/IsolateDevEnv/network1.png)
   2. Choose external and click establish virtual switch
        ![alt text](/static/images/IsolateDevEnv/network2.png)
   3. Type a name and choose host wifi network card
        ![alt text](/static/images/IsolateDevEnv/network3.png)
3. Open Hyper-V manager,Create a virtual machine
   1. Use search to find hyper-V manager and open it
        ![alt text](/static/images/IsolateDevEnv/step1.png)
   2. Click new virtual machine
        ![alt text](/static/images/IsolateDevEnv/step2.png)
        ![alt text](/static/images/IsolateDevEnv/step3.png)
   3. Click next step
        ![alt text](/static/images/IsolateDevEnv/step4.png)
   4. Type Machine Name and locate
        ![alt text](/static/images/IsolateDevEnv/step5.png)
   5. Choose second generation
        ![alt text](/static/images/IsolateDevEnv/step6.png)
   6. Type RAM capacity(Advise 8192 MB)
        ![alt text](/static/images/IsolateDevEnv/step7.png)
   7. Choose Network switch which created above
        ![alt text](/static/images/IsolateDevEnv/step8.png)
   8. Choose establish virtual disk and type capacity
        ![alt text](/static/images/IsolateDevEnv/step9.png)
   9. Choose install os from iso and select iso
        ![alt text](/static/images/IsolateDevEnv/step10.png)
   10. Click complete
        ![alt text](/static/images/IsolateDevEnv/step11.png)
   11. Right click to setting
        ![alt text](/static/images/IsolateDevEnv/step12.png)
   12. Disable bootup safely
        ![alt text](/static/images/IsolateDevEnv/step13.png)