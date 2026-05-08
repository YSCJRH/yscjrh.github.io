(() => {
  const body = document.body;
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
  const spotlightItems = Array.from(document.querySelectorAll("[data-spotlight]"));
  const parallaxHero = document.querySelector("[data-parallax-hero]");
  const mobileMenuLinks = mobileMenu ? Array.from(mobileMenu.querySelectorAll("a")) : [];
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopNavQuery = window.matchMedia("(min-width: 901px)");
  const finePointerQuery = window.matchMedia("(pointer: fine)");
  let prefersReducedMotion = reduceMotionQuery.matches;

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
      if (mobileMenuLinks.length) {
        mobileMenuLinks[0].focus();
      }
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
    }, 220);

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
      parallaxHero.style.setProperty("--hero-panel-translate", "0px");
      return;
    }

    const distance = Math.max(window.innerHeight * 0.9, 1);
    const progress = Math.min(window.scrollY / distance, 1);
    parallaxHero.style.setProperty("--hero-copy-translate", `${progress * -8}px`);
    parallaxHero.style.setProperty("--hero-panel-translate", `${progress * 10}px`);
  }

  function initializeReveal() {
    if (!revealItems.length) {
      return;
    }

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 28, 140)}ms`;
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
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

    revealItems.forEach((item) => observer.observe(item));
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
        item.style.setProperty("--spotlight-x", `${event.clientX - bounds.left}px`);
        item.style.setProperty("--spotlight-y", `${event.clientY - bounds.top}px`);
      });
    });
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", toggleMobileMenu);

    mobileMenuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileMenu();
      });
    });

    document.addEventListener("click", (event) => {
      if (navToggle.getAttribute("aria-expanded") !== "true") {
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

  let parallaxScheduled = false;
  const scheduleParallax = () => {
    if (parallaxScheduled) {
      return;
    }

    parallaxScheduled = true;
    window.requestAnimationFrame(() => {
      applyParallax();
      parallaxScheduled = false;
    });
  };

  window.addEventListener("scroll", scheduleParallax, { passive: true });
  window.addEventListener("resize", scheduleParallax);

  applyParallax();
  initializeReveal();
  initializeSpotlights();
})();
