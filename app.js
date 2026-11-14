import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import marsModelUrl from './assets/24881_Mars_1_6792.glb?url';
import moonModelUrl from './assets/moon.glb?url';

const canvas = document.querySelector('#mars-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0, 5.1);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
renderer.setClearColor(0x000000, 1);

const root = new THREE.Group();
scene.add(root);
const globe = new THREE.Group();
root.add(globe);
let activeModel = null;
let activePlanet = 'mars';
const planetModels = { mars: null, moon: null };

function addPlanetModel(planet, model) {
  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z);
  model.position.sub(center);
  const displayDiameter = planet === 'moon' ? 2.55 : 2.96;
  model.scale.setScalar(displayDiameter / maxDimension);
  model.traverse((part) => {
    if (!part.isMesh) return;
    part.castShadow = false;
    part.receiveShadow = false;
    if (part.material) {
      part.material.roughness = Math.max(part.material.roughness ?? 0, 0.8);
      part.material.needsUpdate = true;
    }
  });
  planetModels[planet] = model;
  if (activePlanet === planet) {
    if (activeModel) globe.remove(activeModel);
    activeModel = model;
    globe.add(activeModel);
  }
}

function loadPlanet(planet, url) {
  loader.load(url, ({ scene: model }) => addPlanetModel(planet, model), undefined, (error) => {
    const label = planet === 'mars' ? 'Mars' : 'Moon';
    canvas.insertAdjacentHTML('afterend', `<p class="load-message">Could not load the ${label} model. Check that its GLB file is present and open the site using a local web server.</p>`);
    console.error(`${label} model failed to load:`, error);
  });
}

let seed = 914237;
const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const loader = new GLTFLoader();
loadPlanet('mars', marsModelUrl);
loadPlanet('moon', moonModelUrl);

const planetButtons = document.querySelectorAll('[data-planet]');
planetButtons.forEach((button) => button.addEventListener('click', () => {
  const planet = button.dataset.planet;
  activePlanet = planet;
  for (const { dots } of orbitMarkers) {
    dots.position.copy(planet === 'moon' ? dots.userData.moonPosition : dots.userData.marsPosition);
  }
  targetLighting = planet === 'moon' ? lightingPresets.moon : lightingPresets.mars;
  planetButtons.forEach((option) => {
    const selected = option === button;
    option.classList.toggle('is-active', selected);
    option.setAttribute('aria-pressed', String(selected));
  });
  document.querySelector('main').setAttribute('aria-label', `Interactive view of ${planet === 'mars' ? 'Mars' : 'the Moon'}`);
  canvas.setAttribute('aria-label', `${planet === 'mars' ? 'Mars' : 'The Moon'} in space. Drag to rotate and scroll to zoom.`);
  if (planetModels[planet]) {
    if (activeModel) globe.remove(activeModel);
    activeModel = planetModels[planet];
    globe.add(activeModel);
  }
}));

// Replace these destinations with the lander pages when they are ready.
const landerPages = { mars: 'mars-landers.html', moon: 'moon-landers.html' };
canvas.addEventListener('planetselect', (event) => {
  const { planet } = event.detail;
  window.location.href = landerPages[planet];
});

const ambient = new THREE.AmbientLight(0x938b88, 1.2);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffd1ae, 3.2);
sun.position.set(-4, 2.4, 5);
scene.add(sun);
const rim = new THREE.DirectionalLight(0xc64d2b, 1.9);
rim.position.set(3, -1.5, -3);
scene.add(rim);
const lightingPresets = {
  mars: { ambient: new THREE.Color(0x938b88), sun: new THREE.Color(0xffd1ae), rim: new THREE.Color(0xc64d2b), ambientIntensity: 1.2, sunIntensity: 3.2, rimIntensity: 1.9 },
  moon: { ambient: new THREE.Color(0x9ba9bd), sun: new THREE.Color(0xdce8ff), rim: new THREE.Color(0x7896d1), ambientIntensity: 1.2, sunIntensity: 3.2, rimIntensity: 1.5 },
};
let targetLighting = lightingPresets.mars;

const starCount = 300;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  // Keep stars in a distant shell so Mars and its orbits sit clearly in front.
  const radius = 18 + random() * 24;
  const theta = random() * Math.PI * 2;
  const z = random() * 2 - 1;
  const planar = Math.sqrt(1 - z * z);
  starPositions[i * 3] = radius * planar * Math.cos(theta);
  starPositions[i * 3 + 1] = radius * planar * Math.sin(theta);
  starPositions[i * 3 + 2] = radius * z;
}
const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starField = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, sizeAttenuation: false, transparent: true, opacity: 0.78 }));
globe.add(starField);

