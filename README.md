# HugoMods Docker Image Guide (debian-nightly-non-root)
Using image: `hugomods/hugo:debian-nightly-non-root`

---

## Concept (English)

This image is a **nightly** Hugo build running as a **non-root** user by default (user: `hugo`). Nightly means you get the newest Hugo changes, but it can break unexpectedly.

The container entrypoint supports a handy rule:
- If the first argument you pass is **not** a system command inside the container, it will be treated as a **Hugo subcommand**.
  - Example: `docker run ... server` is the same as `docker run ... hugo server`. :contentReference[oaicite:0]{index=0}

Also note:
- Tags containing `non-root` run as the `hugo` user by default. :contentReference[oaicite:1]{index=1}
- Since HugoMods images `0.136.2`, the default command is `hugo help` and exits. :contentReference[oaicite:2]{index=2}
- Since `0.137.0`, `hugo server` binds `0.0.0.0` by default (so it’s accessible from outside the container). :contentReference[oaicite:3]{index=3}

---

## 概念（繁體中文）

這個 image 是 **Hugo nightly** 版本，並且預設使用 **非 root** 使用者（`hugo`）執行。Nightly 的好處是功能最新，但缺點是有機率遇到不穩定或行為變更。

它的 entrypoint 有個很方便的規則：
- 你傳進去的第一個參數如果不是容器裡的系統指令，就會被當成 **Hugo 子命令**。
  - 例如：`docker run ... server` 等同於 `docker run ... hugo server`。 :contentReference[oaicite:4]{index=4}

另外：
- Tag 名稱含 `non-root` 的，預設 user 是 `hugo`。 :contentReference[oaicite:5]{index=5}
- `0.136.2` 起預設指令是 `hugo help` 會印出 help 然後結束。 :contentReference[oaicite:6]{index=6}
- `0.137.0` 起 `hugo server` 預設會綁 `0.0.0.0`，容器外可直接存取。 :contentReference[oaicite:7]{index=7}

---

# 1) Quick Start (Dev Server / Live Reload)

## English

### 1.1 Run Hugo server (mount current folder as site)
```powershell
docker pull hugomods/hugo:debian-nightly-non-root
# -D 顯示 draft 草稿文章
# -F 顯示 future post
# 每300ms 檢查一次(Hot reload)
docker run --rm -it  -p 1313:1313 -v "${PWD}:/src" -w /src `
  hugomods/hugo:debian-nightly-non-root `
  server -D --baseURL http://localhost:1313/  --disableFastRender  --poll 300ms