import {
  applyControlValue,
  createInstrumentState,
  resetGeometry,
  setGeometryOffsets,
  setMode,
  setSelectedPart,
} from "./sim/state.mjs?v=teaching-depth-20260427b";
import { deriveInstrument } from "./sim/physics/derive.mjs?v=teaching-depth-20260427b";
import { createInstrumentScene } from "./sim/scene/InstrumentScene.mjs?v=teaching-depth-20260427b";
import {
  collectInstrumentElements,
  updateDiagnostics,
  updatePartChrome,
  updateSpectrumChrome,
} from "./sim/ui/spectrum.mjs?v=teaching-depth-20260427b";
import { initializeSourceData } from "./sim/ui/source-data.mjs?v=teaching-depth-20260427b";

const root = document.querySelector("[data-instrument-lab]");

if (root) {
  window.__instrumentLabModuleLoaded = true;

  const state = createInstrumentState();
  const elements = collectInstrumentElements(root);
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let sceneController = null;

  function syncInputsFromState() {
    const { controls } = elements;

    if (controls.excitationAngle) controls.excitationAngle.value = String(state.exMono.gratingAngleDeg);
    if (controls.emissionAngle) controls.emissionAngle.value = String(state.emMono.gratingAngleDeg);
    if (controls.slit) controls.slit.value = String(state.slit.widthUm);
    if (controls.integration) controls.integration.value = String(state.integrationTimeMs);
    if (controls.sample) controls.sample.value = state.sample.preset;
    if (controls.sourceOffset) controls.sourceOffset.value = String(state.source.offsetUm);
    if (controls.sampleOffset) controls.sampleOffset.value = String(state.sample.offsetUm);
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

  function createScene() {
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
    });

    root.classList.toggle("has-webgl-scene", Boolean(sceneController.available));
    root.classList.toggle("has-2d-fallback", !sceneController.available);
    updateWebglStatus(
      sceneController.available
        ? "3D teaching skeleton active. 2D optical path remains as fallback."
        : `${sceneController.reason || "3D scene unavailable."} Showing the 2D fallback.`
    );
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

  elements.resetGeometryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      resetGeometry(state);
      syncInputsFromState();
      applyState();
    });
  });

  if ("addEventListener" in reduceMotionQuery) {
    reduceMotionQuery.addEventListener("change", () => {
      applyReducedMotionPreference();
      createScene();
      applyState();
    });
  } else if ("addListener" in reduceMotionQuery) {
    reduceMotionQuery.addListener(() => {
      applyReducedMotionPreference();
      createScene();
      applyState();
    });
  }

  applyReducedMotionPreference();
  syncInputsFromState();
  createScene();
  applyState();
  initializeSourceData(root);
}
