---
author: ["PenguinPig"]
title: "Git Note"
date: "2024-02-01"
description: "Git Note."
summary: "Git Note."
tags: ["notes", "linux"]
categories: ["linux"]
series: ["Git Note"]
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
![alt text](/static/images/GitNote/GitNote_1.png)

1. Check Result
```sh
ls ~/.ssh -al
cat ~/.ssh id_rsa
cat ~/.ssh id_rsa.pub
```
1. Copy public key
```sh
cat ~/.ssh/id_rsa.pub
```
1. Apply to GitHub setting
   1. Settings > SSH and GPG keys
   2. New SSH key
      1. Type a name，Add a ssh key

## Basic command

```sh
git config --list                           #Check config list
git config --global user.name "{name}"      #Set name
git config --global user.name "{email}"     #Set email
```

## Common problem

- Can not clone push pull,beacuse prot 22 timeout
  - cd to /etc/ssh
  - sudo vim ssh_config，add the followings
  ```text
   Host github.com
      Hostname ssh.github.com
      Port 443
  ``` 
  - ssh -T git@github.com，test command