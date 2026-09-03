/* ==================================================================
   admin.js — 廟方管理員登入（Google）＋ 網頁可編輯區塊
   需先載入 firebase-*-compat（見 base.njk 的 firebase 旗標）。

   可編輯區塊系統：凡 HTML 帶 [data-editable-region="1"] 的容器，
   管理員登入後按「開始編輯內容」即可直接改字，按「儲存變更」寫入
   Firestore（collection: kv），所有訪客下次載入都會看到最新版本。

   版本比對：容器上的 data-content-version="N"。存檔時連版本號一起存；
   載入時只有「雲端版本 == 目前程式碼版本」才套用雲端內容——工程師
   改了原始碼並調高版本號時，就會蓋過管理員舊存檔。管理員重新存檔
   一次即取回主導權。沒標版本號的區塊一律視為 "0"。
   ================================================================== */
(function () {
  "use strict";
  if (typeof firebase === "undefined") {
    console.warn("[admin] firebase SDK 未載入，管理功能停用");
    return;
  }

  const firebaseConfig = {
    apiKey: "AIzaSyCrmeICqGaqXBSwwehvaIK04P7amdrs6jg",
    authDomain: "dongjin-lingdidian-temple.firebaseapp.com",
    projectId: "dongjin-lingdidian-temple",
    storageBucket: "dongjin-lingdidian-temple.firebasestorage.app",
    messagingSenderId: "748272381535",
    appId: "1:748272381535:web:8e0dc0d91cac70e608f5ea",
  };

  /* 管理員名單：廟方多位管理員時，把 Gmail 逐一加入即可，不需改其他程式碼。 */
  const ADMIN_EMAILS = [
    "llomoll5566@gmail.com",
    // "temple-admin-2@gmail.com",
  ];

  const CONTENT_KEY_PREFIX = "content-override:";

  window.ADMIN_EMAILS = ADMIN_EMAILS;

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  window.fbDb = db; // 供 blessings.js 等模組使用

  /* ---------------- 儲存層 ----------------
     1) window.storage：僅 Claude artifact 預覽環境
     2) Firestore（正式，所有訪客共用）
     3) localStorage：兩者皆無時的本機保底
  */
  const usingCloudStorage = typeof window.storage !== "undefined";
  function encodeKvId(key) {
    return key.replace(/\//g, "__");
  }

  window.storeGet = async function (key) {
    if (usingCloudStorage) {
      try {
        const res = await window.storage.get(key, true);
        return res ? res.value : null;
      } catch (e) {
        return null;
      }
    }
    try {
      const doc = await db.collection("kv").doc(encodeKvId(key)).get();
      return doc.exists ? doc.data().value : null;
    } catch (e) {
      console.warn("[Firestore] 讀取失敗，改用 localStorage", e);
    }
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  };

  window.storeSet = async function (key, value) {
    if (usingCloudStorage) {
      try {
        return !!(await window.storage.set(key, value, true));
      } catch (e) {
        return false;
      }
    }
    try {
      await db.collection("kv").doc(encodeKvId(key)).set({ value, updatedAt: Date.now() });
      return true;
    } catch (e) {
      console.warn("[Firestore] 寫入失敗（可能未登入管理員或被安全規則擋下）", e);
    }
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  };

  window.isAdmin = false;
  let isEditing = false;

  /* ---------------- Google 登入 / 登出 ---------------- */
  window.googleSignIn = function () {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch((err) => {
      console.error("[Auth] Google 登入失敗", err);
      alert("登入失敗，請再試一次：" + err.message);
    });
  };
  window.signOutUser = function () {
    if (isEditing) window.toggleEditMode();
    auth.signOut();
  };

  auth.onAuthStateChanged((user) => {
    const googleBtn = document.getElementById("googleLoginBtn");
    const chip = document.getElementById("userChip");
    const logoutBtn = document.getElementById("logoutBtn");
    if (user) {
      window.isAdmin = ADMIN_EMAILS.includes(user.email);
      if (googleBtn) googleBtn.hidden = true;
      if (chip) chip.hidden = false;
      if (logoutBtn) logoutBtn.hidden = false;
      const av = document.getElementById("userAvatar");
      if (av) av.src = user.photoURL || "";
      const nm = document.getElementById("userName");
      if (nm) nm.textContent = user.displayName || "使用者";
      const em = document.getElementById("userEmail");
      if (em) em.textContent = user.email || "";
      document.body.classList.toggle("admin-mode", window.isAdmin);
    } else {
      window.isAdmin = false;
      if (googleBtn) googleBtn.hidden = false;
      if (chip) chip.hidden = true;
      if (logoutBtn) logoutBtn.hidden = true;
      document.body.classList.remove("admin-mode");
    }
    if (typeof window.onAdminStateChange === "function") window.onAdminStateChange();
  });

  window.toggleEditMode = function () {
    isEditing = !isEditing;
    const btn = document.getElementById("editToggleBtn");
    const saveBtn = document.getElementById("saveBtn");
    const regions = document.querySelectorAll("[data-editable-region]");
    if (isEditing) {
      document.body.classList.add("admin-editing");
      regions.forEach((el) => el.setAttribute("contenteditable", "true"));
      if (btn) btn.textContent = "結束編輯（不儲存）";
      if (saveBtn) saveBtn.hidden = false;
    } else {
      document.body.classList.remove("admin-editing");
      regions.forEach((el) => el.removeAttribute("contenteditable"));
      if (btn) btn.textContent = "開始編輯內容";
      if (saveBtn) saveBtn.hidden = true;
    }
  };

  // 編輯文字時，避免點到卡片／連結觸發跳頁
  document.addEventListener(
    "click",
    function (e) {
      if (document.body.classList.contains("admin-editing")) {
        if (e.target.closest(".quick-card") || e.target.closest(".pill-btn") || e.target.closest(".story-card")) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    },
    true
  );

  window.saveAllEdits = async function () {
    const regions = document.querySelectorAll("[data-editable-region]");
    try {
      for (const el of regions) {
        const version = el.dataset.contentVersion || "0";
        await window.storeSet(CONTENT_KEY_PREFIX + el.id, JSON.stringify({ html: el.innerHTML, version }));
      }
      window.showToast("已儲存變更");
    } catch (e) {
      window.showToast("儲存失敗，請稍後再試");
    }
  };

  async function loadAllContentOverrides() {
    const regions = document.querySelectorAll("[data-editable-region]");
    for (const el of regions) {
      const raw = await window.storeGet(CONTENT_KEY_PREFIX + el.id);
      if (!raw) continue;
      const currentVersion = el.dataset.contentVersion || "0";
      let parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        /* 舊格式純字串 */
      }
      if (parsed && typeof parsed === "object" && "html" in parsed) {
        if (parsed.version === currentVersion) el.innerHTML = parsed.html;
      } else {
        el.innerHTML = raw;
      }
    }
    rebindNoticeDeleteButtons();
  }

  /* ---------------- 公告：新增 / 刪除 ---------------- */
  window.deleteNotice = function (btn) {
    if (!confirm("確定要刪除這則公告嗎？")) return;
    btn.closest(".notice-item").remove();
  };
  window.addNotice = function () {
    const row = document.querySelector(".notice-add-row");
    const date = row.querySelector("[name=nDate]").value.trim();
    const tag = row.querySelector("[name=nTag]").value;
    const text = row.querySelector("[name=nText]").value.trim();
    if (!date || !text) {
      alert("請輸入日期與公告內容");
      return;
    }
    const item = document.createElement("div");
    item.className = "notice-item";
    item.innerHTML =
      '<div class="date">' +
      date +
      '</div><div class="txt"><span class="notice-tag">' +
      tag +
      "</span>" +
      text.replace(/</g, "&lt;") +
      '</div><button class="notice-del" type="button" onclick="deleteNotice(this)">✕</button>';
    document.getElementById("noticeList").prepend(item);
    row.querySelector("[name=nDate]").value = "";
    row.querySelector("[name=nText]").value = "";
    window.showToast("已新增（記得按「儲存變更」才會保存）");
  };
  function rebindNoticeDeleteButtons() {
    document.querySelectorAll(".notice-del").forEach((b) => {
      b.onclick = () => window.deleteNotice(b);
    });
  }

  /* ---------------- 綁定浮動控制列按鈕 ---------------- */
  function bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
  }
  bind("googleLoginBtn", window.googleSignIn);
  bind("logoutBtn", window.signOutUser);
  bind("editToggleBtn", window.toggleEditMode);
  bind("saveBtn", window.saveAllEdits);

  loadAllContentOverrides();
})();
