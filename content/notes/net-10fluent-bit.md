---
author: ["PenguinPig"]
title: "升級.Net 10、fluent-bit"
date: "2026-03-19T02:29:00.000Z"
description: "升級.Net10、fluent-bit取代ELK"
summary: "升級.Net10、fluent-bit取代ELK"
tags: ["Infra"]
categories: ["note"]
series: []
ShowToc: true
TocOpen: true
draft: false
notion_id: "328b8bba-f3ba-8007-bcb0-e3c6697a3944"
---
### 內容／片段

- 升級 .Net 10
  - [x] 減少 log大小
    - message種類
      - [x] Storing keys in a directory '/home/dotnet/.aspnet/DataProtection-Keys' that may not be persisted outside of the container. Protected data will be unavailable when container is destroyed. For more information go to [https://aka.ms/aspnet/dataprotectionwarning](https://aka.ms/aspnet/dataprotectionwarning)
        - 用nlog rule  Microsoft.AspNetCore.DataProtection.* maxlevel="Warn”

      - [x] No XML encryptor configured. Key {037d828b-f65e-4f42-85c4-06d3cc6c308b} may be persisted to storage in unencrypted form.
        - 用nlog rule  Microsoft.AspNetCore.DataProtection.* maxlevel="Warn”

      - [x] Failed to determine the https port for redirect.
        - 原因為環境運行上暴露http，https只到nginx

      - [x] Overriding HTTP_PORTS '8080' and HTTPS_PORTS ''. Binding to values defined by URLS instead '[http://+:8080](http://+:8080/)'.
        - 在微軟的base 已設定 HTTP_PORTS ，不需另外再設定 ASPNETCORE_URLS

  - fluent-bit → splunk
    - splunk只接收特定的json格式，在fluent-bit需設定
      - format json_stream

    - 測試fluent-bit，實際送出內容
      - mock-hec.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mock-splunk-hec
  namespace: myBank
  labels:
    app: mock-hec
spec:
  containers:
    - name: mock-hec
      image: harbor.Mybank/Mybank.lbot/alpine:3.23.2
      imagePullPolicy: Always
      ports:
        - containerPort: 8088
          name: hec
      # Optional but recommended: basic readiness probe
      readinessProbe:
        tcpSocket:
          port: 8088
        initialDelaySeconds: 1
        periodSeconds: 5
      livenessProbe:
        tcpSocket:
          port: 8088
        initialDelaySeconds: 5
        periodSeconds: 10

---
apiVersion: v1
kind: Service
metadata:
  name: mock-splunk-hec
  namespace: myBank
spec:
  selector:
    app: mock-hec
  ports:
    - port: 8088
      targetPort: 8088
      name: hec

```

      - hec-mock.dockerfile

```yaml
# Use to mock splunk Http event collector
# Step 1: Build Image "docker build -f DockerFiles/hec-mock.dockerfile -t MyBank.lbot/alpine:3.23.2 ."
# Step 2: Save Image docker save MyBank.lbot/alpine:3.23.2 -o alpine-3.23.2.tar
FROM alpine:latest

RUN apk add --no-cache busybox-extras

EXPOSE 8088

RUN cat << 'EOF' > /mock-hec.sh && \
    tr -d '\r' < /mock-hec.sh > /mock-hec.clean && \
    mv /mock-hec.clean /mock-hec.sh && \
    chmod +x /mock-hec.sh
#!/bin/sh
set -e

PORT="${PORT:-8088}"
COUNTER=0

# 顏色（有些 kubectl logs 介面不會渲染，但文字仍會正常輸出）
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RESET="\033[0m"

log() { printf "%b\n" "$*"; }

log "${GREEN}==========================================${RESET}"
log "${GREEN} Mock HEC started. Listening on :${PORT}${RESET}"
log "${GREEN}==========================================${RESET}"

# 心跳：確保你就算沒流量也能在 kubectl logs 看到輸出
( while true; do log "${CYAN}[heartbeat]${RESET} waiting on :${PORT}"; sleep 30; done ) &

# 相容不同 nc 參數（有的 BusyBox nc 不支援 -p）
nc_listen() {
  if nc -h 2>&1 | grep -q -- ' -p '; then
    nc -l -p "$PORT"
  else
    nc -l "$PORT"
  fi
}

while true; do
  COUNTER=$((COUNTER + 1))
  TS="$(date)"
  REQ_FILE="/tmp/request-${COUNTER}.txt"
  FIFO_IN="/tmp/in-${COUNTER}.fifo"
  FIFO_OUT="/tmp/out-${COUNTER}.fifo"

  rm -f "$REQ_FILE" "$FIFO_IN" "$FIFO_OUT" 2>/dev/null || true
  mkfifo "$FIFO_IN" "$FIFO_OUT"

  # 啟動 nc：client -> FIFO_IN；FIFO_OUT -> client
  # shellcheck disable=SC2094
  nc_listen < "$FIFO_OUT" > "$FIFO_IN" &
  NC_PID=$!

  # 背景把收到的 request 存檔（同時也避免阻塞）
  cat "$FIFO_IN" > "$REQ_FILE" &
  CAT_PID=$!

  # 立刻回應（避免 client 等不到 response）
  {
    printf "HTTP/1.1 200 OK\r\n"
    printf "Content-Type: application/json\r\n"
    printf "Connection: close\r\n"
    printf "\r\n"
    printf '{"text":"Success","code":0}\n'
  } > "$FIFO_OUT" || true

  # 等連線結束
  wait "$NC_PID" 2>/dev/null || true
  kill "$CAT_PID" 2>/dev/null || true
  wait "$CAT_PID" 2>/dev/null || true

  log ""
  log "${YELLOW}==========================================${RESET}"
  log "${YELLOW}Request #${COUNTER} at ${TS}${RESET}"
  log "${YELLOW}==========================================${RESET}"
  log "${CYAN}---- RAW REQUEST (headers + body) ----${RESET}"
  cat "$REQ_FILE" 2>/dev/null || true
  echo ""
  log "${RESET}${YELLOW}==========================================${RESET}"
  rm -f "$REQ_FILE" "$FIFO_IN" "$FIFO_OUT" 2>/dev/null || true
done
EOF

CMD ["/bin/sh", "/mock-hec.sh"]

```

### 來源

- 連結：
  - [https://docs.fluentbit.io/manual/data-pipeline/outputs/output_formats](https://docs.fluentbit.io/manual/data-pipeline/outputs/output_formats)

- 截圖／檔案：

### 關鍵字（你之後會怎麼找回來？）

-

---

## 🧹 整理區（有空才做）

### 這段片段可以變成什麼？

- 可重做的步驟（操作指南）

- 可重用的 code（程式片段）

- 一句話理解（概念）

### 下一次要做的最小整理

- [ ] 補一句摘要

- [ ] 加 1–3 個 Tag

- [ ] 設定重要度

- [ ] 決定要不要勾精選
