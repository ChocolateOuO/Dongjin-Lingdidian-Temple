/* ==================================================================
   gallery.js — 活動照片庫
   - 內建（seed）照片：來自建置時的 gallery.json，常設、前台不可刪
   - 廟方上傳照片：影像上傳到 Cloudinary（免費圖床），只把「網址 + 標題
     + 分類」存進 Firestore（沿用 admin.js 的 storeGet/storeSet，key 為
     gallery-photos-<年份>）。因為只存網址，不會有 base64 撐爆 Firestore
     單筆 1MB 的問題。
   - 需要 admin.js（storeGet/storeSet/isAdmin）與 site.js（openLightbox）。
   ================================================================== */
(function () {
  "use strict";
  const grid = document.getElementById("photoGrid");
  if (!grid) return;

  const SEED = (window.__GALLERY_SEED__ || { photos: [], categories: [] });
  const CLOUD = window.__CLOUDINARY__ || { cloudName: "", uploadPreset: "" };
  const cloudReady = !!(CLOUD.cloudName && CLOUD.uploadPreset);

  const yearSelect = document.getElementById("yearSelect");
  const catBar = document.getElementById("catBar");
  const statusEl = document.getElementById("galleryStatus");
  const emptyEl = document.getElementById("emptyState");
  const uploadBtn = document.getElementById("uploadBtn");
  const fileInput = document.getElementById("fileInput");
  const catSelect = document.getElementById("uploadCatSelect");
  const newYearInput = document.getElementById("newYearInput");
  const addYearBtn = document.getElementById("addYearBtn");

  const YEARS_KEY = "gallery-years";
  const photoKey = (y) => "gallery-photos-" + y;
  const seedByYear = (y) => SEED.photos.filter((p) => p.year === y);
  const seedUrl = (src) => "/assets/img/gallery/" + src + ".webp";
  const seedThumb = (src) => "/assets/img/gallery/" + src + "-thumb.webp";

  let state = { year: null, cat: "全部", cloudPhotos: [] };

  function allYears(cloudYears) {
    const s = new Set([...SEED.photos.map((p) => p.year), ...cloudYears]);
    return [...s].sort((a, b) => b.localeCompare(a));
  }

  async function getCloudYears() {
    const raw = await window.storeGet(YEARS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  async function init() {
    statusEl.textContent = "載入中…";
    const cloudYears = await getCloudYears();
    const years = allYears(cloudYears);
    if (years.length === 0) years.push(String(new Date().getFullYear()));

    yearSelect.innerHTML =
      '<option value="全部">全部年份</option>' +
      years.map((y) => `<option value="${y}">${y} 年</option>`).join("");
    state.year = "全部";
    yearSelect.value = "全部";
    yearSelect.onchange = () => {
      state.year = yearSelect.value;
      render();
    };

    const cats = ["全部", ...(SEED.categories || [])];
    catBar.innerHTML = cats
      .map(
        (c) =>
          `<button type="button" class="cat-chip${c === "全部" ? " active" : ""}" data-cat="${c}">${c}</button>`
      )
      .join("");
    catBar.querySelectorAll(".cat-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        catBar.querySelectorAll(".cat-chip").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.cat = btn.dataset.cat;
        render();
      });
    });

    if (catSelect) catSelect.innerHTML = (SEED.categories || []).map((c) => `<option>${c}</option>`).join("");

    await render();
  }

  async function loadCloudPhotos() {
    const cloudYears = await getCloudYears();
    const targetYears = state.year === "全部" ? cloudYears : [state.year];
    const out = [];
    for (const y of targetYears) {
      const raw = await window.storeGet(photoKey(y));
      if (!raw) continue;
      try {
        JSON.parse(raw).forEach((p) => out.push({ ...p, year: y, __cloud: true }));
      } catch (e) {}
    }
    return out;
  }

  async function render() {
    statusEl.textContent = "載入照片中…";
    const cloud = await loadCloudPhotos();
    let seed = state.year === "全部" ? SEED.photos.slice() : seedByYear(state.year);

    let items = [
      ...seed.map((p) => ({
        id: p.id,
        full: seedUrl(p.src),
        thumb: seedThumb(p.src),
        caption: p.caption || "",
        category: p.category || "其他",
        year: p.year,
        seed: true,
      })),
      ...cloud.map((p) => ({
        id: p.id,
        full: p.url,
        thumb: p.thumb || p.url,
        caption: p.caption || "",
        category: p.category || "其他",
        year: p.year,
        seed: false,
      })),
    ];
    if (state.cat !== "全部") items = items.filter((p) => p.category === state.cat);
    items.sort((a, b) => (b.year || "").localeCompare(a.year || ""));

    grid.innerHTML = "";
    items.forEach((p) => {
      const card = document.createElement("div");
      card.className = "photo-card";
      const cap = (p.caption || p.year + " 年活動照片").replace(/"/g, "&quot;");
      card.innerHTML =
        `<img src="${p.thumb}" alt="${cap}" loading="lazy" ` +
        `onclick="openLightbox('${p.full.replace(/'/g, "\\'")}','${cap.replace(/'/g, "\\'")}')">` +
        `<div class="cap">${cap}</div>` +
        (window.isAdmin && !p.seed
          ? `<button class="del" type="button" title="刪除" data-id="${p.id}" data-year="${p.year}">✕</button>`
          : "");
      grid.appendChild(card);
    });
    grid.querySelectorAll(".del").forEach((b) => {
      b.addEventListener("click", () => deletePhoto(b.dataset.year, b.dataset.id));
    });

    statusEl.textContent = items.length ? `共 ${items.length} 張照片` : "";
    emptyEl.style.display = items.length ? "none" : "block";
  }

  /* ---------------- 上傳（管理員） ---------------- */
  function resizeToBlob(file, maxDim = 1600, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let w = img.width,
            h = img.height;
          if (w > h && w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob 失敗"))), "image/jpeg", quality);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function uploadToCloudinary(blob) {
    const fd = new FormData();
    fd.append("file", blob);
    fd.append("upload_preset", CLOUD.uploadPreset);
    fd.append("folder", "gallery");
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD.cloudName}/image/upload`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) throw new Error("Cloudinary 上傳失敗 " + res.status);
    const j = await res.json();
    const base = j.secure_url;
    const thumb = base.replace("/upload/", "/upload/c_fill,w_480,h_360,q_auto,f_auto/");
    const full = base.replace("/upload/", "/upload/w_1600,q_auto,f_auto/");
    return { id: j.public_id, url: full, thumb };
  }

  async function handleFiles(files) {
    if (!cloudReady) {
      alert("尚未設定圖床（Cloudinary）。請依 README 在 src/_data/site.js 填入 cloudName 與 uploadPreset 後再上傳。");
      return;
    }
    if (state.year === "全部") {
      alert("請先在上方選擇要歸入的年份（或用「新增年份」建立）。");
      return;
    }
    const cat = catSelect ? catSelect.value : "其他";
    statusEl.textContent = `上傳中 0/${files.length}…`;
    const raw = await window.storeGet(photoKey(state.year));
    const list = raw ? JSON.parse(raw) : [];
    let done = 0;
    for (const file of files) {
      try {
        const blob = await resizeToBlob(file);
        const up = await uploadToCloudinary(blob);
        list.push({ ...up, caption: "", category: cat, uploadedAt: Date.now() });
        done++;
        statusEl.textContent = `上傳中 ${done}/${files.length}…`;
      } catch (err) {
        console.error(err);
        statusEl.textContent = "部分照片上傳失敗：" + err.message;
      }
    }
    const cloudYears = await getCloudYears();
    if (!cloudYears.includes(state.year)) {
      cloudYears.push(state.year);
      await window.storeSet(YEARS_KEY, JSON.stringify(cloudYears));
    }
    await window.storeSet(photoKey(state.year), JSON.stringify(list));
    await refreshYearsSelect();
    await render();
  }

  async function deletePhoto(year, id) {
    if (!confirm("確定要刪除這張照片嗎？（僅從網站移除，Cloudinary 原檔仍在）")) return;
    const raw = await window.storeGet(photoKey(year));
    let list = raw ? JSON.parse(raw) : [];
    list = list.filter((p) => p.id !== id);
    await window.storeSet(photoKey(year), JSON.stringify(list));
    await render();
  }

  async function refreshYearsSelect() {
    const cloudYears = await getCloudYears();
    const years = allYears(cloudYears);
    const cur = yearSelect.value;
    yearSelect.innerHTML =
      '<option value="全部">全部年份</option>' +
      years.map((y) => `<option value="${y}">${y} 年</option>`).join("");
    yearSelect.value = years.includes(cur) || cur === "全部" ? cur : "全部";
    state.year = yearSelect.value;
  }

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener("click", () => {
      if (!cloudReady) {
        alert("尚未設定圖床（Cloudinary），請見 README。");
        return;
      }
      fileInput.click();
    });
    fileInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      if (files.length) handleFiles(files);
      e.target.value = "";
    });
  }
  if (addYearBtn && newYearInput) {
    addYearBtn.addEventListener("click", async () => {
      const y = newYearInput.value.trim();
      if (!/^\d{3,4}$/.test(y)) {
        alert("請輸入正確年份，例如 2027");
        return;
      }
      const cloudYears = await getCloudYears();
      if (!cloudYears.includes(y)) {
        cloudYears.push(y);
        await window.storeSet(YEARS_KEY, JSON.stringify(cloudYears));
      }
      newYearInput.value = "";
      await refreshYearsSelect();
      yearSelect.value = y;
      state.year = y;
      await render();
    });
  }

  // 等 admin.js 的 storeGet 就緒（firebase compat 為 defer）
  function waitStore(tries = 0) {
    if (typeof window.storeGet === "function") return init();
    if (tries > 40) {
      statusEl.textContent = "無法連線資料庫，僅顯示內建照片。";
      // 仍以 seed 渲染
      window.storeGet = async () => null;
      window.storeSet = async () => false;
      return init();
    }
    setTimeout(() => waitStore(tries + 1), 100);
  }
  waitStore();

  // 登入狀態改變時（admin.js 會呼叫 window.loadPhotos）重新渲染以顯示刪除鈕
  window.onAdminStateChange = render;
})();
