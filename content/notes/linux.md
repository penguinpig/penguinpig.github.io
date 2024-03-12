---
author: ["PenguinPig"]
title: "Linux Note"
date: "2024-02-01"
description: "Linux Note."
summary: "Linux Note."
tags: ["notes", "shell", "code"]
categories: ["linux", "syntax"]
series: ["Linux Note"]
ShowToc: true
TocOpen: true
---

# Linux Command 筆記
 
## Linux basic

1. keyboard shortcut

```ini
Ctrl + Alt + T  #Open Terminal
Ctrl + Alt + D  #Back to Desktop
```

2. Terminal command

```sh
df -h                #Check disk usuage(easy to read)
cat /etc/os-release  #Check kernal, os version
lsb_release -a       #Check distribution version
touch filename       #If not exists,Create file
vim filename         #Edit file
dpkg -i filename.deb #Install package
sudo -i              #Run as root
tail -n +2           #print 2nd line to the end
rsync -avh {sourcePath} {destination}  #Sync sourcePath file to destPath
echo -n "Stack exchange" | jq -sRr @uri # UrlEncode
netstat -al          #Check port used
ufw allow 5001       #Change firewall rule
watch -n 0.5 {script}         #Watch terminal,Repeat script in 0.5s
compgen -c           #List all available command you can run
ss                   #netstat
ps -aux {name}       #Print all process
readlink -f /proc/{pid}/exe #Get process execing path
```

---
## Others

### ssh settings

1. basic
   1. ssh.config，client side setting when you connect to other server used
   2. sshd.config，server side setting when other user connect to the host used
`
### firewall settings

1. nc(netcat)

2. ufw(Uncomlicated Firewall)
   - basic command
    ```sh
        sudo ufw {enable/disable} #{啟用/關閉} 防火牆
        sudo ufw status numbered #查看目前設定的規則
        sudo ufw default allow #預設允許所有通訊埠
        sudo ufw default deny #預設允許封鎖通訊埠
        sudo ufw {allow/deny} number_port #{允許/封鎖}特定通訊埠
        sudo ufw {allow/deny} port_num:port_num/{tcp/udp} ##{允許/封鎖}特定通訊埠一個區間
        sudo ufw {allow/deny} from {ipAddress} #{允許/封鎖} {ipAddress} 的所有連線
        sudo ufw {allow/deny} from {ipAddress}/{ipAddress_lastpart} #{允許/封鎖} 一個區間的IP 的所有連線
    ```
3. iptables
   - basic command
    ```sh
        firewall-cmd --zone=public --add-port=8080/tcp #Add Incoming port rule
        firewall-cmd --reload                          #Update change of firewall rule
        firewall-cmd --zone=public --list-ports        #list zone port rlue
    ```

### login without message

- 登入不顯示訊息
    ```sh
    touch ~/.hushlogin
    ```