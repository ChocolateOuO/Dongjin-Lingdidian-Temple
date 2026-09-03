/* home.js — 首頁「今日籤運」：依日期固定選一支籤（同一天結果不變）。 */
(function () {
  "use strict";
  const box = document.getElementById("dailyFortune");
  const data = window.__FORTUNE_STICKS__;
  if (!box || !data || !data.sticks || !data.sticks.length) return;

  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  const seed = now.getFullYear() * 1000 + dayOfYear;
  const stick = data.sticks[seed % data.sticks.length];

  document.getElementById("dfNo").textContent = "第 " + stick.no + " 籤　" + stick.gz;
  const lv = document.getElementById("dfLevel");
  lv.textContent = stick.level + "籤";
  lv.className = "level-badge level-" + stick.level;
  document.getElementById("dfPoem").innerHTML = stick.poem.map((l) => "<span>" + l + "</span>").join("");
  document.getElementById("dfHoly").textContent = stick.holy || stick.plain || "";
})();
