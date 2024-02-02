---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
layout: "archives"
# url: "/archives"
summary: {{ replace .File.ContentBaseName "-" " " | title }}
date: "{{ .Date }}"
---