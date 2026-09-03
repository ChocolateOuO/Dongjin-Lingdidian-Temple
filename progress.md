# 改版進度（東津代天府靈帝殿官網）

> 給下次接手的人／AI：這份檔記錄目前執行到哪。分支 `rebuild/site`，已 push。
> 相關背景在 `~/.claude/projects/.../memory/`（temple-site-rebuild / temple-lineage-facts /
> temple-site-original-cms / working-preferences）。

最後更新：2026-09-03

---

## 專案現況

- **架構**：Eleventy 3 多頁靜態站。原 `index.html` 已拆解，來源在 `src/`，輸出 `_site/`。
- **分支**：`rebuild/site`（off `main`）。`main` 仍是舊版單檔站。
- **部署**：正式站 Render `https://dongjin-lingdidian-temple.onrender.com`（canonical）。
  - `render.yaml` 已寫好（build: `npm ci && npx @11ty/eleventy`，publish: `_site`）。
  - `.github/workflows/pages.yml`（push main 觸發 GitHub Pages）。
  - **⚠️ 尚未做**：把 Render 服務的 branch 指到 `rebuild/site`，或把此分支合併回 `main`。
    在那之前 Render 上看到的還是舊站。
- 指令：`npm run dev`（本機預覽 8080）／`npm run build`。

## 目錄重點

```
src/_data/        site.js, deities.json, events.json, faq.json, fortuneSticks.json, gallery.json
src/_includes/    layouts/(base,post,stub).njk  partials/(nav,footer,intro-gate,admin-bar).njk
src/assets/css/   main.css(全站) + about/events/faq/fortune/gallery/home/journal/visit.css
src/assets/js/    site.js admin.js lunar.js fortune.js gallery.js events.js faq.js blessings.js home.js
src/assets/img/   deities/*.webp  gallery/*.webp(+thumb)  hero-deity.webp
src/assets/icons/ favicon.svg, favicon-32.png, apple-touch-icon.png, og-image.(png|jpg), site.webmanifest
src/journal/      廟誌文章 .md（+ journal.11tydata.json）
firestore.rules   ← 需部署到 Firebase（見下）
_reference/       不進版控：舊站備份、來源大圖、QA 腳本、截圖
```

## QA 工具（`_reference/`，需 `MSYS_NO_PATHCONV=1` 跑帶路徑參數的）

- `node _reference/qa.mjs errors` — 全頁 console error / 失敗請求檢查
- `node _reference/qa.mjs shots` — 全頁桌機+手機截圖到 `_reference/shots/`
- `MSYS_NO_PATHCONV=1 node _reference/qa.mjs focus /about/ 4200` — 單點截圖
- `node _reference/test-fortune.mjs` — 求籤流程互動測試
- `node _reference/optimize-seed-images.mjs` — 來源大圖壓成 webp（來源在 `_reference/source-photos/`）
- `node _reference/make-og.mjs` — 產生 OG 圖與 favicon 光柵版

---

## 已完成（milestone commits，皆在 rebuild/site）

