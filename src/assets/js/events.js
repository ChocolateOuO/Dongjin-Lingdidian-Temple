/* ==================================================================
   events.js — 祭典行事曆
   內建種子（events.json）+ 廟方前台新增（存 kv，key: events-list）。
   需 admin.js（storeGet/storeSet/isAdmin）。
   ================================================================== */
(function () {
  "use strict";
  const listEl = document.getElementById("eventList");
  if (!listEl) return;

  const SEED = (window.__EVENTS_SEED__ || { items: [] }).items || [];
  const TYPES = ["迎王", "神誕", "法會", "遶境", "其他"];
  const KEY = "events-list";

  const form = document.getElementById("eventForm");
  const emptyEl = document.getElementById("eventEmpty");

  function fmtDate(ev) {
    if (ev.lunar) return ev.lunar;
    if (ev.solar) {
      const p = ev.solar.split("-");
      return p[0] + " 年" + (p[1] ? " " + Number(p[1]) + " 月" : "") + (p[2] ? " " + Number(p[2]) + " 日" : "");
    }
    return "日期待定";
  }

  function sortKey(ev) {
    // 一次性(有 solar)照日期；循環的排後面
    if (ev.solar) return "1_" + ev.solar;
    return "2_" + (ev.lunar || "");
  }

  async function getUserEvents() {
    const raw = await window.storeGet(KEY);
    return raw ? JSON.parse(raw) : [];
  }

  async function render() {
    const user = await getUserEvents();
    const all = [...SEED.map((e) => ({ ...e, seed: true })), ...user.map((e) => ({ ...e, seed: false }))];
    all.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

    listEl.innerHTML = "";
    all.forEach((ev) => {
      const el = document.createElement("article");
      el.className = "event-card type-" + (ev.type || "其他");
      el.innerHTML =
        `<div class="event-date">${fmtDate(ev)}</div>` +
        `<div class="event-body">` +
        `<div class="event-head"><span class="event-type">${ev.type || "其他"}</span>` +
        `<h3>${esc(ev.title)}</h3>` +
        (ev.recurring ? `<span class="event-recur">每年</span>` : "") +
        `</div>` +
        (ev.desc ? `<p>${esc(ev.desc)}</p>` : "") +
        (window.isAdmin && !ev.seed
          ? `<div class="event-admin"><button type="button" class="btn danger" data-id="${ev.id}">刪除</button></div>`
          : "") +
        `</div>`;
      listEl.appendChild(el);
    });
    listEl.querySelectorAll(".event-admin button").forEach((b) => {
      b.addEventListener("click", () => removeEvent(b.dataset.id));
    });
    emptyEl.style.display = all.length ? "none" : "block";
  }

  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  async function removeEvent(id) {
    if (!confirm("確定刪除這筆行事曆項目？")) return;
    let list = await getUserEvents();
    list = list.filter((e) => e.id !== id);
    await window.storeSet(KEY, JSON.stringify(list));
    render();
  }

  if (form) {
    form.querySelector('[name="type"]').innerHTML = TYPES.map((t) => `<option>${t}</option>`).join("");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const title = fd.get("title").trim();
      const dateStr = fd.get("date").trim();
      if (!title || !dateStr) {
        alert("請填標題與日期");
        return;
      }
      const isSolar = /^\d{4}(-\d{1,2}){0,2}$/.test(dateStr);
      const ev = {
        id: "e" + Date.now(),
        title,
        type: fd.get("type"),
        desc: fd.get("desc").trim(),
        recurring: fd.get("recurring") === "on",
      };
      if (isSolar) ev.solar = dateStr;
      else ev.lunar = dateStr;
      const list = await getUserEvents();
      list.push(ev);
      await window.storeSet(KEY, JSON.stringify(list));
      form.reset();
      window.showToast("已新增行事曆項目");
      render();
    });
  }

  function waitStore(t = 0) {
    if (typeof window.storeGet === "function") return render();
    if (t > 40) {
      window.storeGet = async () => null;
      window.storeSet = async () => false;
      return render();
    }
    setTimeout(() => waitStore(t + 1), 100);
  }
  waitStore();
  window.onAdminStateChange = render;
})();
