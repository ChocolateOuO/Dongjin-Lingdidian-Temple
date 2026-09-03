/* ==================================================================
   site.js — 全站共用互動：導覽列、開場廟門、捲動顯現、回頂、
   故事手風琴、燈箱。無 Firebase 依賴。
   ================================================================== */
(function () {
  "use strict";
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- 行動版選單 ---------------- */
  const navList = document.getElementById("navList");
  const navToggle = document.getElementById("navToggle");
  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      const open = navList.classList.toggle("open");
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navList.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        navList.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------------- 頁尾年份 ---------------- */
  const fy = document.getElementById("footerYear");
  if (fy) fy.textContent = new Date().getFullYear();

  /* ---------------- 日間 / 夜間模式 ---------------- */
  (function initTheme() {
    const root = document.documentElement;
    let saved = null;
    try { saved = localStorage.getItem("temple-theme"); } catch (e) {}
    if (saved === "night") root.setAttribute("data-theme", "night");
    const btn = document.getElementById("themeToggle");
    function sync() {
      const night = root.getAttribute("data-theme") === "night";
      if (btn) btn.textContent = night ? "☀ 日間模式" : "☾ 夜間模式";
    }
    sync();
    if (btn) {
      btn.addEventListener("click", () => {
        const night = root.getAttribute("data-theme") === "night";
        if (night) root.removeAttribute("data-theme");
        else root.setAttribute("data-theme", "night");
        try { localStorage.setItem("temple-theme", night ? "day" : "night"); } catch (e) {}
        sync();
      });
    }
  })();

  /* ---------------- 全站小提示（toast） ---------------- */
  window.showToast = function (msg) {
    const t = document.getElementById("saveToast");
    if (!t) return;
    t.textContent = msg || "已儲存變更";
    t.classList.add("show");
    clearTimeout(window.showToast._t);
    window.showToast._t = setTimeout(() => t.classList.remove("show"), 2400);
  };

  /* ---------------- 故事手風琴 ---------------- */
  window.toggleStory = function (el) {
    const wasOpen = el.classList.contains("open");
    document.querySelectorAll(".story-card").forEach((c) => c.classList.remove("open"));
    if (!wasOpen) el.classList.add("open");
  };
  document.querySelectorAll(".story-card").forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.toggleStory(card);
      }
    });
  });

  /* ---------------- 燈箱 ---------------- */
  const lightbox = document.getElementById("lightbox");
  let lastFocused = null;
  window.openLightbox = function (src, cap) {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    const img = document.getElementById("lightboxImg");
    img.src = src;
    img.alt = cap || "";
    document.getElementById("lightboxCap").textContent = cap || "";
    lightbox.style.display = "flex";
    requestAnimationFrame(() => requestAnimationFrame(() => lightbox.classList.add("open")));
    const closeBtn = lightbox.querySelector(".close");
    if (closeBtn) closeBtn.focus();
  };
  window.closeLightbox = function () {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    setTimeout(() => {
      if (!lightbox.classList.contains("open")) lightbox.style.display = "";
    }, 300);
    if (lastFocused) lastFocused.focus();
  };
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target.id === "lightbox") window.closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") window.closeLightbox();
      // 焦點鎖在燈箱內（唯一可聚焦元素為關閉鈕）
      if (e.key === "Tab") {
        e.preventDefault();
        const closeBtn = lightbox.querySelector(".close");
        if (closeBtn) closeBtn.focus();
      }
    });
  }

  /* ---------------- 開場廟門 ---------------- */
  (function initIntroGate() {
    const gate = document.getElementById("introGate");
    if (!gate) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem("templeIntroSeen") === "1";
    } catch (e) {}
    if (prefersReduced || seen) {
      gate.remove();
      return;
    }
    document.documentElement.style.overflow = "hidden";
    let opened = false;
    let autoTimer = null;

    function openGate() {
      if (opened) return;
      opened = true;
      clearTimeout(autoTimer);
      gate.classList.remove("knocking");
      gate.classList.add("opening");
      setTimeout(() => {
        gate.classList.add("dismiss");
        setTimeout(() => {
          gate.remove();
          document.documentElement.style.overflow = "";
          try {
            sessionStorage.setItem("templeIntroSeen", "1");
          } catch (e) {}
        }, 650);
      }, 1200);
    }
    function knockThenOpen() {
      if (opened) return;
      gate.classList.add("knocking");
      setTimeout(() => {
        gate.classList.remove("knocking");
        openGate();
      }, 320);
    }
    gate.addEventListener("click", knockThenOpen);
    gate.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        knockThenOpen();
      }
    });
    autoTimer = setTimeout(openGate, 6000);
  })();

  /* ---------------- 捲動顯現 + 視差 + 回頂 ---------------- */
  const revealSelectors = [
    ".quick-card", ".deity-card", ".relic-item", ".story-card",
    ".notice-item", ".photo-card", ".fortune-card", "h2.title",
    ".info-grid > *", ".map-box", ".timeline-item", ".event-card", ".faq-item",
  ];
  const revealEls = document.querySelectorAll(revealSelectors.join(","));
  revealEls.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = prefersReduced ? "0s" : (Math.min(i % 6, 5) * 0.06) + "s";
  });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
    // 安全網：萬一 observer 未觸發（極端情況），數秒後強制顯示全部，避免內容永久隱形
    setTimeout(() => revealEls.forEach((el) => el.classList.add("in-view")), 1500);
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  if (!prefersReduced) {
    const heroWrap = document.querySelector(".hero-photo-wrap");
    const heroEl = document.querySelector(".hero");
    if (heroWrap && heroEl) {
      let ticking = false;
      window.addEventListener(
        "scroll",
        () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            const y = window.scrollY;
            if (y < heroEl.offsetHeight) heroWrap.style.transform = "translateY(" + y * 0.12 + "px)";
            ticking = false;
          });
        },
        { passive: true }
      );
    }
  }

  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    window.addEventListener(
      "scroll",
      () => backToTop.classList.toggle("show", window.scrollY > 480),
      { passive: true }
    );
  }
})();
