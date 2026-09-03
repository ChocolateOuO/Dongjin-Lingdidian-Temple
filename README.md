# 東津代天府靈帝殿 官方網站

屏東縣東港鎮盛漁里　東津代天府靈帝殿。以 [Eleventy](https://www.11ty.dev/) 建置的靜態多頁網站。

- 正式站（Render）：https://dongjin-lingdidian-temple.onrender.com
- 原始碼：https://github.com/ChocolateOuO/Dongjin-Lingdidian-Temple

## 開發

```bash
npm install
npm run dev      # http://localhost:8080 即時預覽
npm run build    # 產生 _site/
```

需要 Node.js 18 以上。

## 目錄結構

```
src/
├── _data/site.js        全站設定（站名、網址、導覽、聯絡資訊）
├── _data/*.json         內容資料（神尊、行事曆、籤詩…）
├── _includes/
│   ├── layouts/         base / stub 版型
│   └── partials/        nav / footer / 開場廟門 / 管理列
├── assets/
│   ├── css/main.css     全站樣式
│   ├── css/*.css        各頁專屬樣式
│   ├── js/site.js       全站共用互動
│   └── js/*.js          各功能模組
├── static/              直接複製到網站根目錄的檔案（robots.txt…）
└── *.njk                各分頁
images/                  廟方照片（直接複製到 /images）
_reference/              （不進版控）舊版備份、視覺驗證截圖工具
```

## 部署

- **Render**（正式站）：`render.yaml` 已設定；build＝`npm ci && npx @11ty/eleventy`，publish＝`_site`。
- **GitHub Pages**（備援）：`.github/workflows/pages.yml`，push 到 `main` 自動部署。
- 每頁 `<link rel="canonical">` 指向 Render 網址。

## 廟方內容維護

### 網頁上直接編輯（免改程式）

公告、廟史、行事曆、常見問題等文字內容，管理員以 Google 帳號登入後可直接在網頁上編輯，存入 Firestore。管理員名單在 `src/assets/js/admin.js` 的 `ADMIN_EMAILS`。
祈福留言牆由訪客送出，先進 `pending` 狀態，管理員在留言牆上審核後才公開。

### 需要改資料檔（`src/_data/`，改完 `npm run build` 或推到 Render 會自動重建）

| 檔案 | 內容 |
| --- | --- |
| `site.js` | 站名、網址、電話、開放時間、導覽列、社群連結、Cloudinary 設定 |
| `deities.json` | 神尊圖鑑（名號、聖誕、簡介、照片檔名） |
| `events.json` | 祭典行事曆預設項目 |
| `faq.json` | 常見問題 |
| `fortuneSticks.json` | 六十甲子籤內容（目前為通行版本，待廟方校訂） |
| `gallery.json` | 照片庫內建照片 |

### 廟誌文章

在 `src/journal/` 新增一個 `.md`，開頭 front matter 需有 `title`、`date`、`excerpt`，其餘為內文。檔名即網址 slug。

### 待廟方／使用者提供才能啟用的項目

- **Cloudinary**（照片庫上傳）：到 cloudinary.com 開免費帳號，把 `cloudName` 與一組 unsigned `uploadPreset` 填入 `site.js` 的 `cloudinary`。未填時照片庫仍可瀏覽，只是不能上傳新照片。
- **部署 `firestore.rules`**：到 Firebase 主控台 → Firestore → 規則，貼上本專案根目錄的 `firestore.rules` 並發布。未部署時祈福留言牆讀寫會被擋，頁面會優雅降級為「整備中」。
- **FB／LINE 官方連結**：填入 `site.js` 的 `social.facebook` / `social.line`，頁尾與參拜頁的社群區塊會自動出現。

## 內容原則

廟史／分靈相關敘述請務必依東港祖廟記載，勿採坊間版本。重點：東港靈帝殿為**祖廟**，與台南安平靈濟殿**無任何淵源**；高雄林園中芸靈帝殿係**分靈自東港**。
