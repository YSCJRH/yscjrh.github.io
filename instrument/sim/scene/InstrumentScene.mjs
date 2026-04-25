import * as THREE from "../../vendor/three/three.module.js";
import { OrbitControls } from "../../vendor/three/addons/controls/OrbitControls.js";
import WebGL from "../../vendor/three/addons/capabilities/WebGL.js";

const PART_ORDER = ["source", "excitation", "sample", "emission", "detector", "output"];
const BENCH_Y = 0.64;

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

function createLabel(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = "700 42px system-ui, -apple-system, Segoe UI, sans-serif";
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
  sprite.scale.set(1.55, 0.38, 1);
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
  const slitGeometry = new THREE.BoxGeometry(0.05, 0.55, 0.08);
  const entrySlit = new THREE.Mesh(slitGeometry, slitMaterial);
  const exitSlit = new THREE.Mesh(slitGeometry, slitMaterial);
  const grating = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.04, 0.42), gratingMaterial);

  entrySlit.position.set(-0.42, 0.03, 0.47);
  exitSlit.position.set(0.42, 0.03, -0.47);
  grating.position.set(0, 0.04, 0);
  grating.rotation.y = Math.PI / 5;

  group.add(entrySlit, exitSlit, grating);
  group.userData.grating = grating;
  group.userData.cutaway = [entrySlit, exitSlit, grating];
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

export function createInstrumentScene({ host, state, onSelectPart, reducedMotion = false }) {
  if (!host || !WebGL.isWebGL2Available()) {
    return {
      available: false,
      reason: "WebGL 2 is not available.",
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
  camera.position.set(5.6, 4.1, 6.3);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = !reducedMotion;
  controls.dampingFactor = 0.08;
  controls.minDistance = 4.2;
  controls.maxDistance = 10.5;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.target.set(-0.5, 0.75, 1.0);

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
  components.source = makeBoxComponent({ width: 1.0, height: 0.82, depth: 0.9, color: 0x282c4c, label: "Light source", part: "source" });
  components.source.position.set(-4.0, BENCH_Y, 0);
  root.add(components.source);

  components.excitation = createMonochromator("Excitation mono", "excitation");
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
  const sampleLabel = createLabel("Sample cell");
  sampleLabel.position.set(0, -0.9, 0);
  components.sample.add(samplePlume, sampleGlass, sampleEdges, sampleLabel);
  components.sample.position.set(0, BENCH_Y + 0.12, 0);
  components.sample.userData.mainMesh = sampleGlass;
  components.sample.userData.plume = samplePlume;
  markSelectable(components.sample, "sample");
  root.add(components.sample);

  const stopGroup = new THREE.Group();
  const stopBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.5), makeMaterial(0x111624));
  const stopBlade = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.72, 0.62),
    makeMaterial(0x151c2b, { emissive: 0x6f88ff, emissiveIntensity: 0.05 })
  );
  stopBlade.rotation.z = Math.PI / 6;
  stopBlade.position.y = 0.35;
  stopGroup.add(stopBase, stopBlade);
  stopGroup.position.set(1.6, BENCH_Y - 0.28, 0);
  root.add(stopGroup);

  components.emission = createMonochromator("Emission mono", "emission");
  components.emission.position.set(0, BENCH_Y, 2.05);
  components.emission.rotation.y = Math.PI / 2;
  root.add(components.emission);

  components.detector = makeBoxComponent({ width: 0.94, height: 0.86, depth: 0.94, color: 0x2d314f, label: "Detector", part: "detector" });
  components.detector.position.set(0, BENCH_Y, 3.58);
  root.add(components.detector);

  components.output = makeBoxComponent({ width: 1.5, height: 0.86, depth: 0.16, color: 0x162039, label: "Spectrum", part: "output" });
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

  const beams = {
    excitation: createBeam(0x6f88ff, 0.035, 0.82),
    residual: createBeam(0x70809a, 0.018, 0.22),
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

  function detectorPosition(angleDeg) {
    const radius = 3.58;
    const theta = THREE.MathUtils.degToRad(angleDeg);
    return new THREE.Vector3(radius * Math.cos(theta), BENCH_Y, radius * Math.sin(theta));
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

    render();
  }

  function update(derived, currentState) {
    const sampleOffset = currentState.sample.offsetUm / 220;
    const sourceOffset = currentState.source.offsetUm / 260;
    components.source.position.z = sourceOffset;
    components.sample.position.x = sampleOffset * 0.18;
    components.sample.position.z = sampleOffset;

    const detectorPos = detectorPosition(currentState.detector.angleDeg);
    components.detector.position.copy(detectorPos);
    components.detector.lookAt(components.sample.position.x, BENCH_Y, components.sample.position.z);

    const outputPos = new THREE.Vector3(2.1, BENCH_Y + 0.1, 3.2);
    components.output.position.copy(outputPos);

    components.excitation.userData.grating.rotation.y = THREE.MathUtils.degToRad(currentState.exMono.gratingAngleDeg);
    components.emission.userData.grating.rotation.y = THREE.MathUtils.degToRad(currentState.emMono.gratingAngleDeg);

    beams.excitation.material.color.set(derived.beams.excitationColor);
    beams.excitation.material.opacity = derived.beams.excitationIntensity;
    beams.residual.material.opacity = derived.beams.residualIntensity;
    beams.emission.material.color.set(derived.beams.emissionColor);
    beams.emission.material.opacity = derived.beams.emissionIntensity;
    beams.signal.material.opacity = derived.beams.signalIntensity;

    const samplePoint = components.sample.position.clone().setY(BENCH_Y + 0.1);
    setCylinderBetween(beams.excitation, new THREE.Vector3(-4, BENCH_Y + 0.1, sourceOffset), samplePoint);
    setCylinderBetween(beams.residual, samplePoint, new THREE.Vector3(1.62, BENCH_Y + 0.1, 0));
    setCylinderBetween(beams.emission, samplePoint, components.detector.position.clone().setY(BENCH_Y + 0.1));
    setCylinderBetween(beams.signal, components.detector.position.clone().setY(BENCH_Y + 0.16), components.output.position.clone().setY(BENCH_Y + 0.18));

    if (components.sample.userData.plume) {
      const plumeScale = 0.78 + derived.beams.emissionIntensity * 0.62;
      components.sample.userData.plume.material.opacity = 0.08 + derived.beams.emissionIntensity * 0.18;
      components.sample.userData.plume.scale.set(0.82 * plumeScale, 1.08 * plumeScale, 0.82 * plumeScale);
    }

    updateHotspots();
    selectPart(currentState.selectedPart);
  }

  renderer.domElement.addEventListener("pointerdown", (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(selectable, true).find((entry) => entry.object.userData.part);

    if (hit?.object?.userData?.part) {
      onSelectPart?.(hit.object.userData.part);
    }
  });

  function resetView() {
    camera.position.set(5.6, 4.1, 6.3);
    controls.target.set(-0.5, 0.75, 1.0);
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
      controls.dispose();
      renderer.dispose();
      host.textContent = "";
    },
  };
}
