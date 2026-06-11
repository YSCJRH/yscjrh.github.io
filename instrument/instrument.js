import {
  applyControlValue,
  createInstrumentState,
  gratingWavelengthForPart,
  resetGeometry,
  setGeometryOffsets,
  setGratingAngle,
  setMode,
  setSelectedPart,
} from "./sim/state.mjs?v=spectrum-view-20260611";
import { deriveInstrument } from "./sim/physics/derive.mjs?v=spectrum-view-20260611";
import {
  collectInstrumentElements,
  updateDiagnostics,
  updatePartChrome,
  updateSpectrumChrome,
} from "./sim/ui/spectrum.mjs?v=spectrum-view-20260611";

const root = document.querySelector("[data-instrument-lab]");
let sceneModulePromise = null;
let sourceDataModulePromise = null;
const LANGUAGE_MODE_STORAGE_KEY = "instrumentLanguageMode";
const LANGUAGE_MODES = new Set(["en", "zh", "bilingual"]);

if (root) {
  window.__instrumentLabModuleLoaded = true;

  const state = createInstrumentState();
  const elements = collectInstrumentElements(root);
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let sceneController = null;
  let isSceneLoading = false;

  function normalizeLanguageMode(mode) {
    return LANGUAGE_MODES.has(mode) ? mode : "bilingual";
  }

  function readStoredLanguageMode() {
    try {
      return normalizeLanguageMode(window.localStorage.getItem(LANGUAGE_MODE_STORAGE_KEY));
    } catch {
      return "bilingual";
    }
  }

  function persistLanguageMode(mode) {
    try {
      window.localStorage.setItem(LANGUAGE_MODE_STORAGE_KEY, mode);
    } catch {
      // localStorage can be unavailable in restrictive browser modes.
    }
  }

  function setLanguageMode(mode, { persist = true } = {}) {
    const nextMode = normalizeLanguageMode(mode);
    root.dataset.languageMode = nextMode;
    document.documentElement.lang = nextMode === "zh" ? "zh-CN" : "en";

    root.querySelectorAll("[data-language-mode-option]").forEach((button) => {
      const isActive = button.dataset.languageModeOption === nextMode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (persist) {
      persistLanguageMode(nextMode);
    }
  }

  function syncInputsFromState() {
    const { controls } = elements;

    if (controls.excitationWavelength) {
      controls.excitationWavelength.value = String(Math.round(gratingWavelengthForPart(state, "excitation")));
    }
    if (controls.emissionWavelength) {
      controls.emissionWavelength.value = String(Math.round(gratingWavelengthForPart(state, "emission")));
    }
    if (controls.slit) controls.slit.value = String(state.slit.widthUm);
    if (controls.integration) controls.integration.value = String(state.integrationTimeMs);
    if (controls.sample) controls.sample.value = state.sample.preset;
    if (controls.sourceType) controls.sourceType.value = state.source.id;
    if (controls.detectorType) controls.detectorType.value = state.detector.id;
    if (controls.geometryMode) controls.geometryMode.value = state.geometry?.id || "right-angle-90";
    if (controls.spectrumView) controls.spectrumView.value = state.display?.spectrumView || "raw";
    if (controls.sourceOffset) controls.sourceOffset.value = String(state.source.offsetUm);
    if (controls.detectorAngle) controls.detectorAngle.value = String(state.detector.angleDeg);
  }

  function updateWebglStatus(message) {
    if (elements.webglStatus) {
      elements.webglStatus.textContent = message;
    }
  }

  function applyReducedMotionPreference() {
    root.classList.toggle("is-reduced-motion", reduceMotionQuery.matches);
  }

  function applyState() {
    const derived = deriveInstrument(state);
    root.dataset.scanMode = state.mode;
    root.dataset.activePart = state.selectedPart;

    updateSpectrumChrome(root, elements, state, derived);
    updateDiagnostics(elements, derived.diagnostics);
    updatePartChrome(elements, state);

    if (sceneController?.available) {
      sceneController.update(derived, state);
      sceneController.selectPart(state.selectedPart);
    }
  }

  function loadSceneModule() {
    sceneModulePromise ||= import("./sim/scene/InstrumentScene.mjs?v=optical-confidence-20260509");
    return sceneModulePromise;
  }

  function loadSourceDataModule() {
    sourceDataModulePromise ||= import("./sim/ui/source-data.mjs?v=sample-fixed-20260428");
    return sourceDataModulePromise;
  }

  function initializeSourceDataWhenNeeded() {
    const panel = root.querySelector("[data-source-data-panel]");
    let didLoad = false;

    const load = () => {
      if (didLoad) {
        return;
      }
      didLoad = true;
      loadSourceDataModule()
        .then(({ initializeSourceData }) => initializeSourceData(root))
        .catch((error) => {
          console.error("Source-derived examples failed to load.", error);
          const status = root.querySelector("[data-source-status]");
          if (status) {
            status.textContent = "Source-derived examples unavailable. / 引用数据示例暂不可用。";
          }
        });
    };

    if ("IntersectionObserver" in window && panel) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) {
            return;
          }
          observer.disconnect();
          load();
        },
        { rootMargin: "360px 0px" }
      );
      observer.observe(panel);
      return;
    }

    window.addEventListener("load", () => window.setTimeout(load, 1800), { once: true });
  }

  async function createScene() {
    if (isSceneLoading) {
      return;
    }

    isSceneLoading = true;
    elements.enableSceneButtons.forEach((button) => {
      button.disabled = true;
      button.textContent = "Loading 3D model... / 正在加载 3D 模型...";
    });
    updateWebglStatus("Loading 3D teaching skeleton... / 正在加载 3D 教学骨架...");

    let createInstrumentScene;
    try {
      ({ createInstrumentScene } = await loadSceneModule());
    } catch (error) {
      console.error("3D teaching skeleton failed to load.", error);
      root.classList.add("has-2d-fallback");
      updateWebglStatus("3D scene unavailable. Showing the 2D fallback. / 3D 场景不可用，显示二维备用图。");
      elements.enableSceneButtons.forEach((button) => {
        button.disabled = false;
        button.textContent = "Retry 3D model / 重试 3D 模型";
      });
      isSceneLoading = false;
      return;
    }

    sceneController?.dispose?.();
    sceneController = createInstrumentScene({
      host: elements.sceneHost,
      state,
      reducedMotion: reduceMotionQuery.matches,
      onSelectPart: (part) => {
        setSelectedPart(state, part);
        applyState();
      },
      onGeometryChange: (changes) => {
        setGeometryOffsets(state, changes);
        syncInputsFromState();
        applyState();
      },
      onGratingAngleChange: (part, angleDeg) => {
        setGratingAngle(state, part, angleDeg);
        syncInputsFromState();
        applyState();
      },
    });

    root.classList.toggle("has-webgl-scene", Boolean(sceneController.available));
    root.classList.toggle("has-2d-fallback", !sceneController.available);
    updateWebglStatus(
      sceneController.available
        ? "3D teaching skeleton active. 2D optical path remains as fallback. / 3D 教学骨架已启用；二维光路仍作为备用。"
        : `${sceneController.reason || "3D scene unavailable. / 3D 场景不可用。"} Showing the 2D fallback. / 显示二维备用图。`
    );
    elements.enableSceneButtons.forEach((button) => {
      button.hidden = Boolean(sceneController.available);
      button.disabled = false;
      button.textContent = sceneController.available
        ? "3D model active / 3D 模型已启用"
        : "Retry 3D model / 重试 3D 模型";
    });
    isSceneLoading = false;
  }

  elements.modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setMode(state, button.dataset.mode);
      applyState();
    });
  });

  elements.partButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setSelectedPart(state, button.dataset.part);
      applyState();
    });

    if (button.tagName.toLowerCase() !== "button") {
      button.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        setSelectedPart(state, button.dataset.part);
        applyState();
      });
    }
  });

  Object.values(elements.controls).forEach((control) => {
    if (!control) {
      return;
    }

    const handler = () => {
      applyControlValue(state, control.dataset.control, control.value);
      applyState();
    };

    control.addEventListener("input", handler);
    control.addEventListener("change", handler);
  });

  elements.resetViewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      sceneController?.resetView?.();
    });
  });

  elements.enableSceneButtons.forEach((button) => {
    button.addEventListener("click", () => {
      createScene();
    });
  });

  elements.resetGeometryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      resetGeometry(state);
      syncInputsFromState();
      applyState();
    });
  });

  root.querySelectorAll("[data-language-mode-option]").forEach((button) => {
    button.addEventListener("click", () => {
      setLanguageMode(button.dataset.languageModeOption);
    });
  });

  if ("addEventListener" in reduceMotionQuery) {
    reduceMotionQuery.addEventListener("change", () => {
      applyReducedMotionPreference();
      if (sceneController) createScene();
      applyState();
    });
  } else if ("addListener" in reduceMotionQuery) {
    reduceMotionQuery.addListener(() => {
      applyReducedMotionPreference();
      if (sceneController) createScene();
      applyState();
    });
  }

  setLanguageMode(readStoredLanguageMode(), { persist: false });
  applyReducedMotionPreference();
  syncInputsFromState();
  root.classList.add("has-2d-fallback");
  applyState();
  initializeSourceDataWhenNeeded();
}
