(() => {
  const root = document.documentElement;
  const buttons = document.querySelectorAll("[data-set-lang]");
  const validLanguages = new Set(["en", "zh"]);

  function readSavedLanguage() {
    try {
      return localStorage.getItem("siteLang");
    } catch (error) {
      return null;
    }
  }

  function saveLanguage(language) {
    try {
      localStorage.setItem("siteLang", language);
    } catch (error) {
      // Ignore storage access failures and keep the page functional.
    }
  }

  function detectLanguage() {
    const saved = readSavedLanguage();
    if (validLanguages.has(saved)) {
      return saved;
    }

    const browserLanguage = (navigator.language || "").toLowerCase();
    return browserLanguage.startsWith("zh") ? "zh" : "en";
  }

  function applyLanguage(language) {
    if (!validLanguages.has(language)) {
      return;
    }

    root.dataset.lang = language;
    root.lang = language === "zh" ? "zh-CN" : "en";

    buttons.forEach((button) => {
      const active = button.dataset.setLang === language;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const language = button.dataset.setLang;
      if (!validLanguages.has(language)) {
        return;
      }

      saveLanguage(language);
      applyLanguage(language);
    });
  });

  applyLanguage(detectLanguage());
})();
