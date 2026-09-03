export default {
  name: "東津代天府靈帝殿",
  shortName: "靈帝殿",
  title: "東津代天府靈帝殿｜官方網站",
  description:
    "屏東縣東港鎮盛漁里 東津代天府靈帝殿，主祀代天巡狩何府大千歲，開基二百餘年，東港迎王班頭制度發源地。",
  // Canonical production URL (Render). Used for <link rel=canonical>, OG, sitemap.
  url: "https://dongjin-lingdidian-temple.onrender.com",
  locale: "zh-Hant-TW",
  contact: {
    address: "928 屏東縣東港鎮盛漁里興漁街1號",
    addressShort: "屏東縣東港鎮盛漁里",
    phone: "08-8335469",
    phoneNote: "請於晚上 7 點後來電",
    hours: "每日 06:00 – 21:00（農曆初一、十五延長開放）",
    geo: { lat: 22.4699, lng: 120.4515 },
    org: "東津代天府靈帝殿管理委員會",
  },
  social: {
    // 尚未與廟方 FB 合作，暫時留空；日後填入官方連結
    facebook: "",
    line: "",
  },
  // 照片庫線上上傳用。到 cloudinary.com 開免費帳號後填入：
  //   cloudName：Dashboard 右上角的 Cloud name
  //   uploadPreset：Settings > Upload > Upload presets 新增一個 Unsigned preset，
  //                 建議 Folder 設為 gallery、開啟 Auto-moderation 更保險
  // 留空時，照片庫仍可瀏覽，但「上傳照片」會顯示「尚未設定圖床」。
  cloudinary: {
    cloudName: "",
    uploadPreset: "",
  },
  nav: [
    { href: "/", label: "首頁", glyph: "殿" },
    { href: "/about/", label: "廟史與神尊", glyph: "史" },
    { href: "/stories/", label: "靈帝殿故事", glyph: "事" },
    { href: "/events/", label: "祭典行事曆", glyph: "曆" },
    { href: "/visit/", label: "參拜資訊", glyph: "拜" },
    { href: "/gallery/", label: "活動照片庫", glyph: "影" },
    { href: "/fortune/", label: "線上求籤", glyph: "籤" },
    { href: "/faq/", label: "常見問題", glyph: "問" },
  ],
};
