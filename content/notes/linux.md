---
author: ["PenguinPig"]
title: "Linux筆記"
date: "2024-12-24T06:49:00.000Z"
description: "整理Linux常用指令"
summary: "整理Linux常用指令"
tags: ["Linux"]
categories: ["note"]
series: []
ShowToc: true
TocOpen: true
draft: true
notion_id: "166b8bba-f3ba-8023-a921-c82bd3f2a048"
---
### 內容/片段

- 列出安裝套件

```shell
# apline
apk list --installed
apk info -R $(apk info) # List pacakge and it dependency recurse

# debain
dpkg -l
# List pacakge and it dependency recurse
for pkg in $(dpkg-query -W -f='${binary:Package}\n'); do
  echo "===== $pkg ====="
  apt-cache depends $pkg
  echo
done
```

- 無密碼登入Linux
  - 產生本地公私鑰，複製公鑰到遠端伺服器

```shell
# --本地端--
# 產生公私鑰
ssh-keygen -t ed25519 
# 複製公鑰到遠端伺服器
ssh-copy-id user@remote_host 
scp $env:USERPROFILE\.ssh\id_ed25519.pub user@remote_host:/tmp/mykey.pub
# --遠端--
mkdir -p ~/.ssh
cat /tmp/mykey.pub >> ~/.ssh/authorized_keys
rm /tmp/mykey.pub
# --疑難排解--
# ---檔案權限問題---
# 1. 可能是home的權限
# 2.  
chmod 700 ~/.ssh # Owner: read + write + execute、Others: NO access
chmod 600 ~/.ssh/authorized_keys # Owner: read + write、Others: NO access
chmod 755 ~ # Owner: full access、Others: read + execute
chown -R user:user ~/.ssh # Make sure .ssh and all its files belong to the correct user
```

- 常用指令

```shell
uname -a # 取得 Cpu架構
cat /etc/os-release # 取得分散式版本
```

- .Net Runtime general needed library in apline

```shell
libc

Core C runtime library.
Provided by musl on Alpine.
For better compatibility with .NET features that expect glibc, consider using gcompat.
libstdc++

Standard C++ library for certain components or libraries that may rely on C++.
libgcc

GCC runtime library for proper exception handling and low-level system support.
libssl

OpenSSL library for secure communications (e.g., HTTPS, TLS).
Install with:
bash
複製程式碼
apk add libssl3
zlib

Compression library used internally by the .NET runtime.
icu-libs

International Components for Unicode (ICU).
Required if DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false for advanced globalization and localization.
krb5

Kerberos library for authentication (used by Microsoft.Data.SqlClient when connecting to SQL Server with integrated authentication).
Install with:
bash
複製程式碼
apk add krb5
tzdata

Timezone data for handling time and date operations correctly in the .NET runtime.
Install with:
bash
複製程式碼
apk add tzdata
gcompat (Optional)

Compatibility layer to provide partial glibc support on musl-based systems.
Install with:
bash
複製程式碼
apk add gcompat
ca-certificates

Certificate authority bundle required for SSL/TLS connections.
Install with:
bash
複製程式碼
apk add ca-certificates
```

- apline 會造成 datetiem.tostring的結果和ubuntu不一致
  - 應該是需額外設定 locals

  - [DateTime format issue with Alpine 3.19 · Issue #5234 · dotnet/dotnet-dockerateTime format issue with Alpine 3.19 · Issue #5234 · dotnet/dotnet-docker](https://github.com/dotnet/dotnet-docker/issues/5234)

```powershell
* 確認少裝 icu-data-full 會影響DateTimeformt的問題，但沒有出
```
