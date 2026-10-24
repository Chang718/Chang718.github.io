(() => {
  "use strict";

  const root = document.documentElement;
  const storageKey = "chang-theme";
  let savedTheme = null;

  // 存储被浏览器禁用时，主题切换仍可在当前页面使用。
  try {
    savedTheme = localStorage.getItem(storageKey);
  } catch {
    // 私密模式或本地文件环境可能限制 localStorage。
  }
  root.dataset.theme = savedTheme === "dark" ? "dark" : "light";

  document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.querySelector(".theme-toggle");
    const themeLabel = document.querySelector(".theme-label");
    const themeColor = document.querySelector('meta[name="theme-color"]');

    function updateThemeControls() {
      const isDark = root.dataset.theme === "dark";
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
      themeLabel.textContent = isDark ? "Light theme" : "Dark theme";
      themeColor.setAttribute("content", isDark ? "#171d23" : "#f8f7f4");
    }

    updateThemeControls();
    themeToggle.hidden = false;
    themeToggle.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(storageKey, root.dataset.theme);
      } catch {
        // 保存失败不影响当前页面切换。
      }
      updateThemeControls();
    });

    const sections = [...document.querySelectorAll("main > section[id]")];
    const navLinks = [...document.querySelectorAll(".section-nav .nav-link")];

    function markSection(id) {
      for (const link of navLinks) {
        if (link.hash === `#${id}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      }
    }

    function updateCurrentSection() {
      const readingLine = Math.min(window.innerHeight * 0.25, 180);
      let current = sections[0];
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= readingLine) current = section;
      }
      // 页面末尾最后一个区块可能无法到达顶部阅读线。
      const atBottom = window.scrollY + window.innerHeight >= root.scrollHeight - 4;
      if (atBottom) current = sections[sections.length - 1];
      markSection(current.id);
    }

    let scrollScheduled = false;
    function scheduleSectionUpdate() {
      if (scrollScheduled) return;
      scrollScheduled = true;
      requestAnimationFrame(() => {
        updateCurrentSection();
        scrollScheduled = false;
      });
    }

    // 保留原生锚点行为，支持键盘、直接链接以及浏览器前进/后退。
    window.addEventListener("scroll", scheduleSectionUpdate, { passive: true });
    window.addEventListener("resize", scheduleSectionUpdate);
    window.addEventListener("hashchange", scheduleSectionUpdate);
    window.addEventListener("load", scheduleSectionUpdate, { once: true });
    updateCurrentSection();

    document.querySelector("#copyright-year").textContent = String(new Date().getFullYear());
  });
})();
