/* ==================================================================
   blessings.js — 祈福留言牆
   訪客送出留言 → Firestore blessings（status: pending）→ 管理員審核後
   顯示於前台。需 admin.js（window.fbDb / window.isAdmin / firebase）。
   ================================================================== */
(function () {
  "use strict";
  const wall = document.getElementById("blessingWall");
  if (!wall) return;

  const form = document.getElementById("blessingForm");
  const statusEl = document.getElementById("blessingStatus");
  const pendingBox = document.getElementById("blessingPending");
  const MAX_NAME = 20, MAX_TEXT = 200;

  function db() { return window.fbDb; }
  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }
  function tsText(ts) {
    try {
      const d = ts && ts.toDate ? ts.toDate() : new Date();
      return d.getFullYear() + "." + (d.getMonth() + 1) + "." + d.getDate();
    } catch (e) { return ""; }
  }

  function card(b, admin) {
    const el = document.createElement("div");
    el.className = "blessing-card";
    el.innerHTML =
      `<p class="b-text">${esc(b.text)}</p>` +
      `<div class="b-foot"><span class="b-name">— ${esc(b.name || "無名氏")}</span><span class="b-date">${tsText(b.createdAt)}</span></div>` +
      (admin
        ? `<div class="b-admin">${b.status !== "approved" ? `<button type="button" data-act="approve" data-id="${b.id}" class="btn secondary">核准</button>` : ""}<button type="button" data-act="delete" data-id="${b.id}" class="btn danger">刪除</button></div>`
        : "");
    return el;
  }

  async function renderApproved() {
    if (!db()) { statusEl.textContent = "留言牆載入中…"; return; }
    try {
      const snap = await db().collection("blessings").where("status", "==", "approved").limit(60).get();
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      wall.innerHTML = "";
      if (!list.length) {
        wall.innerHTML = '<p class="blessing-empty">還沒有留言，成為第一個為家人祈福的人吧。</p>';
      } else {
        list.forEach((b) => wall.appendChild(card(b, false)));
      }
      statusEl.textContent = "";
    } catch (e) {
      console.warn(e);
      wall.innerHTML = '<p class="blessing-empty">留言牆整備中，歡迎先留下您的祈願。</p>';
      statusEl.textContent = "";
    }
  }

  async function renderPending() {
    if (!pendingBox || !window.isAdmin || !db()) { if (pendingBox) pendingBox.innerHTML = ""; return; }
    try {
      const snap = await db().collection("blessings").where("status", "==", "pending").limit(50).get();
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      pendingBox.innerHTML = list.length ? `<h4>待審核（${list.length}）</h4>` : "";
      list.forEach((b) => pendingBox.appendChild(card(b, true)));
      bindAdmin(pendingBox);
      bindAdmin(wall);
    } catch (e) { console.warn(e); }
  }

  function bindAdmin(root) {
    root.querySelectorAll(".b-admin button").forEach((btn) => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        if (btn.dataset.act === "approve") {
          await db().collection("blessings").doc(id).update({ status: "approved" });
        } else {
          if (!confirm("確定刪除這則留言？")) return;
          await db().collection("blessings").doc(id).delete();
        }
        await renderApproved();
        await renderPending();
      };
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = form.name.value.trim().slice(0, MAX_NAME);
      const text = form.text.value.trim().slice(0, MAX_TEXT);
      if (!text) { alert("請輸入祈福內容"); return; }
      if (!db()) { alert("目前無法送出，請稍後再試。"); return; }
      try {
        await db().collection("blessings").add({
          name: name || "無名氏",
          text,
          status: "pending",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        form.reset();
        statusEl.textContent = "已送出，經廟方確認後會顯示於留言牆，感謝您的誠心。";
      } catch (err) {
        console.warn(err);
        statusEl.textContent = "送出失敗，請稍後再試。";
      }
    });
  }

  function waitDb(t = 0) {
    if (db()) { renderApproved(); renderPending(); return; }
    if (t > 40) { statusEl.textContent = "留言牆暫時無法連線。"; return; }
    setTimeout(() => waitDb(t + 1), 100);
  }
  waitDb();

  const prev = window.onAdminStateChange;
  window.onAdminStateChange = function () {
    if (typeof prev === "function") prev();
    renderApproved();
    renderPending();
  };
})();
