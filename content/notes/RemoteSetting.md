---
author: ["PenguinPig"]
title: "RemoteSetting"
date: "2024-03-01T09:57:06+08:00"
description: "RemoteSetting Note."        # 文章簡易描述(顯示在文章最上頭文件標題之前)
summary: "RemoteSetting Note."            # 文章概要    (顯示在首頁供快速查看)
tags: ["notes"]
categories: []
series: ["RemoteSetting Note"]
ShowToc: true
TocOpen: true
---

## 遠端機器設定

### Linux (ssh)

- 基本語法 **(此方法需要每次額外輸入密碼)**

    ```sh
    ssh {username}@{sererIP}
    ```
- 設定不須輸入密碼
    
    1. Generate ssh key(pulbic & private)
        ```sh
        ssh-keygen
        ```

    2. Press three times enter to use default value
        ![alt text](/static/images/RemoteSetting/RemoteSetting1.png) 
    
    3. Check Result
       1. Linux Path "~/.ssh/id_rsa.pub"
       2. Window Path ""C:\User\{UserName}\.ssh\id_rsa.pub"
        ![alt text](/static/images/RemoteSetting/RemoteSetting2.png) 
        ![alt text](/static/images/RemoteSetting/RemoteSetting3.png) 

    4. Copy Public Key to Remote server Key **(需使用GitBash)**
        ```sh
        ssh-copy-id {userName}@{serverIP}
        Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
        {userName}@{serverIP}'s password: *******
        ```
        ![alt text](/static/images/RemoteSetting/RemoteSetting4.png) 

### Window(winrm)
- 前置設定
  - 來源端及目標端不在同一個網域，來源及目標都設定信任清單
    ```powershell
    winrm set winrm/config/client '@{TrustedHosts="serverIP,serverIP"}' #設定信任清單
    winrm get winrm/config/client #查詢設定檔
    ```
- 基本語法 **(需要系統管理員身分啟動powershell)**
    ```powershell
    Enter-PSsessin {serverIP}
    ``` 

