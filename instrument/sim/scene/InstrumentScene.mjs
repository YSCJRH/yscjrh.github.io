import * as THREE from "../../vendor/three/three.module.js";
import { OrbitControls } from "../../vendor/three/addons/controls/OrbitControls.js";
import { TransformControls } from "../../vendor/three/addons/controls/TransformControls.js";
import WebGL from "../../vendor/three/addons/capabilities/WebGL.js";

const PART_ORDER = ["source", "excitation", "sample", "emission", "detector", "output"];
const BENCH_Y = 0.64;
const SOURCE_OFFSET_SCALE = 260;
const DETECTOR_RADIUS = 3.58;
const DETECTOR_MIN_ANGLE = 80;
const DETECTOR_MAX_ANGLE = 100;
const SOURCE_BASE_POSITION = new THREE.Vector3(-4.0, BENCH_Y, 0);
const SAMPLE_BASE_POSITION = new THREE.Vector3(0, BENCH_Y + 0.12, 0);
const GRATING_RANGES = Object.freeze({
  excitation: { min: 9.5, max: 21.5 },
  emission: { min: 14, max: 27 },
});

function isMonochromatorPart(part) {
  return part === "excitation" || part === "emission";
}

function makeMaterial(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.42,
    metalness: options.metalness ?? 0.08,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
  });
}

