(() => {
  const root = document.documentElement;
  const body = document.body;
  const langButtons = Array.from(document.querySelectorAll("[data-set-lang]"));
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
  const spotlightItems = Array.from(document.querySelectorAll("[data-spotlight]"));
  const parallaxHero = document.querySelector("[data-parallax-hero]");
  const mobileMenuLinks = mobileMenu ? Array.from(mobileMenu.querySelectorAll("a")) : [];
  const validLanguages = new Set(["en", "zh"]);
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopNavQuery = window.matchMedia("(min-width: 901px)");
  const finePointerQuery = window.matchMedia("(pointer: fine)");
  let prefersReducedMotion = reduceMotionQuery.matches;

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
      // Keep the page functional even when storage is unavailable.
    }
  }

  function detectLanguage() {
    const savedLanguage = readSavedLanguage();
    if (validLanguages.has(savedLanguage)) {
      return savedLanguage;
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

    langButtons.forEach((button) => {
      const isActive = button.dataset.setLang === language;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function setScrollLock(isLocked) {
    body.classList.toggle("is-scroll-locked", isLocked);
  }

  function openMobileMenu() {
    if (!navToggle || !mobileMenu) {
      return;
    }

    mobileMenu.hidden = false;
    navToggle.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(() => {
      mobileMenu.classList.add("is-open");
    });
    setScrollLock(true);
  }

  function closeMobileMenu(options = {}) {
    if (!navToggle || !mobileMenu) {
      return;
    }

    const { restoreFocus = false } = options;
    mobileMenu.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    setScrollLock(false);

    window.setTimeout(() => {
      if (!mobileMenu.classList.contains("is-open")) {
        mobileMenu.hidden = true;
      }
    }, 240);

    if (restoreFocus) {
      navToggle.focus();
    }
  }

  function toggleMobileMenu() {
    if (!navToggle || !mobileMenu) {
      return;
    }

    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMobileMenu({ restoreFocus: true });
      return;
    }

    openMobileMenu();
  }

  function applyParallax() {
    if (!parallaxHero) {
      return;
    }

    if (prefersReducedMotion) {
      parallaxHero.style.setProperty("--hero-copy-translate", "0px");
      parallaxHero.style.setProperty("--hero-copy-scale", "1");
      parallaxHero.style.setProperty("--hero-copy-opacity", "1");
      parallaxHero.style.setProperty("--hero-panel-translate", "0px");
      return;
    }

    const distance = Math.max(window.innerHeight * 0.85, 1);
    const progress = Math.min(window.scrollY / distance, 1);
    parallaxHero.style.setProperty("--hero-copy-translate", `${progress * -6}px`);
    parallaxHero.style.setProperty("--hero-copy-scale", `${1 - progress * 0.01}`);
    parallaxHero.style.setProperty("--hero-copy-opacity", `${1 - progress * 0.1}`);
    parallaxHero.style.setProperty("--hero-panel-translate", `${progress * 8}px`);
  }

  function initializeReveal() {
    if (!revealItems.length) {
      return;
    }

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 24, 120)}ms`;
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => {
        item.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    revealItems.forEach((item) => {
      observer.observe(item);
    });
  }

  function initializeSpotlights() {
    if (!spotlightItems.length || !finePointerQuery.matches) {
      return;
    }

    spotlightItems.forEach((item) => {
      item.addEventListener("pointerenter", () => {
        item.classList.add("is-spotlight-active");
      });

      item.addEventListener("pointerleave", () => {
        item.classList.remove("is-spotlight-active");
      });

      item.addEventListener("pointermove", (event) => {
        const bounds = item.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        item.style.setProperty("--spotlight-x", `${x}px`);
        item.style.setProperty("--spotlight-y", `${y}px`);
      });
    });
  }

  langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const language = button.dataset.setLang;
      if (!validLanguages.has(language)) {
        return;
      }

      saveLanguage(language);
      applyLanguage(language);
    });
  });

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", toggleMobileMenu);

    mobileMenuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileMenu();
      });
    });

    document.addEventListener("click", (event) => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      if (!isOpen) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (navToggle.contains(target) || mobileMenu.contains(target)) {
        return;
      }

      closeMobileMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        closeMobileMenu({ restoreFocus: true });
      }
    });

    const syncMenuWithViewport = () => {
      if (desktopNavQuery.matches) {
        closeMobileMenu();
      }
    };

    if ("addEventListener" in desktopNavQuery) {
      desktopNavQuery.addEventListener("change", syncMenuWithViewport);
    } else if ("addListener" in desktopNavQuery) {
      desktopNavQuery.addListener(syncMenuWithViewport);
    }
  }

  if ("addEventListener" in reduceMotionQuery) {
    reduceMotionQuery.addEventListener("change", (event) => {
      prefersReducedMotion = event.matches;
      applyParallax();
    });
  } else if ("addListener" in reduceMotionQuery) {
    reduceMotionQuery.addListener((event) => {
      prefersReducedMotion = event.matches;
      applyParallax();
    });
  }

  let isParallaxScheduled = false;
  const scheduleParallax = () => {
    if (isParallaxScheduled) {
      return;
    }

    isParallaxScheduled = true;
    window.requestAnimationFrame(() => {
      applyParallax();
      isParallaxScheduled = false;
    });
  };

  window.addEventListener("scroll", scheduleParallax, { passive: true });
  window.addEventListener("resize", scheduleParallax);

  applyLanguage(detectLanguage());
  applyParallax();
  initializeReveal();
  initializeSpotlights();
})();
