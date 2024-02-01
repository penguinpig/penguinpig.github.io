---
author: ["PenguinPig"]
title: "My Git Note"
date: "2024-02-01"
description: "Git Note."
summary: "Git Note."
tags: ["markdown", "syntax", "code", "gist"]
categories: ["themes", "syntax"]
series: ["My Git Note"]
ShowToc: true
TocOpen: true
---

# Git 筆記

## Setting ssh
1. Generate ssh key(pulbic & private)
```sh
ssh-keygen -t rsa -b 4096 -C "{email}"
```
2. Press three times enter to use default value
![Step1](/home/jie/Desktop/SideProject/Blog/images/GitNote_1.png)
3. Check Reslut
```sh
ls ~/.ssh -al
cat ~/.ssh id_rsa
cat ~/.ssh id_rsa.pub
```
4. Copy public key
```sh
cat ~/.ssh/id_rsa.pub
```
5. Apply to GitHub setting
   1. Settings > SSH and GPG keys
   2. New SSH key
      1. Type a name，Add a ssh key

## Basic command

```sh
git config --list                           #Check config list
git config --global user.name "{name}"      #Set name
git config --global user.name "{email}"     #Set email
```