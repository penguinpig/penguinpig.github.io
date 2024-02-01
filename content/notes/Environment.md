---
title: "Environment"
date: "2024-02-01T15:45:39+08:00"
draft: true
---

# 環境設定

- [ ] Solution_1 (WSL)

  1. Window11 + WSL GUU
     1. 確認安裝 WSL2
     2. 安裝版本(distribution):Ubuntu-20.04
  2. Linux 安裝以下套件
      - sudo apt-get install xrdp
      - sudo apt-get install vnc4server
      - sudo apt-get install ubuntu-desktop (optional)

  3. wsl basic command
        ```powershell
        wsl --list --verbose #List all installed distribution verison
        wsl --shutdown       
        ```

    ## 疑難排解

  - 如果無法安裝套件執行以下動作(X)
    1. cd /etc
    1. sudo touch wsl.conf
    2. sudo vim wsl.conf

    ```ini
     [network]
     generateResolvConf = false
    ```

    3. Reboot wsl

    ```powershell
     wsl --shutdown
     wsl
    ```

    4. Edit resolv.conf

    ```sh
     cd /etc
     sudo touch resolv.conf
     sudo vim resolv.conf
    ```

    ```ini
     nameserver 8.8.8.8
    ```

- [X] Hyper-V 

    1. Hyper-V + Ubuntu LTS **(22.04)**
       1. [準備 ISO 檔(ubuntu-22.04.3)](https://ubuntu.com/download/desktop)
       2. HyperV 預先建立硬碟256G(避免之後要再擴展)
   