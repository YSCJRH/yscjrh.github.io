import * as THREE from "../../vendor/three/three.module.js";
import { OrbitControls } from "../../vendor/three/addons/controls/OrbitControls.js";
import { TransformControls } from "../../vendor/three/addons/controls/TransformControls.js";
import WebGL from "../../vendor/three/addons/capabilities/WebGL.js";

const PART_ORDER = ["source", "excitation", "sample", "emission", "detector", "output"];
const BENCH_Y = 0.64;
const SOURCE_OFFSET_SCALE = 260;
const SAMPLE_OFFSET_SCALE = 220;
const DETECTOR_RADIUS = 3.58;
const DETECTOR_MIN_ANGLE = 80;
const DETECTOR_MAX_ANGLE = 100;
const SOURCE_BASE_POSITION = new THREE.Vector3(-4.0, BENCH_Y, 0);
const SAMPLE_BASE_POSITION = new THREE.Vector3(0, BENCH_Y + 0.12, 0);

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
  context.clearRect(0, 0, canvas.width, canvas.height);
  let fontSize = options.fontSize || 42;
  do {
    context.font = `700 ${fontSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
    fontSize -= 2;
  } while (context.measureText(text).width > canvas.width - 34 && fontSize > 22);
  context.fillStyle = "rgba(237, 237, 239, 0.92)";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    })
  );
  sprite.scale.set(options.width || 1.55, options.height || 0.38, 1);
  return sprite;
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

function makeBoxComponent({ width, height, depth, color, label, part }) {
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
  labelSprite.position.set(0, -height * 0.82, 0);

  group.add(mesh, edge, labelSprite);
  group.userData.mainMesh = mesh;
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

function createMonochromator(label, part) {
  const group = makeBoxComponent({
    width: 1.34,
    height: 0.9,
    depth: 1.05,
    color: 0x2f335a,
    label,
    part,
  });

  const slitMaterial = makeMaterial(0xdde7ff, { transparent: true, opacity: 0.62, emissive: 0x6f88ff, emissiveIntensity: 0.16 });
  const gratingMaterial = makeMaterial(0x86fff0, { transparent: true, opacity: 0.7, emissive: 0x52f0d3, emissiveIntensity: 0.2 });
  const entrySlit = createSlitAssembly(slitMaterial);
  const exitSlit = createSlitAssembly(slitMaterial);
  const grating = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.04, 0.42), gratingMaterial);
  const collimatingMirror = createMirrorPlate();
  const focusingMirror = createMirrorPlate();
  const selectedBand = createBeam(0x52f0d3, 0.015, 0.46);
  const selectedBandGlow = createBeam(0x52f0d3, 0.032, 0.14);
  const fan = new THREE.Group();

  entrySlit.position.set(-0.46, 0.03, 0.46);
  exitSlit.position.set(0.46, 0.03, -0.46);
  grating.position.set(0, 0.04, 0);
  grating.rotation.y = Math.PI / 5;
  collimatingMirror.position.set(-0.25, 0.2, -0.2);
  collimatingMirror.rotation.y = -Math.PI / 5;
  focusingMirror.position.set(0.25, 0.2, 0.2);
  focusingMirror.rotation.y = Math.PI / 5;
  fan.add(createDispersionFan(0x6f88ff, -0.12), createDispersionFan(0x52f0d3, 0), createDispersionFan(0xffd166, 0.12));

  setCylinderBetween(selectedBand, new THREE.Vector3(0, 0.16, 0), new THREE.Vector3(0.46, 0.16, -0.46));
  setCylinderBetween(selectedBandGlow, new THREE.Vector3(0, 0.16, 0), new THREE.Vector3(0.46, 0.16, -0.46));
  group.add(entrySlit, exitSlit, collimatingMirror, focusingMirror, grating, fan, selectedBandGlow, selectedBand);
  group.userData.grating = grating;
  group.userData.entrySlit = entrySlit;
  group.userData.exitSlit = exitSlit;
  group.userData.selectedBand = selectedBand;
  group.userData.selectedBandGlow = selectedBandGlow;
  group.userData.fan = fan;
  group.userData.cutaway = [entrySlit, exitSlit, collimatingMirror, focusingMirror, grating, fan, selectedBandGlow, selectedBand];
  return group;
}

function updateMonochromatorCutaway(monochromator, angleDeg, selectedColor, slitWidthUm) {
  if (!monochromator?.userData?.grating) {
    return;
  }

  monochromator.userData.grating.rotation.y = THREE.MathUtils.degToRad(angleDeg);
  setSlitGap(monochromator.userData.entrySlit, slitWidthUm);
  setSlitGap(monochromator.userData.exitSlit, slitWidthUm);
  const slitProgress = THREE.MathUtils.clamp((slitWidthUm - 100) / 900, 0, 1);
  const bandShift = THREE.MathUtils.clamp((angleDeg - 18) * 0.012, -0.13, 0.13);
  const selectedStart = new THREE.Vector3(-0.02, 0.16, bandShift * 0.35);
  const selectedEnd = new THREE.Vector3(0.46, 0.16, -0.46 + bandShift);

  setCylinderBetween(monochromator.userData.selectedBand, selectedStart, selectedEnd);
  setCylinderBetween(monochromator.userData.selectedBandGlow, selectedStart, selectedEnd);

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
}

function updateSampleAlignmentIndicator(component, derived) {
  const ring = component?.userData?.alignmentRing;
  if (!ring) {
    return;
  }

  const overlap = derived.alignment.overlapFactor;
  const sampleOffset = Math.abs(derived.alignment.sampleFactor - 1);
  ring.material.color.set(overlap < 0.72 ? 0xffd166 : 0x7df5df);
  ring.material.opacity = 0.16 + overlap * 0.36;
  ring.scale.setScalar(1 + sampleOffset * 0.45);
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

  base.position.y = -0.34;
  block.position.y = 0.02;
  cavity.position.set(-0.352, 0.02, 0);
  grooveA.position.set(-0.356, 0.02, -0.19);
  grooveB.position.set(-0.356, 0.02, 0.19);
  label.position.set(0, -0.74, 0);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(block.geometry),
    new THREE.LineBasicMaterial({ color: 0x526070, transparent: true, opacity: 0.25 })
  );
  edges.position.copy(block.position);

  group.add(base, block, edges, cavity, grooveA, grooveB, label);
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

export function createInstrumentScene({ host, state, onSelectPart, onGeometryChange, reducedMotion = false }) {
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
  transformControls.setSize(0.68);
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
  const detectorDragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -BENCH_Y);
  const detectorDragPoint = new THREE.Vector3();

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
  sampleLabel.position.set(0, -0.9, 0);
  components.sample.add(samplePlume, alignmentRing, sampleGlass, sampleEdges, sampleLabel);
  components.sample.position.copy(SAMPLE_BASE_POSITION);
  components.sample.userData.mainMesh = sampleGlass;
  components.sample.userData.plume = samplePlume;
  components.sample.userData.alignmentRing = alignmentRing;
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

  components.output = makeBoxComponent({ width: 1.5, height: 0.86, depth: 0.16, color: 0x162039, label: "Spectrum / 谱图", part: "output" });
  components.output.position.set(2.1, BENCH_Y + 0.1, 3.2);
  components.output.rotation.y = -Math.PI / 5;
  root.add(components.output);

  const screenTrace = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.52, 0.04, 0.09),
      new THREE.Vector3(-0.26, 0.12, 0.09),
      new THREE.Vector3(-0.03, 0.34, 0.09),
      new THREE.Vector3(0.22, 0.18, 0.09),
      new THREE.Vector3(0.48, 0.42, 0.09),
    ]),
    new THREE.LineBasicMaterial({ color: 0x8dfff0, transparent: true, opacity: 0.92 })
  );
  components.output.add(screenTrace);

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
    render();
  }

  function selectPart(part) {
    Object.entries(components).forEach(([name, group]) => {
      const selected = name === part;
      const mesh = group.userData.mainMesh;
      if (mesh?.material) {
        mesh.material.emissiveIntensity = selected ? 0.22 : 0.04;
        mesh.material.opacity = selected ? 0.86 : mesh.material.opacity;
      }
      group.scale.setScalar(selected ? 1.045 : 1);
    });

    Object.entries(hotspots).forEach(([name, mesh]) => {
      mesh.material.opacity = name === part ? 1 : 0.46;
      mesh.scale.setScalar(name === part ? 1.45 : 1);
    });

    if ((part === "source" || part === "sample") && activeTransformPart === part) {
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
    const sampleOffset = currentState.sample.offsetUm / SAMPLE_OFFSET_SCALE;
    const sourceOffset = currentState.source.offsetUm / SOURCE_OFFSET_SCALE;
    components.source.position.copy(SOURCE_BASE_POSITION).add(new THREE.Vector3(0, 0, sourceOffset));
    components.sample.position.copy(SAMPLE_BASE_POSITION).add(new THREE.Vector3(sampleOffset * 0.18, 0, sampleOffset));

    const detectorPos = detectorPosition(currentState.detector.angleDeg, components.sample.position);
    components.detector.position.copy(detectorPos);
    components.detector.lookAt(components.sample.position.x, BENCH_Y, components.sample.position.z);

    const outputPos = new THREE.Vector3(2.1, BENCH_Y + 0.1, 3.2);
    components.output.position.copy(outputPos);

    updateMonochromatorCutaway(
      components.excitation,
      currentState.exMono.gratingAngleDeg,
      derived.beams.excitationColor,
      currentState.slit.widthUm
    );
    updateMonochromatorCutaway(
      components.emission,
      currentState.emMono.gratingAngleDeg,
      derived.beams.emissionColor,
      currentState.slit.widthUm
    );

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
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

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
    } else if (object === components.sample) {
      object.position.y = SAMPLE_BASE_POSITION.y;
      object.position.z = THREE.MathUtils.clamp(object.position.z, -120 / SAMPLE_OFFSET_SCALE, 120 / SAMPLE_OFFSET_SCALE);
      object.position.x = SAMPLE_BASE_POSITION.x + object.position.z * 0.18;
      onGeometryChange?.({
        sampleOffsetUm: object.position.z * SAMPLE_OFFSET_SCALE,
      });
    }
  }

  renderer.domElement.addEventListener("pointerdown", (event) => {
    if (isTransformDragging) {
      return;
    }

    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(selectable, true).find((entry) => entry.object.userData.part);

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

      activeTransformPart = hit.object.userData.part === "source" || hit.object.userData.part === "sample"
        ? hit.object.userData.part
        : null;
      onSelectPart?.(hit.object.userData.part);
    }
  });

  renderer.domElement.addEventListener("pointermove", (event) => {
    if (!detectorDragActive) {
      return;
    }

    updateDetectorAngleFromPointer(event);
  });

  renderer.domElement.addEventListener("pointerup", (event) => {
    if (!detectorDragActive) {
      return;
    }

    detectorDragActive = false;
    controls.enabled = true;
    renderer.domElement.releasePointerCapture?.(event.pointerId);
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