function createLabel(text, options = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");

  function drawLabel(nextText) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const showPanel = options.panel !== false;
    if (showPanel) {
      const x = 18;
      const y = 24;
      const width = canvas.width - 36;
      const height = canvas.height - 48;
      const radius = 18;
      context.beginPath();
      context.moveTo(x + radius, y);
      context.lineTo(x + width - radius, y);
      context.quadraticCurveTo(x + width, y, x + width, y + radius);
      context.lineTo(x + width, y + height - radius);
      context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      context.lineTo(x + radius, y + height);
      context.quadraticCurveTo(x, y + height, x, y + height - radius);
      context.lineTo(x, y + radius);
      context.quadraticCurveTo(x, y, x + radius, y);
      context.closePath();
      context.fillStyle = "rgba(5, 8, 16, 0.74)";
      context.fill();
      context.strokeStyle = "rgba(125, 245, 223, 0.28)";
      context.lineWidth = 2;
      context.stroke();
    }

    let fontSize = options.fontSize || 42;
    do {
      context.font = `700 ${fontSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
      fontSize -= 2;
    } while (context.measureText(nextText).width > canvas.width - 58 && fontSize > 22);
    context.fillStyle = "rgba(237, 237, 239, 0.94)";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(nextText, canvas.width / 2, canvas.height / 2);
  }

  drawLabel(text);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      depthTest: false,
    })
  );
  sprite.scale.set(options.width || 1.55, options.height || 0.38, 1);
  sprite.userData.baseScale = sprite.scale.clone();
  sprite.renderOrder = options.renderOrder || 32;
  sprite.userData.updateText = (nextText) => {
    drawLabel(nextText);
    texture.needsUpdate = true;
  };
  return sprite;
}

function createLeaderLine(start, end, color = 0x7df5df, opacity = 0.24) {
  const line = createLine([start, end], color, opacity);
  line.material.depthTest = false;
  line.renderOrder = 28;
  return line;
}

function markSelectable(group, part) {
  group.traverse((object) => {
    if (object.isMesh) {
      object.userData.part = part;
    }
  });
}

function setCylinderBetween(mesh, start, end) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

  mesh.position.copy(midpoint);
  mesh.scale.set(1, length, 1);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
}

function makeBoxComponent({ width, height, depth, color, label, part, labelOffset = null, labelScale = 1 }) {
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    makeMaterial(color, {
      transparent: true,
      opacity: 0.72,
      emissive: color,
      emissiveIntensity: 0.04,
    })
  );
  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color: 0xb8c1ff, transparent: true, opacity: 0.22 })
  );
  const labelSprite = createLabel(label);
  if (labelScale !== 1) {
    labelSprite.scale.multiplyScalar(labelScale);
    labelSprite.userData.baseScale = labelSprite.scale.clone();
  }
  const labelPosition = labelOffset || new THREE.Vector3(0, height * 0.72 + 0.42, 0);
  labelSprite.position.copy(labelPosition);
  const leader = createLeaderLine(
    new THREE.Vector3(0, height * 0.5 + 0.05, 0),
    new THREE.Vector3(labelPosition.x, labelPosition.y - 0.18, labelPosition.z)
  );

  group.add(mesh, edge, leader, labelSprite);
  group.userData.mainMesh = mesh;
  group.userData.baseOpacity = mesh.material.opacity;
  group.userData.label = labelSprite;
  group.userData.labelLeader = leader;
  markSelectable(group, part);
  return group;
}

function createSlitAssembly(material) {
  const group = new THREE.Group();
  const jawGeometry = new THREE.BoxGeometry(0.055, 0.56, 0.08);
  const leftJaw = new THREE.Mesh(jawGeometry, material);
  const rightJaw = new THREE.Mesh(jawGeometry, material);
  group.add(leftJaw, rightJaw);
  group.userData.jaws = [leftJaw, rightJaw];
  return group;
}

function setSlitGap(slitGroup, widthUm) {
  const jaws = slitGroup?.userData?.jaws;
  if (!jaws) {
    return;
  }

  const progress = THREE.MathUtils.clamp((widthUm - 100) / 900, 0, 1);
  const gap = 0.075 + progress * 0.18;
  jaws[0].position.x = -gap;
  jaws[1].position.x = gap;
}

function createMirrorPlate() {
  const mirror = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.035, 0.16),
    makeMaterial(0xb9c3d8, {
      transparent: true,
      opacity: 0.56,
      metalness: 0.32,
      roughness: 0.18,
      emissive: 0x6f88ff,
      emissiveIntensity: 0.03,
    })
  );
  return mirror;
}

function createDispersionFan(color, offsetZ) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        -0.12,
        0.17,
        0,
        0.38,
        0.17,
        -0.18 + offsetZ,
        0.38,
        0.17,
        0.18 + offsetZ,
      ],
      3
    )
  );
  geometry.setIndex([0, 1, 2]);
  geometry.computeVertexNormals();

  return new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.11,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
}

function createGratingRotationControl(part) {
  const group = new THREE.Group();
  const range = GRATING_RANGES[part] || GRATING_RANGES.emission;
  const arc = createLine([], 0x7df5df, 0.42);
  const stem = createLine([], 0x7df5df, 0.26);
  const handle = new THREE.Mesh(
    new THREE.SphereGeometry(0.115, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xd8fff8,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    })
  );
  const hitPlate = new THREE.Mesh(
    new THREE.BoxGeometry(1.85, 0.72, 0.72),
    new THREE.MeshBasicMaterial({
      color: 0x7df5df,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
    })
  );
  const label = createLabel("Grating angle / 光栅角", { width: 2.1, height: 0.34, fontSize: 28 });

  group.position.set(0.03, 0.52, 0.04);
  group.visible = false;
  arc.renderOrder = 26;
  stem.renderOrder = 25;
  arc.material.depthTest = false;
  stem.material.depthTest = false;
  handle.renderOrder = 31;
  label.position.set(0, 0.26, 0.62);
  handle.userData.part = part;
  handle.userData.gratingHandle = true;
  handle.userData.gratingPart = part;
  handle.userData.subPart = "grating";
  hitPlate.position.set(0, 0, 0.12);
  hitPlate.userData.part = part;
  hitPlate.userData.gratingHandle = true;
  hitPlate.userData.gratingPart = part;
  hitPlate.userData.subPart = "grating";
  group.add(hitPlate, arc, stem, handle, label);
  group.userData.arc = arc;
  group.userData.stem = stem;
  group.userData.handle = handle;
  group.userData.hitPlate = hitPlate;
  group.userData.label = label;
  group.userData.range = range;
  return group;
}

function gratingHandlePosition(angleDeg, range) {
  const progress = THREE.MathUtils.clamp((angleDeg - range.min) / (range.max - range.min), 0, 1);
  const theta = THREE.MathUtils.lerp(-0.78, 0.78, progress);
  return new THREE.Vector3(Math.sin(theta) * 0.58, 0, Math.cos(theta) * 0.34);
}

function updateGratingRotationControl(monochromator, angleDeg, wavelengthNm, color) {
  const control = monochromator?.userData?.gratingControl;
  if (!control) {
    return;
  }

  const range = control.userData.range;
  const arcPoints = [];
  for (let angle = range.min; angle <= range.max; angle += 0.75) {
    arcPoints.push(gratingHandlePosition(angle, range));
  }
  arcPoints.push(gratingHandlePosition(range.max, range));

  control.userData.arc.geometry.dispose();
  control.userData.arc.geometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
  control.userData.arc.material.color.set(color);
  control.userData.handle.position.copy(gratingHandlePosition(angleDeg, range));
  control.userData.handle.material.color.set(color);
  control.userData.stem.geometry.dispose();
  control.userData.stem.geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -0.43, 0),
    control.userData.handle.position.clone().multiplyScalar(0.78),
  ]);
  control.userData.stem.material.color.set(color);
  control.userData.label.userData.updateText?.(`Drag / 拖动 ${angleDeg.toFixed(1)} deg / ${Math.round(wavelengthNm)} nm`);
}

function createBafflePlate(part, width = 0.045) {
  const baffle = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.5, 0.78),
    makeMaterial(0x05070d, {
      roughness: 0.9,
      metalness: 0,
      transparent: true,
      opacity: 0.76,
      emissive: 0x010205,
      emissiveIntensity: 0.02,
    })
  );
  baffle.userData.part = part;
  baffle.userData.subPart = "baffle";
  return baffle;
}

function createInternalDispersionRays() {
  const group = new THREE.Group();
  const incomingBeam = createBeam(0x6f88ff, 0.012, 0.34);
  const incomingGlow = createBeam(0x6f88ff, 0.028, 0.09);
  const selectedBand = createBeam(0x52f0d3, 0.015, 0.46);
  const selectedBandGlow = createBeam(0x52f0d3, 0.032, 0.14);
  const fan = new THREE.Group();

  fan.add(
    createDispersionFan(0x6f88ff, -0.14),
    createDispersionFan(0x52f0d3, 0),
    createDispersionFan(0xffd166, 0.14)
  );
  fan.position.set(0.02, 0, -0.02);

  setCylinderBetween(incomingBeam, new THREE.Vector3(-0.46, 0.16, 0.46), new THREE.Vector3(-0.03, 0.16, 0.02));
  setCylinderBetween(incomingGlow, new THREE.Vector3(-0.46, 0.16, 0.46), new THREE.Vector3(-0.03, 0.16, 0.02));
  setCylinderBetween(selectedBand, new THREE.Vector3(0, 0.16, 0), new THREE.Vector3(0.46, 0.16, -0.46));
  setCylinderBetween(selectedBandGlow, new THREE.Vector3(0, 0.16, 0), new THREE.Vector3(0.46, 0.16, -0.46));

  group.add(incomingGlow, incomingBeam, fan, selectedBandGlow, selectedBand);
  group.userData.incomingBeam = incomingBeam;
  group.userData.incomingGlow = incomingGlow;
  group.userData.fan = fan;
  group.userData.selectedBand = selectedBand;
  group.userData.selectedBandGlow = selectedBandGlow;
  return group;
}

function createMonochromatorInterior(part) {
  const group = new THREE.Group();
  const slitMaterial = makeMaterial(0xdde7ff, { transparent: true, opacity: 0.62, emissive: 0x6f88ff, emissiveIntensity: 0.16 });
  const gratingMaterial = makeMaterial(0x86fff0, { transparent: true, opacity: 0.7, emissive: 0x52f0d3, emissiveIntensity: 0.2 });
  const liner = new THREE.Mesh(
    new THREE.BoxGeometry(1.18, 0.72, 0.92),
    new THREE.MeshBasicMaterial({
      color: 0x03050b,
      transparent: true,
      opacity: 0.32,
      side: THREE.BackSide,
      depthWrite: false,
    })
  );
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(1.16, 0.025, 0.9),
    makeMaterial(0x070a12, { roughness: 0.88, metalness: 0, transparent: true, opacity: 0.82 })
  );
  const entrySlit = createSlitAssembly(slitMaterial);
  const exitSlit = createSlitAssembly(slitMaterial);
  const gratingPivot = new THREE.Group();
  const grating = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.04, 0.42), gratingMaterial);
  const groovePoints = [];
  for (let x = -0.25; x <= 0.25; x += 0.05) {
    groovePoints.push(new THREE.Vector3(x, 0.026, -0.18), new THREE.Vector3(x, 0.026, 0.18));
  }
  const gratingGrooves = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(groovePoints),
    new THREE.LineBasicMaterial({ color: 0xd8fff8, transparent: true, opacity: 0.32 })
  );
  const pivotAxis = createLine([new THREE.Vector3(0, -0.23, 0), new THREE.Vector3(0, 0.28, 0)], 0xd8fff8, 0.36);
  const collimatingMirror = createMirrorPlate();
  const focusingMirror = createMirrorPlate();
  const baffleA = createBafflePlate(part);
  const baffleB = createBafflePlate(part);
  const filterPlaceholder = new THREE.Mesh(
    new THREE.BoxGeometry(0.035, 0.42, 0.34),
    makeMaterial(0x2c3a52, { transparent: true, opacity: 0.34, emissive: 0x52f0d3, emissiveIntensity: 0.04 })
  );
  const rays = createInternalDispersionRays();
  const gratingControl = createGratingRotationControl(part);

  liner.position.set(0, 0.03, 0);
  floor.position.set(0, -0.35, 0);
  entrySlit.position.set(-0.46, 0.03, 0.46);
  exitSlit.position.set(0.46, 0.03, -0.46);
  gratingPivot.position.set(0, 0.04, 0);
  grating.userData.part = part;
  grating.userData.gratingHandle = true;
  grating.userData.gratingPart = part;
  grating.userData.subPart = "grating";
  gratingPivot.userData.subPart = "grating";
  gratingPivot.add(grating, gratingGrooves, pivotAxis);
  collimatingMirror.position.set(-0.25, 0.2, -0.2);
  collimatingMirror.rotation.y = -Math.PI / 5;
  collimatingMirror.userData.subPart = "collimating-mirror";
  focusingMirror.position.set(0.25, 0.2, 0.2);
  focusingMirror.rotation.y = Math.PI / 5;
  focusingMirror.userData.subPart = "focusing-mirror";
  baffleA.position.set(-0.08, 0.05, 0.42);
  baffleA.rotation.y = Math.PI / 2;
  baffleB.position.set(0.16, 0.05, -0.38);
  baffleB.rotation.y = Math.PI / 2;
  filterPlaceholder.position.set(0.37, 0.08, -0.31);
  filterPlaceholder.userData.part = part;
  filterPlaceholder.userData.subPart = "filter-placeholder";

  group.add(liner, floor, rays, entrySlit, exitSlit, collimatingMirror, focusingMirror, baffleA, baffleB, filterPlaceholder, gratingPivot, gratingControl);
  group.userData.liner = liner;
  group.userData.floor = floor;
  group.userData.grating = grating;
  group.userData.gratingPivot = gratingPivot;
  group.userData.part = part;
  group.userData.entrySlit = entrySlit;
  group.userData.exitSlit = exitSlit;
  group.userData.selectedBand = rays.userData.selectedBand;
  group.userData.selectedBandGlow = rays.userData.selectedBandGlow;
  group.userData.incomingBeam = rays.userData.incomingBeam;
  group.userData.incomingGlow = rays.userData.incomingGlow;
  group.userData.fan = rays.userData.fan;
  group.userData.internalRays = rays;
  group.userData.gratingControl = gratingControl;
  group.userData.baffles = [baffleA, baffleB];
  group.userData.filterPlaceholder = filterPlaceholder;
  markSelectable(group, part);
  return group;
}

function createMonochromator(label, part) {
  const group = makeBoxComponent({
    width: 1.34,
    height: 0.9,
    depth: 1.05,
    color: 0x2f335a,
    label,
    part,
  });
  const accessPanel = new THREE.Mesh(
    new THREE.BoxGeometry(1.18, 0.065, 0.88),
    makeMaterial(0x1b2038, { roughness: 0.74, transparent: true, opacity: 0.78, emissive: 0x11182c, emissiveIntensity: 0.08 })
  );
  const accessPanelEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(accessPanel.geometry),
    new THREE.LineBasicMaterial({ color: 0x7df5df, transparent: true, opacity: 0.32 })
  );
  const interior = createMonochromatorInterior(part);

  accessPanel.position.set(0, 0.56, 0.18);
  accessPanel.rotation.x = -0.35;
  accessPanel.userData.part = part;
  accessPanelEdges.position.copy(accessPanel.position);
  accessPanelEdges.rotation.copy(accessPanel.rotation);
  group.add(interior, accessPanel, accessPanelEdges);
  group.userData.part = part;
  group.userData.interior = interior;
  group.userData.accessPanel = accessPanel;
  group.userData.accessPanelEdges = accessPanelEdges;
  group.userData.grating = interior.userData.grating;
  group.userData.gratingPivot = interior.userData.gratingPivot;
  group.userData.entrySlit = interior.userData.entrySlit;
  group.userData.exitSlit = interior.userData.exitSlit;
  group.userData.selectedBand = interior.userData.selectedBand;
  group.userData.selectedBandGlow = interior.userData.selectedBandGlow;
  group.userData.incomingBeam = interior.userData.incomingBeam;
  group.userData.incomingGlow = interior.userData.incomingGlow;
  group.userData.fan = interior.userData.fan;
  group.userData.internalRays = interior.userData.internalRays;
  group.userData.gratingControl = interior.userData.gratingControl;
  group.userData.cutaway = [interior, accessPanel, accessPanelEdges];
  group.userData.open = false;
  return group;
}

function updateMonochromatorCutaway(monochromator, angleDeg, wavelengthNm, selectedColor, slitWidthUm) {
  if (!monochromator?.userData?.gratingPivot) {
    return;
  }

  monochromator.userData.gratingPivot.rotation.y = THREE.MathUtils.degToRad(angleDeg);
  setSlitGap(monochromator.userData.entrySlit, slitWidthUm);
  setSlitGap(monochromator.userData.exitSlit, slitWidthUm);
  const slitProgress = THREE.MathUtils.clamp((slitWidthUm - 100) / 900, 0, 1);
  const bandShift = THREE.MathUtils.clamp((angleDeg - 18) * 0.012, -0.13, 0.13);
  const incomingStart = new THREE.Vector3(-0.46, 0.16, 0.46);
  const incomingEnd = new THREE.Vector3(-0.04, 0.16, 0.02 + bandShift * 0.25);
  const selectedStart = new THREE.Vector3(-0.02, 0.16, bandShift * 0.35);
  const selectedEnd = new THREE.Vector3(0.46, 0.16, -0.46 + bandShift);

  setCylinderBetween(monochromator.userData.incomingBeam, incomingStart, incomingEnd);
  setCylinderBetween(monochromator.userData.incomingGlow, incomingStart, incomingEnd);
  setCylinderBetween(monochromator.userData.selectedBand, selectedStart, selectedEnd);
  setCylinderBetween(monochromator.userData.selectedBandGlow, selectedStart, selectedEnd);

  if (monochromator.userData.incomingBeam?.material) {
    monochromator.userData.incomingBeam.material.color.set(selectedColor);
    monochromator.userData.incomingBeam.material.opacity = 0.22 + slitProgress * 0.18;
  }

  if (monochromator.userData.incomingGlow?.material) {
    monochromator.userData.incomingGlow.material.color.set(selectedColor);
    monochromator.userData.incomingGlow.material.opacity = 0.06 + slitProgress * 0.1;
  }

  if (monochromator.userData.selectedBand?.material) {
    monochromator.userData.selectedBand.material.color.set(selectedColor);
    monochromator.userData.selectedBand.material.opacity = 0.36 + slitProgress * 0.28;
  }

  if (monochromator.userData.selectedBandGlow?.material) {
    monochromator.userData.selectedBandGlow.material.color.set(selectedColor);
    monochromator.userData.selectedBandGlow.material.opacity = 0.12 + slitProgress * 0.16;
  }

  monochromator.userData.fan?.traverse((object) => {
    if (object.material) {
      object.material.opacity = 0.08 + slitProgress * 0.08;
    }
  });
  if (monochromator.userData.fan) {
    monochromator.userData.fan.rotation.y = THREE.MathUtils.degToRad((angleDeg - 18) * 0.45);
  }
  updateGratingRotationControl(monochromator, angleDeg, wavelengthNm, selectedColor);
}

function setMonochromatorOpenState(monochromator, open) {
  if (!monochromator?.userData?.cutaway) {
    return;
  }

  monochromator.userData.open = open;
  monochromator.userData.cutaway.forEach((object) => {
    object.visible = open;
  });

  if (monochromator.userData.gratingControl) {
    monochromator.userData.gratingControl.visible = open;
  }

  const mesh = monochromator.userData.mainMesh;
  if (mesh?.material) {
    mesh.material.opacity = open ? 0.26 : (monochromator.userData.baseOpacity ?? 0.72);
    mesh.material.emissiveIntensity = open ? 0.16 : 0.04;
  }
}

function updateSampleAlignmentIndicator(component, derived) {
  const ring = component?.userData?.alignmentRing;
  if (!ring) {
    return;
  }

  const overlap = derived.alignment.overlapFactor;
  ring.material.color.set(overlap < 0.72 ? 0xffd166 : 0x7df5df);
  ring.material.opacity = 0.16 + overlap * 0.36;
  ring.scale.setScalar(1);
}

function createBeamStop() {
  const group = new THREE.Group();
  const absorberMaterial = makeMaterial(0x07090f, {
    roughness: 0.92,
    metalness: 0,
    emissive: 0x020305,
    emissiveIntensity: 0.02,
  });
  const cavityMaterial = new THREE.MeshBasicMaterial({
    color: 0x010205,
    transparent: true,
    opacity: 0.95,
  });
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.13, 0.66), makeMaterial(0x101522, { roughness: 0.86 }));
  const block = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.58, 0.56), absorberMaterial);
  const cavity = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.34, 0.34), cavityMaterial);
  const grooveA = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.43, 0.025), makeMaterial(0x151a25, { roughness: 0.9 }));
  const grooveB = grooveA.clone();
  const label = createLabel("Beam stop / 光束终止器", { width: 2.25, fontSize: 34 });
  const leader = createLeaderLine(new THREE.Vector3(0, 0.33, 0), new THREE.Vector3(0, 0.72, 0.08), 0x8490a8, 0.3);

  base.position.y = -0.34;
  block.position.y = 0.02;
  cavity.position.set(-0.352, 0.02, 0);
  grooveA.position.set(-0.356, 0.02, -0.19);
  grooveB.position.set(-0.356, 0.02, 0.19);
  label.position.set(0, 0.9, 0.08);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(block.geometry),
    new THREE.LineBasicMaterial({ color: 0x526070, transparent: true, opacity: 0.25 })
  );
  edges.position.copy(block.position);

  group.add(base, block, edges, cavity, grooveA, grooveB, leader, label);
  return group;
}

function createBeam(color, radius, opacity) {
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 1, 18, 1, true), material);
  mesh.renderOrder = 10;
  return mesh;
}

function createSegmentedBeam(color, radius, opacity, count = 6) {
  const group = new THREE.Group();
  group.userData.segments = Array.from({ length: count }, () => createBeam(color, radius, opacity));
  group.userData.segments.forEach((segment) => group.add(segment));
  return group;
}

function setSegmentedBeam(group, start, end) {
  const segments = group?.userData?.segments || [];
  if (!segments.length) {
    return;
  }

  const span = new THREE.Vector3().subVectors(end, start);
  segments.forEach((segment, index) => {
    const t0 = index / segments.length;
    const t1 = Math.min(t0 + 0.55 / segments.length, 1);
    const segmentStart = start.clone().add(span.clone().multiplyScalar(t0));
    const segmentEnd = start.clone().add(span.clone().multiplyScalar(t1));
    setCylinderBetween(segment, segmentStart, segmentEnd);
  });
}

function setBeamOpacity(object, opacity) {
  if (!object) {
    return;
  }

  object.traverse((entry) => {
    if (entry.material) {
      entry.material.opacity = opacity;
    }
  });
}

function setBeamColor(object, color) {
  if (!object) {
    return;
  }

  object.traverse((entry) => {
    if (entry.material?.color) {
      entry.material.color.set(color);
    }
  });
}

function createLine(points, color, opacity = 0.5) {
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
    })
  );
}

function createDetectorArmControl() {
  const group = new THREE.Group();
  const arc = createLine([], 0x7df5df, 0.36);
  const reference = createLine([], 0x7283a4, 0.26);
  const handle = new THREE.Mesh(
    new THREE.SphereGeometry(0.105, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xd8fff8,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  const angleLabel = createLabel("90 deg / 90° 收集", { width: 1.75, fontSize: 32 });

  handle.userData.part = "detector";
  handle.userData.detectorHandle = true;
  arc.renderOrder = 9;
  reference.renderOrder = 8;
  handle.renderOrder = 12;
  angleLabel.position.set(0, 0.42, 1.95);

  group.add(reference, arc, handle, angleLabel);
  group.userData.arc = arc;
  group.userData.reference = reference;
  group.userData.handle = handle;
  group.userData.angleLabel = angleLabel;
  return group;
}

function updateDetectorArmControl(group, samplePosition, detectorPosition, angleDeg) {
  const arc = group?.userData?.arc;
  const reference = group?.userData?.reference;
  const handle = group?.userData?.handle;
  const angleLabel = group?.userData?.angleLabel;
  if (!arc || !reference || !handle) {
    return;
  }

  const arcPoints = [];
  for (let angle = DETECTOR_MIN_ANGLE; angle <= DETECTOR_MAX_ANGLE; angle += 2) {
    const theta = THREE.MathUtils.degToRad(angle);
    arcPoints.push(
      new THREE.Vector3(
        samplePosition.x + DETECTOR_RADIUS * Math.cos(theta),
        BENCH_Y + 0.12,
        samplePosition.z + DETECTOR_RADIUS * Math.sin(theta)
      )
    );
  }
  arc.geometry.dispose();
  arc.geometry = new THREE.BufferGeometry().setFromPoints(arcPoints);

  reference.geometry.dispose();
  reference.geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(samplePosition.x, BENCH_Y + 0.08, samplePosition.z),
    new THREE.Vector3(samplePosition.x, BENCH_Y + 0.08, samplePosition.z + DETECTOR_RADIUS),
  ]);

  handle.position.copy(detectorPosition).setY(BENCH_Y + 0.12);
  const offCenter = Math.abs(angleDeg - 90);
  handle.material.color.set(offCenter >= 3 ? 0xffd166 : 0xd8fff8);
  handle.material.opacity = offCenter > 0.25 ? 1 : 0.82;
  handle.scale.setScalar(1 + Math.min(offCenter / 14, 0.4));
  arc.material.color.set(offCenter >= 3 ? 0xffd166 : 0x7df5df);
  arc.material.opacity = offCenter >= 3 ? 0.5 : 0.36;

  if (angleLabel) {
    angleLabel.position.set(samplePosition.x + 0.58, BENCH_Y + 0.34, samplePosition.z + 1.92);
    angleLabel.material.opacity = offCenter > 0.25 ? 0.95 : 0.62;
  }
}

function createOutputMiniGraph() {
  const group = new THREE.Group();
  const axisMaterial = new THREE.LineBasicMaterial({
    color: 0xaeb8d8,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    depthTest: false,
  });
  const traceMaterial = new THREE.LineBasicMaterial({
    color: 0x8dfff0,
    transparent: true,
    opacity: 0.94,
    depthWrite: false,
    depthTest: false,
  });
  const axis = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.58, -0.22, 0.09),
      new THREE.Vector3(0.58, -0.22, 0.09),
      new THREE.Vector3(-0.58, -0.22, 0.09),
      new THREE.Vector3(-0.58, 0.36, 0.09),
    ]),
    axisMaterial
  );
  const trace = new THREE.Line(new THREE.BufferGeometry().setFromPoints([]), traceMaterial);
  const bar = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -0.22, 0.1), new THREE.Vector3(0, 0.1, 0.1)]),
    traceMaterial.clone()
  );
  const point = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 18, 18),
    new THREE.MeshBasicMaterial({
      color: 0x8dfff0,
      transparent: true,
      opacity: 0.94,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    })
  );
  const label = createLabel("a.u.", { width: 0.62, height: 0.22, fontSize: 28, panel: false });

  group.position.set(0, 0.02, 0);
  axis.renderOrder = 32;
  trace.renderOrder = 33;
  bar.renderOrder = 34;
  point.renderOrder = 35;
  label.position.set(-0.42, 0.42, 0.1);
  group.add(axis, trace, bar, point, label);
  group.userData.trace = trace;
  group.userData.bar = bar;
  group.userData.point = point;
  return group;
}

function updateOutputMiniSpectrum(output, derived, currentState) {
  const graph = output?.userData?.miniGraph;
  const points = derived?.spectrum?.points || [];
  if (!graph || !points.length) {
    return;
  }

  const xMin = -0.52;
  const xMax = 0.54;
  const yMin = -0.2;
  const yMax = 0.36;
  const color = currentState.mode === "excitation" ? derived.beams.excitationColor : derived.beams.emissionColor;
  const tracePoints = points.map((point, index) => {
    const progress = points.length <= 1 ? 0.5 : index / (points.length - 1);
    return new THREE.Vector3(
      THREE.MathUtils.lerp(xMin, xMax, progress),
      THREE.MathUtils.lerp(yMin, yMax, THREE.MathUtils.clamp(point.y, 0, 1)),
      0.1
    );
  });

  graph.userData.trace.visible = currentState.mode !== "single";
  graph.userData.bar.visible = currentState.mode === "single";
  graph.userData.point.visible = true;
  graph.userData.trace.material.color.set(color);
  graph.userData.bar.material.color.set(color);
  graph.userData.point.material.color.set(color);

  if (currentState.mode === "single") {
    const y = tracePoints[0]?.y ?? yMin;
    graph.userData.bar.geometry.dispose();
    graph.userData.bar.geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, yMin, 0.1),
      new THREE.Vector3(0, y, 0.1),
    ]);
    graph.userData.point.position.set(0, y, 0.1);
    return;
  }

  graph.userData.trace.geometry.dispose();
  graph.userData.trace.geometry = new THREE.BufferGeometry().setFromPoints(tracePoints);
  const peakPoint = tracePoints.reduce((peak, point) => (point.y > peak.y ? point : peak), tracePoints[0]);
  graph.userData.point.position.copy(peakPoint);
}

function makeHotspot() {
  return new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 20, 20),
    new THREE.MeshBasicMaterial({
      color: 0xe8fffb,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    })
  );
}

export function createInstrumentScene({ host, state, onSelectPart, onGeometryChange, onGratingAngleChange, reducedMotion = false }) {
  if (!host || !WebGL.isWebGL2Available()) {
    return {
      available: false,
      reason: "WebGL 2 is not available. / WebGL 2 不可用。",
      update() {},
      selectPart() {},
      resetView() {},
      dispose() {},
    };
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
  camera.position.set(5.8, 4.35, 5.55);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = !reducedMotion;
  controls.dampingFactor = 0.08;
  controls.minDistance = 4.2;
  controls.maxDistance = 10.5;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.target.set(-0.85, 0.72, 1.15);

  const transformControls = new TransformControls(camera, renderer.domElement);
  transformControls.setMode("translate");
  transformControls.setSpace("world");
  transformControls.setSize(0.52);
  transformControls.translationSnap = 0.02;
  transformControls.showX = false;
  transformControls.showY = false;
  transformControls.showZ = true;
  const transformHelper = transformControls.getHelper();
  transformHelper.visible = false;
  scene.add(transformHelper);
  let isTransformDragging = false;
  let activeTransformPart = null;
  let detectorDragActive = false;
  let gratingDragActive = null;
  let gratingDragStartX = 0;
  let gratingDragStartAngle = 0;
  let selectedSubPart = null;
  const detectorDragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -BENCH_Y);
  const detectorDragPoint = new THREE.Vector3();
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute(
    "aria-label",
    "3D fluorescence instrument scene. Click a monochromator to open it, then drag its grating or use arrow keys. / 3D 荧光仪器场景；点击单色器打开外壳，然后拖动光栅或使用方向键。"
  );

  const root = new THREE.Group();
  scene.add(root);

  scene.add(new THREE.HemisphereLight(0xb8c7ff, 0x080812, 1.35));
  const key = new THREE.DirectionalLight(0xaec4ff, 1.8);
  key.position.set(4, 7, 3);
  scene.add(key);
  const cyanLight = new THREE.PointLight(0x52f0d3, 2.8, 7);
  cyanLight.position.set(0, 1.7, 1.2);
  scene.add(cyanLight);

  const grid = new THREE.GridHelper(9, 18, 0x465075, 0x202840);
  grid.material.transparent = true;
  grid.material.opacity = 0.24;
  grid.position.y = 0.02;
  root.add(grid);

  const bench = new THREE.Mesh(
    new THREE.BoxGeometry(6.8, 0.08, 4.8),
    makeMaterial(0x11182c, { transparent: true, opacity: 0.72, metalness: 0.1 })
  );
  bench.position.set(-1, 0.06, 1.3);
  root.add(bench);

  const components = {};
  components.source = makeBoxComponent({ width: 1.0, height: 0.82, depth: 0.9, color: 0x282c4c, label: "Source / 光源", part: "source" });
  components.source.position.copy(SOURCE_BASE_POSITION);
  root.add(components.source);

  components.excitation = createMonochromator("Ex mono / 激发", "excitation");
  components.excitation.position.set(-2.15, BENCH_Y, 0);
  root.add(components.excitation);

  components.sample = new THREE.Group();
  const sampleGlass = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, 1.05, 0.54),
    makeMaterial(0x315d6d, {
      transparent: true,
      opacity: 0.38,
      emissive: 0x52f0d3,
      emissiveIntensity: 0.05,
    })
  );
  const sampleEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(sampleGlass.geometry),
    new THREE.LineBasicMaterial({ color: 0x91fff2, transparent: true, opacity: 0.38 })
  );
  const samplePlume = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 32, 18),
    new THREE.MeshBasicMaterial({
      color: 0x52f0d3,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  samplePlume.scale.set(0.85, 1.2, 0.85);
  samplePlume.position.set(0, 0.04, 0);
  const alignmentRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.014, 12, 52),
    new THREE.MeshBasicMaterial({
      color: 0x7df5df,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  alignmentRing.rotation.x = Math.PI / 2;
  alignmentRing.position.set(0, 0.02, 0);
  const sampleLabel = createLabel("Sample / 样品");
  const sampleLeader = createLeaderLine(new THREE.Vector3(0, 0.58, 0), new THREE.Vector3(0, 1.17, 0), 0x7df5df, 0.28);
  sampleLabel.position.set(0, 1.35, 0);
  components.sample.add(samplePlume, alignmentRing, sampleGlass, sampleEdges, sampleLeader, sampleLabel);
  components.sample.position.copy(SAMPLE_BASE_POSITION);
  components.sample.userData.mainMesh = sampleGlass;
  components.sample.userData.baseOpacity = sampleGlass.material.opacity;
  components.sample.userData.plume = samplePlume;
  components.sample.userData.alignmentRing = alignmentRing;
  components.sample.userData.label = sampleLabel;
  markSelectable(components.sample, "sample");
  root.add(components.sample);

  const stopGroup = createBeamStop();
  stopGroup.position.set(1.72, BENCH_Y + 0.04, 0);
  root.add(stopGroup);

  components.emission = createMonochromator("Em mono / 发射", "emission");
  components.emission.position.set(0, BENCH_Y, 2.05);
  components.emission.rotation.y = Math.PI / 2;
  root.add(components.emission);

  components.detector = makeBoxComponent({ width: 0.94, height: 0.86, depth: 0.94, color: 0x2d314f, label: "Detector / 检测器", part: "detector" });
  components.detector.position.set(0, BENCH_Y, 3.58);
  root.add(components.detector);

  components.output = makeBoxComponent({
    width: 1.5,
    height: 0.86,
    depth: 0.16,
    color: 0x162039,
    label: "Spectrum / 谱图",
    part: "output",
    labelOffset: new THREE.Vector3(-0.1, 1.62, 0.18),
    labelScale: 0.62,
  });
  components.output.position.set(2.1, BENCH_Y + 0.1, 3.2);
  components.output.rotation.y = -Math.PI / 5;
  root.add(components.output);

  const outputMiniGraph = createOutputMiniGraph();
  components.output.add(outputMiniGraph);
  components.output.userData.miniGraph = outputMiniGraph;

  const detectorArmControl = createDetectorArmControl();
  root.add(detectorArmControl);

  const beams = {
    excitation: createBeam(0x6f88ff, 0.035, 0.82),
    residual: createSegmentedBeam(0x70809a, 0.014, 0.22, 6),
    emission: createBeam(0x52f0d3, 0.035, 0.58),
    signal: createBeam(0x8490a8, 0.012, 0.28),
  };
  root.add(beams.excitation, beams.residual, beams.emission, beams.signal);

  const hotspots = {};
  PART_ORDER.forEach((part) => {
    hotspots[part] = makeHotspot();
    hotspots[part].userData.part = part;
    root.add(hotspots[part]);
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const selectable = [];
  root.traverse((object) => {
    if (object.isMesh && object.userData.part) {
      selectable.push(object);
    }
  });

  function isWorldVisible(object) {
    let entry = object;
    while (entry) {
      if (entry.visible === false) {
        return false;
      }
      entry = entry.parent;
    }
    return true;
  }

  function setPointerFromEvent(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
  }

  function pickInteractiveObject(event) {
    setPointerFromEvent(event);
    const hits = raycaster.intersectObjects(selectable, true).filter((entry) => isWorldVisible(entry.object));
    return hits.find((entry) => entry.object.userData.detectorHandle || entry.object.userData.gratingHandle)
      || hits.find((entry) => entry.object.userData.part)
      || null;
  }

  function setSelectedSubPart(part, subPart) {
    const key = part && subPart ? `${part}:${subPart}` : null;
    if (selectedSubPart === key) {
      return;
    }

    selectedSubPart = key;
    ["excitation", "emission"].forEach((monoPart) => {
      const handle = components[monoPart]?.userData?.gratingControl?.userData?.handle;
      if (handle) {
        handle.scale.setScalar(key === `${monoPart}:grating` ? 1.24 : 1);
      }
    });
    render();
  }

  function detectorPosition(angleDeg, samplePosition = SAMPLE_BASE_POSITION) {
    const theta = THREE.MathUtils.degToRad(angleDeg);
    return new THREE.Vector3(
      samplePosition.x + DETECTOR_RADIUS * Math.cos(theta),
      BENCH_Y,
      samplePosition.z + DETECTOR_RADIUS * Math.sin(theta)
    );
  }

  function updateHotspots() {
    hotspots.source.position.set(-4, BENCH_Y + 0.38, 0);
    hotspots.excitation.position.copy(components.excitation.position).add(new THREE.Vector3(0, 0.38, 0));
    hotspots.sample.position.copy(components.sample.position).add(new THREE.Vector3(0, 0.32, 0));
    hotspots.emission.position.copy(components.emission.position).add(new THREE.Vector3(0, 0.42, 0));
    hotspots.detector.position.copy(components.detector.position).add(new THREE.Vector3(0, 0.38, 0));
    hotspots.output.position.copy(components.output.position).add(new THREE.Vector3(0, 0.38, 0));
  }

  function render() {
    renderer.render(scene, camera);
  }

  function resize() {
    const rect = host.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const labelScale = width < 520 ? 0.78 : 1;
    root.traverse((object) => {
      if (object.isSprite && object.userData.baseScale) {
        object.scale.copy(object.userData.baseScale).multiplyScalar(labelScale);
      }
    });
    render();
  }

  function selectPart(part) {
    Object.entries(components).forEach(([name, group]) => {
      const selected = name === part;
      const mesh = group.userData.mainMesh;
      const openMonochromator = isMonochromatorPart(name) && selected;
      if (isMonochromatorPart(name)) {
        setMonochromatorOpenState(group, openMonochromator);
      }
      if (mesh?.material) {
        const baseOpacity = group.userData.baseOpacity ?? mesh.material.opacity;
        mesh.material.emissiveIntensity = openMonochromator ? 0.16 : selected ? 0.22 : 0.04;
        mesh.material.opacity = openMonochromator ? 0.26 : selected ? Math.max(baseOpacity, 0.78) : baseOpacity;
      }
      group.scale.setScalar(selected ? 1.045 : 1);
    });

    Object.entries(hotspots).forEach(([name, mesh]) => {
      mesh.material.opacity = name === part ? 1 : 0.46;
      mesh.scale.setScalar(name === part ? 1.45 : 1);
    });

    if (components.sample.userData.alignmentRing?.material) {
      components.sample.userData.alignmentRing.material.opacity = part === "sample" ? 0.22 : 0.1;
    }

    if (part === "source" && activeTransformPart === part) {
      transformControls.attach(components[part]);
      transformHelper.visible = true;
      transformControls.enabled = true;
    } else {
      transformControls.detach();
      transformHelper.visible = false;
      transformControls.enabled = false;
    }

    const showDetectorArm = part === "detector";
    detectorArmControl.visible = showDetectorArm;
    detectorArmControl.userData.arc.material.opacity = showDetectorArm ? 0.42 : 0;
    detectorArmControl.userData.reference.material.opacity = showDetectorArm ? 0.28 : 0;
    detectorArmControl.userData.handle.material.opacity = showDetectorArm ? detectorArmControl.userData.handle.material.opacity : 0;

    render();
  }

  function update(derived, currentState) {
    const sourceOffset = currentState.source.offsetUm / SOURCE_OFFSET_SCALE;
    components.source.position.copy(SOURCE_BASE_POSITION).add(new THREE.Vector3(0, 0, sourceOffset));
    components.sample.position.copy(SAMPLE_BASE_POSITION);

    const detectorPos = detectorPosition(currentState.detector.angleDeg, components.sample.position);
    components.detector.position.copy(detectorPos);
    components.detector.lookAt(components.sample.position.x, BENCH_Y, components.sample.position.z);

    const outputPos = new THREE.Vector3(2.1, BENCH_Y + 0.1, 3.2);
    components.output.position.copy(outputPos);

    updateMonochromatorCutaway(
      components.excitation,
      currentState.exMono.gratingAngleDeg,
      derived.excitationNm,
      derived.beams.excitationColor,
      currentState.slit.widthUm
    );
    updateMonochromatorCutaway(
      components.emission,
      currentState.emMono.gratingAngleDeg,
      derived.emissionNm,
      derived.beams.emissionColor,
      currentState.slit.widthUm
    );
    updateOutputMiniSpectrum(components.output, derived, currentState);

    beams.excitation.material.color.set(derived.beams.excitationColor);
    beams.excitation.material.opacity = derived.beams.excitationIntensity;
    setBeamColor(beams.residual, 0x70809a);
    setBeamOpacity(beams.residual, derived.beams.residualIntensity);
    beams.emission.material.color.set(derived.beams.emissionColor);
    beams.emission.material.opacity = derived.beams.emissionIntensity;
    beams.signal.material.opacity = derived.beams.signalIntensity;

    const samplePoint = components.sample.position.clone().setY(BENCH_Y + 0.1);
    setCylinderBetween(beams.excitation, new THREE.Vector3(-4, BENCH_Y + 0.1, sourceOffset), samplePoint);
    setSegmentedBeam(beams.residual, samplePoint, new THREE.Vector3(1.36, BENCH_Y + 0.1, 0));
    setCylinderBetween(beams.emission, samplePoint, components.detector.position.clone().setY(BENCH_Y + 0.1));
    setCylinderBetween(beams.signal, components.detector.position.clone().setY(BENCH_Y + 0.16), components.output.position.clone().setY(BENCH_Y + 0.18));
    updateDetectorArmControl(detectorArmControl, components.sample.position, components.detector.position, currentState.detector.angleDeg);

    if (components.sample.userData.plume) {
      const plumeScale = 0.78 + derived.beams.emissionIntensity * 0.62;
      components.sample.userData.plume.material.opacity = 0.08 + derived.beams.emissionIntensity * 0.18;
      components.sample.userData.plume.scale.set(0.82 * plumeScale, 1.08 * plumeScale, 0.82 * plumeScale);
    }
    updateSampleAlignmentIndicator(components.sample, derived);

    updateHotspots();
    selectPart(currentState.selectedPart);
  }

  function detectorAngleFromPointer(event) {
    setPointerFromEvent(event);

    if (!raycaster.ray.intersectPlane(detectorDragPlane, detectorDragPoint)) {
      return null;
    }

    const sample = components.sample.position;
    const angle = THREE.MathUtils.radToDeg(
      Math.atan2(detectorDragPoint.z - sample.z, detectorDragPoint.x - sample.x)
    );
    return THREE.MathUtils.clamp(angle, DETECTOR_MIN_ANGLE, DETECTOR_MAX_ANGLE);
  }

  function updateDetectorAngleFromPointer(event) {
    const angle = detectorAngleFromPointer(event);
    if (!Number.isFinite(angle)) {
      return;
    }

    onGeometryChange?.({
      detectorAngleDeg: Math.round(angle * 10) / 10,
    });
  }

  function currentGratingAngle(part) {
    return part === "excitation" ? state.exMono.gratingAngleDeg : state.emMono.gratingAngleDeg;
  }

  function emitGratingAngle(part, angleDeg) {
    const range = GRATING_RANGES[part];
    if (!range) {
      return;
    }

    const clamped = THREE.MathUtils.clamp(angleDeg, range.min, range.max);
    const rounded = Math.round(clamped * 10) / 10;
    if (onGratingAngleChange) {
      onGratingAngleChange(part, rounded);
      return;
    }

    onGeometryChange?.(part === "excitation" ? { excitationAngleDeg: rounded } : { emissionAngleDeg: rounded });
  }

  function updateGratingAngleFromPointer(event) {
    if (!gratingDragActive) {
      return;
    }

    const delta = (event.clientX - gratingDragStartX) * 0.035;
    emitGratingAngle(gratingDragActive, gratingDragStartAngle + delta);
  }

  function constrainTransformedPart() {
    const object = transformControls.object;
    if (!object) {
      return;
    }

    if (object === components.source) {
      object.position.x = SOURCE_BASE_POSITION.x;
      object.position.y = SOURCE_BASE_POSITION.y;
      object.position.z = THREE.MathUtils.clamp(object.position.z, -120 / SOURCE_OFFSET_SCALE, 120 / SOURCE_OFFSET_SCALE);
      onGeometryChange?.({
        sourceOffsetUm: object.position.z * SOURCE_OFFSET_SCALE,
      });
    }
  }

  renderer.domElement.addEventListener("pointerdown", (event) => {
    if (isTransformDragging) {
      return;
    }

    const hit = pickInteractiveObject(event);

    if (hit?.object?.userData?.part) {
      if (hit.object.userData.detectorHandle) {
        detectorDragActive = true;
        controls.enabled = false;
        activeTransformPart = null;
        transformControls.detach();
        transformHelper.visible = false;
        onSelectPart?.("detector");
        updateDetectorAngleFromPointer(event);
        renderer.domElement.setPointerCapture?.(event.pointerId);
        return;
      }

      if (hit.object.userData.gratingHandle) {
        gratingDragActive = hit.object.userData.gratingPart;
        gratingDragStartX = event.clientX;
        gratingDragStartAngle = currentGratingAngle(gratingDragActive);
        controls.enabled = false;
        setSelectedSubPart(gratingDragActive, "grating");
        activeTransformPart = null;
        transformControls.detach();
        transformHelper.visible = false;
        onSelectPart?.(gratingDragActive);
        updateGratingAngleFromPointer(event);
        renderer.domElement.focus({ preventScroll: true });
        renderer.domElement.setPointerCapture?.(event.pointerId);
        return;
      }

      if (isMonochromatorPart(hit.object.userData.part)) {
        activeTransformPart = null;
        onSelectPart?.(hit.object.userData.part);
        renderer.domElement.focus({ preventScroll: true });
        return;
      }

      activeTransformPart = hit.object.userData.part === "source"
        ? hit.object.userData.part
        : null;
      onSelectPart?.(hit.object.userData.part);
      renderer.domElement.focus({ preventScroll: true });
    }
  });

  renderer.domElement.addEventListener("pointermove", (event) => {
    if (detectorDragActive) {
      updateDetectorAngleFromPointer(event);
    } else if (gratingDragActive) {
      updateGratingAngleFromPointer(event);
    } else {
      const hit = pickInteractiveObject(event);
      const isGratingHandle = Boolean(hit?.object?.userData?.gratingHandle);
      renderer.domElement.style.cursor = isGratingHandle ? "ew-resize" : hit?.object?.userData?.part ? "pointer" : "";
      setSelectedSubPart(
        isGratingHandle ? hit.object.userData.gratingPart : null,
        isGratingHandle ? "grating" : null
      );
    }
  });

  renderer.domElement.addEventListener("pointerup", (event) => {
    if (!detectorDragActive && !gratingDragActive) {
      return;
    }

    detectorDragActive = false;
    const releasedGratingPart = gratingDragActive;
    gratingDragActive = null;
    if (releasedGratingPart) {
      setSelectedSubPart(releasedGratingPart, null);
    }
    controls.enabled = true;
    renderer.domElement.style.cursor = "";
    renderer.domElement.releasePointerCapture?.(event.pointerId);
  });

  renderer.domElement.addEventListener("pointerleave", () => {
    if (!detectorDragActive && !gratingDragActive) {
      renderer.domElement.style.cursor = "";
      setSelectedSubPart(null, null);
    }
  });

  renderer.domElement.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && gratingDragActive) {
      gratingDragActive = null;
      controls.enabled = true;
      renderer.domElement.style.cursor = "";
      setSelectedSubPart(null, null);
      return;
    }

    const part = state.selectedPart;
    if (part !== "excitation" && part !== "emission") {
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const range = GRATING_RANGES[part];
      emitGratingAngle(part, event.key === "Home" ? range.min : range.max);
      return;
    }

    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const direction = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : -1;
    const step = event.shiftKey ? 1 : 0.2;
    emitGratingAngle(part, currentGratingAngle(part) + direction * step);
  });

  transformControls.addEventListener("dragging-changed", (event) => {
    isTransformDragging = Boolean(event.value);
    controls.enabled = !event.value;
  });

  transformControls.addEventListener("objectChange", () => {
    if (!isTransformDragging) {
      return;
    }

    constrainTransformedPart();
    render();
  });

  function resetView() {
    camera.position.set(5.8, 4.35, 5.55);
    controls.target.set(-0.85, 0.72, 1.15);
    controls.update();
    render();
  }

  let animationFrame = 0;
  function animate(time = 0) {
    if (!reducedMotion && components.sample.userData.plume) {
      components.sample.userData.plume.rotation.y = time * 0.0002;
    }

    controls.update();
    render();

    if (!reducedMotion) {
      animationFrame = window.requestAnimationFrame(animate);
    }
  }

  controls.addEventListener("change", render);
  transformControls.addEventListener("change", render);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();
  updateHotspots();
  selectPart(state.selectedPart);
  animate();

  return {
    available: true,
    update,
    selectPart,
    resetView,
    dispose() {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      resizeObserver.disconnect();
      transformControls.dispose();
      controls.dispose();
      renderer.dispose();
      host.textContent = "";
    },
  };
}
