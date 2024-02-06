---
author: ["PenguinPig"]
title: "environment settings"
date: "2024-02-01T15:45:39+08:00"
description: "environment settings."
summary: "environment settings."
tags: ["notes","setting"]
categories: ["setting"]
series: ["environment"]
ShowToc: true
TocOpen: true
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

  4. 疑難排解

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
       3. 網卡選擇Default switch
       4. 成功安裝Linux後，執行以下命令
          ```sh
            apt-get install openssh-server #安裝 Secure Shell Server
            systemctl status ssh #檢查狀態
            ip addr | grep eth0 #檢查IP位置
          ```
        5. 本機電腦上，執行以下命令遠端到電腦
            ```sh
              ssh {userName}@{IP}
            ```
        6. 開啟加強工作階段(optional)
           1.  執行以下指令後重啟電腦，再執行一次
            ```sh
                #!/bin/bash

                #
                # This script is for Ubuntu 18.04 Bionic Beaver to download and install XRDP+XORGXRDP via
                # source.
                #
                # Major thanks to: http://c-nergy.be/blog/?p=11336 for the tips.
                #

                ###############################################################################
                # Use HWE kernel packages
                #
                HWE=""
                #HWE="-hwe-18.04"

                ###############################################################################
                # Update our machine to the latest code if we need to.
                #

                if [ "$(id -u)" -ne 0 ]; then
                  echo 'This script must be run with root privileges' >&2
                  exit 1
                fi

                apt update && apt upgrade -y

                if [ -f /var/run/reboot-required ]; then
                  echo "A reboot is required in order to proceed with the install." >&2
                  echo "Please reboot and re-run this script to finish the install." >&2
                  exit 1
                fi

                ###############################################################################
                # XRDP
                #

                # Install hv_kvp utils
                apt install -y linux-tools-virtual${HWE}
                apt install -y linux-cloud-tools-virtual${HWE}

                # Install the xrdp service so we have the auto start behavior
                apt install -y xrdp

                systemctl stop xrdp
                systemctl stop xrdp-sesman

                # Configure the installed XRDP ini files.
                # use vsock transport.
                sed -i_orig -e 's/use_vsock=false/use_vsock=true/g' /etc/xrdp/xrdp.ini
                # use rdp security.
                sed -i_orig -e 's/security_layer=negotiate/security_layer=rdp/g' /etc/xrdp/xrdp.ini
                # remove encryption validation.
                sed -i_orig -e 's/crypt_level=high/crypt_level=none/g' /etc/xrdp/xrdp.ini
                # disable bitmap compression since its local its much faster
                sed -i_orig -e 's/bitmap_compression=true/bitmap_compression=false/g' /etc/xrdp/xrdp.ini

                # Add script to setup the ubuntu session properly
                if [ ! -e /etc/xrdp/startubuntu.sh ]; then
                cat >> /etc/xrdp/startubuntu.sh << EOF
                #!/bin/sh
                export GNOME_SHELL_SESSION_MODE=ubuntu
                export XDG_CURRENT_DESKTOP=ubuntu:GNOME
                exec /etc/xrdp/startwm.sh
                EOF
                chmod a+x /etc/xrdp/startubuntu.sh
                fi

                # use the script to setup the ubuntu session
                sed -i_orig -e 's/startwm/startubuntu/g' /etc/xrdp/sesman.ini

                # rename the redirected drives to 'shared-drives'
                sed -i -e 's/FuseMountName=thinclient_drives/FuseMountName=shared-drives/g' /etc/xrdp/sesman.ini

                # Changed the allowed_users
                sed -i_orig -e 's/allowed_users=console/allowed_users=anybody/g' /etc/X11/Xwrapper.config

                # Blacklist the vmw module
                if [ ! -e /etc/modprobe.d/blacklist_vmw_vsock_vmci_transport.conf ]; then
                cat >> /etc/modprobe.d/blacklist_vmw_vsock_vmci_transport.conf <<EOF
                blacklist vmw_vsock_vmci_transport
                EOF
                fi

                #Ensure hv_sock gets loaded
                if [ ! -e /etc/modules-load.d/hv_sock.conf ]; then
                echo "hv_sock" > /etc/modules-load.d/hv_sock.conf
                fi

                # Configure the policy xrdp session
                cat > /etc/polkit-1/localauthority/50-local.d/45-allow-colord.pkla <<EOF
                [Allow Colord all Users]
                Identity=unix-user:*
                Action=org.freedesktop.color-manager.create-device;org.freedesktop.color-manager.create-profile;org.freedesktop.color-manager.delete-device;org.freedesktop.color-manager.delete-profile;org.freedesktop.color-manager.modify-device;org.freedesktop.color-manager.modify-profile
                ResultAny=no
                ResultInactive=no
                ResultActive=yes
                EOF

                # reconfigure the service
                systemctl daemon-reload
                systemctl start xrdp

                #
                # End XRDP
                ###############################################################################

                echo "Install is complete."
                echo "Reboot your machine to begin using XRDP."
            ```
          2. 打開PowerShell 執行
            ```powershell
                Set-VM -VMName "VMName" -EnhancedSessionTransportType HvSocket
            ```
     7. ssh connection timeout settings(optional)
        1. vim /etc/ssh/ssh_config
        2. 加入以下
          ```ini
            ClientAliveInterval 30 #伺服器每隔(秒) 傳送訊息給客戶端，客戶端收到訊息會回傳以維持連線。
            ClientAliveCountMax 20 #經過幾次客戶端沒回應，伺服器結束連線
          ``` 
        3. 重啟服務
          ```sh
            systemctl restart ssh
            systemctl restart sshd
          ``` 
   