/* faq.js — 常見問題手風琴（可多開） */
(function () {
  "use strict";
  document.querySelectorAll(".faq-item .faq-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      btn.closest(".faq-item").classList.toggle("open", !open);
    });
  });
})();
