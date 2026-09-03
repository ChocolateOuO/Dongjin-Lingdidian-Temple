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

公告、廟史、行事曆等文字內容，可由管理員以 Google 帳號登入後直接在網頁上編輯（詳見 `src/assets/js/admin.js` 說明）。管理員名單在 `admin.js` 的 `ADMIN_EMAILS`。

## 內容原則

廟史／分靈相關敘述請務必依東港祖廟記載，勿採坊間版本。重點：東港靈帝殿為**祖廟**，與台南安平靈濟殿**無任何淵源**；高雄林園中芸靈帝殿係**分靈自東港**。