// Mars's model uses Y as its polar axis, so the equatorial orbit lies in the XZ plane.
const orbitSpecs = [
  { radius: 1.64, flattening: 0.96, tilt: 0, rotation: 0, count: 160, phase: 0.01 },
  { radius: 1.98, flattening: 0.9, tilt: -0.34, rotation: 0.25, count: 190, phase: 0.025 },
  { radius: 2.32, flattening: 0.78, tilt: 0.2, rotation: -0.1, count: 220, phase: 0.04 },
  { radius: 2.12, flattening: 1, tilt: Math.PI / 2, rotation: 0.12, count: 200, phase: 0.018 },
];
const moonOrbitOffsets = [
  [0.1, 0.04, -0.12],
  [-0.16, 0.1, 0.08],
  [0.18, -0.08, 0.16],
  [-0.08, 0.16, -0.1],
];
const orbitMarkers = [];

for (const [orbitIndex, orbit] of orbitSpecs.entries()) {
  const positions = [];
  for (let i = 0; i < orbit.count; i++) {
    const angle = (i / orbit.count) * Math.PI * 2 + orbit.phase;
    positions.push(
      Math.cos(angle) * orbit.radius,
      0,
      Math.sin(angle) * orbit.radius * orbit.flattening
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const dots = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xc4a893,
      size: 1.25,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    })
  );
  dots.rotation.set(orbit.tilt, 0, orbit.rotation);
  dots.userData.marsPosition = new THREE.Vector3();
  dots.userData.moonPosition = new THREE.Vector3(...moonOrbitOffsets[orbitIndex]);
  globe.add(dots);

  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffc68a, transparent: true, opacity: 1 })
  );
  globe.add(marker);
  orbitMarkers.push({ marker, orbit, dots, phase: random() * Math.PI * 2, speed: 0.16 + random() * 0.1 });
}

const resize = () => {
  const { width, height } = canvas.getBoundingClientRect();
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};
new ResizeObserver(resize).observe(canvas);
resize();

let targetDistance = 5.1;
const minDistance = 3.4;
const maxDistance = 8;
const zoomBy = (amount) => { targetDistance = THREE.MathUtils.clamp(targetDistance + amount, minDistance, maxDistance); };
document.querySelector('#zoom-in').addEventListener('click', () => zoomBy(-0.55));
document.querySelector('#zoom-out').addEventListener('click', () => zoomBy(0.55));
canvas.addEventListener('wheel', (event) => { event.preventDefault(); zoomBy(event.deltaY * 0.006); }, { passive: false });

let dragging = false;
let pointerStart = null;
let previousX = 0;
let previousY = 0;
let velocityX = 0;
let velocityY = 0;
canvas.addEventListener('pointerdown', (event) => {
  dragging = true;
  pointerStart = { x: event.clientX, y: event.clientY };
  previousX = event.clientX;
  previousY = event.clientY;
  velocityX = velocityY = 0;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  const dx = event.clientX - previousX;
  const dy = event.clientY - previousY;
  previousX = event.clientX;
  previousY = event.clientY;
  velocityX = dx * 0.004;
  velocityY = dy * 0.003;
  globe.rotation.y += velocityX;
  globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x + velocityY, -0.65, 0.65);
});
canvas.addEventListener('pointerup', (event) => {
  const wasClick = pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) < 7;
  dragging = false;
  pointerStart = null;
  if (!wasClick) return;

  const bounds = canvas.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);
  const modelMeshes = [];
  activeModel?.traverse((part) => { if (part.isMesh) modelMeshes.push(part); });
  if (!raycaster.intersectObjects(modelMeshes, false).length) return;

  canvas.dispatchEvent(new CustomEvent('planetselect', { detail: { planet: activePlanet } }));
});
const release = () => { dragging = false; pointerStart = null; };
canvas.addEventListener('pointercancel', release);

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  if (!dragging) {
    globe.rotation.y += velocityX + delta * 0.035;
    globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x + velocityY, -0.65, 0.65);
    velocityX *= 0.94;
    velocityY *= 0.92;
  }
  const lightBlend = 1 - Math.exp(-delta * 4);
  ambient.color.lerp(targetLighting.ambient, lightBlend);
  sun.color.lerp(targetLighting.sun, lightBlend);
  rim.color.lerp(targetLighting.rim, lightBlend);
  ambient.intensity = THREE.MathUtils.damp(ambient.intensity, targetLighting.ambientIntensity, 4, delta);
  sun.intensity = THREE.MathUtils.damp(sun.intensity, targetLighting.sunIntensity, 4, delta);
  rim.intensity = THREE.MathUtils.damp(rim.intensity, targetLighting.rimIntensity, 4, delta);
  for (const { marker, orbit, dots, phase, speed } of orbitMarkers) {
    const time = phase + clock.elapsedTime * speed;
    marker.position.set(
      Math.cos(time) * orbit.radius,
      0,
      Math.sin(time) * orbit.radius * orbit.flattening
    );
    marker.position.applyEuler(new THREE.Euler(orbit.tilt, 0, orbit.rotation));
    marker.position.add(dots.position);
    marker.material.opacity = 0.35 + (Math.sin(clock.elapsedTime * 4 + time) + 1) * 0.325;
  }
  camera.position.z = THREE.MathUtils.damp(camera.position.z, targetDistance, 5, delta);
  renderer.render(scene, camera);
}
animate();