- **M1** — Eleventy 骨架、base 版型（per-page SEO/OG/canonical、PlaceOfWorship JSON-LD、
  skip-link）、nav/footer/開場廟門/管理列 partial 化、`site.js` 拆出、首頁/廟史/故事/參拜
  1:1 遷移、events/gallery/fortune/faq 暫掛 stub、**修開場廟門 assets/*.jpg 404**、
  sitemap/robots/404/webmanifest、Render+Pages 設定。
- **M2** — JS 全模組化（admin/lunar/fortune），firebase 依 `firebase:` 旗標載入，
  線上求籤頁完整遷移（實測整條流程通過）。
- **M3** — 照片庫改線上上傳：**修 base64 撐爆 Firestore bug**，改 Cloudinary 存網址；
  9 張內建照片（sharp 壓 webp，2.5MB）；移除 repo 內 14MB 原圖；修 `.admin-only` 被
  行內 style 覆蓋的問題。
- **M5-1** — 祭典行事曆頁（events.njk/js/css/json，Firestore `events-list` kv，類型色碼）。
- **M5-2** — 常見問題頁（faq.njk/js/css/json，手風琴）；廟史頁擴充：沿革年表、
  神尊圖鑑（deities.json 資料驅動）、分靈廟與交陪境；澄清獨立為 edit-c6；
  edit-c4 版本升 2。
- **M5-3** — 完整六十甲子籤（fortuneSticks.json：詩/吉凶/聖意/解曰/白話/八項分述，
  標「待廟方校訂」）+ 籤號查詢。
- **M5-4** — 首頁「今日籤運」（依日期固定選籤）+ 祈福留言牆（blessings.js，Firestore
  `blessings` collection，訪客送出 pending → 管理員審核）+ `firestore.rules`。
- **M5-5** — 參拜頁「如何前往」（開車/客運/火車）+ 街景連結 + 社群連結區；
  廟誌文史專欄（journal 集合 + 首篇「開欄的話」）；頁尾加廟誌連結 + footer-social。
- **M4/M5-6**（**尚未 commit，工作區有變更**）— OG 分享圖 + favicon 光柵版 + base.njk
  補 og:image/twitter:image/JSON-LD image/icon；FAQ 頁 FAQPage JSON-LD；sitemap 納 /journal/；
  **日間／夜間模式**（頁尾切換鈕、data-theme=night token 覆蓋、首屏無閃爍、localStorage）。

全 9 主要頁 + 廟誌：目前 0 JS 錯誤、0 失敗請求。

---

## 待辦（下次從這裡繼續）

### 立即
1. **commit 目前工作區的 M4/M5-6 變更**（OG 圖 / 夜間模式 / FAQ JSON-LD / sitemap）。
2. `node _reference/qa.mjs shots` 後逐頁看截圖，修視覺瑕疵。

### 需要廟方／使用者提供才能完成
- **Cloudinary**：免費帳號的 `cloudName` + unsigned `uploadPreset` → 填 `src/_data/site.js`
  的 `cloudinary`。填之前照片庫可瀏覽、不能上傳新照片。
- **部署 `firestore.rules`** 到 Firebase 主控台（否則祈福留言牆讀寫會被擋，目前優雅降級為
  「整備中」）。
- **FB／LINE 官方連結**（待與廟方合作）→ 填 `src/_data/site.js` 的 `social`，
  頁尾與參拜頁的社群區塊會自動出現。
- **各神尊聖誕農曆日期**、更好的神尊照片、遶境路線圖素材。
- **籤詩內容校訂**（目前為通行版本）。

### 尚未做的功能（規劃清單 ②–⑭ 內）
- **遶境路線圖**（⑦）：待素材，可先在 events 或 about 放圖片版。
- 照片庫**影片支援**（⑩ 的影片部分；分類已做）。
- **環景導覽**（⑪）：目前只放 Google 街景「連結」，未嵌 360 環景。
- 其餘 ②–⑭ 已大致涵蓋（年表、完整籤詩+查詢、神尊圖鑑、FAQ、分靈廟、留言牆、
  每日一籤、FB/LINE 連結位、廟誌、日夜模式）。

### 收尾
- README 更新（補新功能與「廟方維護」說明——Cloudinary、firestore.rules、social、
  神尊/行事曆資料檔位置）。
- 無障礙細查：燈箱焦點鎖定已做基本版；再查 tab 順序、對比、`aria`。
- Lighthouse。
- 清 `_reference` 內暫用腳本命名、確認 `.gitignore` 完整。
- 全部確認後：合併 `rebuild/site` → `main`（或請使用者把 Render branch 切過去先驗收）。
- 舊 `main` 的單檔 `index.html` 內容已在 `_reference/index.legacy.html` 備份，git 歷史也有。
