import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/** Angle between two marks on the aperture ring. */
const MARK_STEP = (30 * Math.PI) / 180;
const BLADE_COUNT = 9;
const MODEL_URL = "/models/lens.glb";
const CAMERA_DISTANCE = 6.4;

export type LensScene = {
  /** Resolves true once the model is on screen, false if it could not load. */
  ready: Promise<boolean>;
  /** Moves the ring. Fractions are allowed while dragging. */
  setRing(marks: number): void;
  /** Plays the click response when a new lens is selected. */
  engage(accent: string, direction: number): void;
  dispose(): void;
};

function damp(current: number, target: number, speed: number, seconds: number): number {
  return current + (target - current) * (1 - Math.exp(-seconds * speed));
}

function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.25, "rgba(255,255,255,0.8)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(canvas);
}

function createGlass(name: string): THREE.MeshPhysicalMaterial {
  const inner = name.includes("inner");
  return new THREE.MeshPhysicalMaterial({
    name,
    color: inner ? "#0b0e14" : "#0a0d12",
    roughness: 0.035,
    transparent: true,
    opacity: inner ? 0.42 : 0.34,
    iridescence: inner ? 0.35 : 1,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [200, 600],
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: inner ? 1.8 : 2.6,
    depthWrite: false,
  });
}

function dressMaterial(material: THREE.Material): THREE.Material {
  const name = material.name.toLowerCase();
  if (name.startsWith("glass")) {
    material.dispose();
    return createGlass(material.name);
  }

  const standard = material as THREE.MeshStandardMaterial;
  if (name.startsWith("engrave_white") || name.startsWith("index_dot")) {
    standard.color.set("#ffffff");
    standard.emissive.set(name.startsWith("index_dot") ? "#ffd9a0" : "#f4f1ea");
    standard.emissiveIntensity = 0.85;
    standard.roughness = 0.45;
  } else if (name.startsWith("barrel_black")) {
    standard.envMapIntensity = 1.5;
    standard.roughness = 0.36;
  } else if (name.startsWith("chrome") || name.startsWith("ring_silver")) {
    standard.envMapIntensity = 1.5;
  }
  return material;
}

export function createLensScene(container: HTMLElement, initialAccent: string): LensScene {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  camera.position.set(0, 0.05, CAMERA_DISTANCE);

  const environmentGenerator = new THREE.PMREMGenerator(renderer);
  const environment = environmentGenerator.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.75;

  const key = new THREE.DirectionalLight("#fff1e0", 2.1);
  key.position.set(-3.2, 2.6, 4.2);
  const rim = new THREE.DirectionalLight("#e8eeff", 3.2);
  rim.position.set(2.4, 2.2, -4.5);
  const accentRim = new THREE.DirectionalLight(initialAccent, 2);
  accentRim.position.set(-3, -1.4, -3.5);
  scene.add(key, rim, accentRim);

  const sway = new THREE.Group();
  const pose = new THREE.Group();
  pose.rotation.set(0.36, -0.58, 0);
  sway.add(pose);
  scene.add(sway);

  const flash = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createGlowTexture(),
      color: initialAccent,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );

  let ring: THREE.Object3D | undefined;
  let focus: THREE.Object3D | undefined;
  let ringBase = 0;
  let focusBase = 0;
  const blades: { blade: THREE.Object3D; base: number }[] = [];
  let disposed = false;

  const ready = new GLTFLoader()
    .loadAsync(MODEL_URL)
    .then((gltf) => {
      if (disposed) return false;

      const model = gltf.scene;
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      model.position.sub(bounds.getCenter(new THREE.Vector3()));
      const fit = new THREE.Group();
      fit.scale.setScalar(2.05 / Math.max(size.x, size.y, size.z));
      fit.add(model);
      pose.add(fit);

      model.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        const dressed = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map(dressMaterial);
        mesh.material = dressed.length === 1 ? dressed[0] : dressed;
        if (dressed.some((material) => material.transparent)) mesh.renderOrder = 2;
      });

      ring = model.getObjectByName("aperture_ring");
      focus = model.getObjectByName("focus_ring");
      ringBase = ring?.rotation.z ?? 0;
      focusBase = focus?.rotation.z ?? 0;
      for (let index = 0; index < BLADE_COUNT; index += 1) {
        const blade = model.getObjectByName(`blade_${index}`);
        if (blade) blades.push({ blade, base: blade.rotation.z });
      }

      flash.scale.setScalar(0.007);
      model.getObjectByName("index_anchor")?.add(flash);
      return true;
    })
    .catch((error: unknown) => {
      console.error("Could not load the lens model", error);
      return false;
    });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ringTarget = 0;
  let ringNow = 0;
  let iris = 0;
  let focusKick = 0;
  let flashAmount = 0;
  let swing = 0;
  let swayTime = 0;
  let frame = 0;
  let lastFrame = 0;

  function resize() {
    const { width, height } = container.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = camera.aspect < 0.9 ? (CAMERA_DISTANCE / Math.max(camera.aspect, 0.6)) * 0.95 : CAMERA_DISTANCE;
    camera.updateProjectionMatrix();
  }

  function render(now: number) {
    const seconds = Math.min((now - lastFrame) / 1000, 0.1);
    lastFrame = now;

    ringNow = reducedMotion ? ringTarget : damp(ringNow, ringTarget, 14, seconds);
    iris = damp(iris, 0, 3.2, seconds);
    focusKick = damp(focusKick, 0, 4, seconds);
    swing = reducedMotion ? 0 : swing * Math.exp(-seconds * 5.5);
    flashAmount = Math.max(0, flashAmount - seconds * 1.6);
    if (!reducedMotion) swayTime += seconds;

    if (ring) ring.rotation.z = ringBase + ringNow * MARK_STEP;
    if (focus) focus.rotation.z = focusBase + focusKick * 0.35 + Math.sin((swayTime / 14) * Math.PI * 2) * 0.55;
    blades.forEach(({ blade, base }) => {
      blade.rotation.z = base + iris * 0.32;
    });
    (flash.material as THREE.SpriteMaterial).opacity = Math.min(1, flashAmount) * 0.9;

    const phase = (swayTime / 13) * Math.PI * 2;
    sway.rotation.y = 0.17 + swing + Math.sin(phase) * 0.14;
    sway.rotation.x = 0.05 + Math.abs(swing) * 0.2 + Math.sin(phase * 2 + 0.8) * 0.045;

    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  }

  function stop() {
    cancelAnimationFrame(frame);
  }

  function start() {
    stop();
    lastFrame = performance.now();
    frame = requestAnimationFrame(render);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) start();
    else stop();
  });
  visibilityObserver.observe(container);

  return {
    ready,
    setRing(marks) {
      ringTarget = marks;
    },
    engage(accent, direction) {
      (flash.material as THREE.SpriteMaterial).color.set(accent).multiplyScalar(2.2);
      accentRim.color.set(accent);
      flashAmount = 1.6;
      iris = 1;
      focusKick = 1;
      if (!reducedMotion) swing = Math.max(-0.22, Math.min(0.22, swing + direction * 0.12));
    },
    dispose() {
      disposed = true;
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((material) => material.dispose());
      });
      (flash.material as THREE.SpriteMaterial).map?.dispose();
      flash.material.dispose();
      environment.dispose();
      environmentGenerator.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
