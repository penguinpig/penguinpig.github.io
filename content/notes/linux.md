---
author: ["PenguinPig"]
title: "My Linux Note"
date: "2024-02-01"
description: "Linux Note."
summary: "Linux Note."
tags: ["notes", "shell", "code"]
categories: ["linux", "syntax"]
series: ["My Linux Note"]
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
```

---
## Others

### firewall settings

1. nc(netcat)

