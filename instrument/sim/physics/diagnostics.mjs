export function generateDiagnostics(state, derived) {
  const diagnostics = [];

  if (state.mode === "emission") {
    diagnostics.push({
      tone: "info",
      label: "Emission scan",
      text: `Excitation is fixed at ${Math.round(derived.excitationNm)} nm while the emission arm is scanned.`,
    });
  } else if (state.mode === "excitation") {
    diagnostics.push({
      tone: "info",
      label: "Excitation scan",
      text: `Emission is fixed at ${Math.round(derived.emissionNm)} nm while the excitation monochromator is scanned.`,
    });
  } else {
    diagnostics.push({
      tone: "info",
      label: "Kinetic scan",
      text: `Both channels are fixed. This is a synthetic intensity-over-time trace, not lifetime decay.`,
    });
  }

  if (derived.bandpassNm >= 7) {
    diagnostics.push({
      tone: "warn",
      label: "Resolution tradeoff",
      text: "The slit is wide: throughput increases, but spectral features broaden in the teaching model.",
    });
  } else if (derived.bandpassNm <= 3) {
    diagnostics.push({
      tone: "info",
      label: "Narrow bandpass",
      text: "The slit is narrow: resolution improves, but less light reaches the detector.",
    });
  }

  if (derived.alignment.overlapFactor < 0.72) {
    diagnostics.push({
      tone: "warn",
      label: "Alignment",
      text: "Source or sample offset lowers overlap and intensity; it does not move the selected wavelength.",
    });
  }

  if (derived.collection.deltaDeg >= 3) {
    diagnostics.push({
      tone: "warn",
      label: "90 degree geometry",
      text: "Detector arm offset reduces collection and raises background risk in this conceptual model.",
    });
  }

  if (derived.spectrum.profile.kind === "blank") {
    diagnostics.push({
      tone: "info",
      label: "Blank preset",
      text: "The blank/background preset is intentionally weak: mostly baseline plus small scatter/background.",
    });
  }

  return diagnostics.slice(0, 5);
}
