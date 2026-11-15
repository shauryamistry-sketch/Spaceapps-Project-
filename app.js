import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import marsModelUrl from './assets/24881_Mars_1_6792.glb?url';
import moonModelUrl from './assets/moon.glb?url';
import { createOrbitalPanel, ORBITAL_PROFILES } from './orbital-panel.js';

const orbitalPanel = createOrbitalPanel(document.querySelector('main'));

const canvas = document.querySelector('#mars-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0, 5.1);
let targetDistance = 5.1;
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
const requestedPlanet = new URLSearchParams(window.location.search).get('planet');
let activePlanet = requestedPlanet === 'moon' ? 'moon' : 'mars';
const planetModels = { mars: null, moon: null };
const requestedModels = new Set();

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
  if (requestedModels.has(planet)) return;
  requestedModels.add(planet);
  loader.load(url, ({ scene: model }) => addPlanetModel(planet, model), undefined, (error) => {
    const label = planet === 'mars' ? 'Mars' : 'Moon';
    canvas.insertAdjacentHTML('afterend', `<p class="load-message">Could not load the ${label} model. Check that its GLB file is present and open the site using a local web server.</p>`);
    console.error(`${label} model failed to load:`, error);
  });
}

let seed = 914237;
const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const loader = new GLTFLoader();
const modelUrls = { mars: marsModelUrl, moon: moonModelUrl };
loadPlanet(activePlanet, modelUrls[activePlanet]);

const landerPages = {
  mars: `${import.meta.env.BASE_URL}mars-landers.html?planet=mars`,
  moon: `${import.meta.env.BASE_URL}mars-landers.html?planet=moon`,
};
const planetButtons = document.querySelectorAll('[data-planet]');
planetButtons.forEach((button) => {
  const selected = button.dataset.planet === activePlanet;
  button.classList.toggle('is-active', selected);
  button.setAttribute('aria-pressed', String(selected));
});
const initialPlanetName = activePlanet === 'mars' ? 'Mars' : 'the Moon';
document.querySelector('main').setAttribute('aria-label', `Interactive view of ${initialPlanetName}`);
canvas.setAttribute('aria-label', `${initialPlanetName} in space. Drag to rotate and scroll to zoom.`);
planetButtons.forEach((button) => button.addEventListener('click', () => {
  const planet = button.dataset.planet;
  activePlanet = planet;
  orbitalPanel.setPlanet(planet);
  targetLighting = planet === 'moon' ? lightingPresets.moon : lightingPresets.mars;
  planetButtons.forEach((option) => {
    const selected = option === button;
    option.classList.toggle('is-active', selected);
    option.setAttribute('aria-pressed', String(selected));
  });
  const planetName = planet === 'mars' ? 'Mars' : 'the Moon';
  document.querySelector('main').setAttribute('aria-label', `Interactive view of ${planetName}`);
  canvas.setAttribute('aria-label', `${planetName} in space. Drag to rotate and scroll to zoom.`);
  if (planetModels[planet]) {
    if (activeModel) globe.remove(activeModel);
    activeModel = planetModels[planet];
    globe.add(activeModel);
  } else {
    loadPlanet(planet, modelUrls[planet]);
  }
}));

canvas.addEventListener('planetselect', (event) => {
  const { planet } = event.detail;
  if (landerPages[planet]) window.location.href = landerPages[planet];
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
let targetLighting = lightingPresets[activePlanet];

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

// Route profiles use published mission orbit elements. The radial scale is
// compressed so high-apogee missions remain visible beside the planet.
const orbitGroup = new THREE.Group();
globe.add(orbitGroup);
const bodyRadii = { mars: 1.48, moon: 1.275 };
const planetRadiusKm = { mars: 3389.5, moon: 1737.4 };
const orbitScaleAltitudes = { mars: 71000, moon: 100 };
let activeOrbit = null;
let orbitLine = null;
let orbitMarker = null;
const currentOrbitColor = new THREE.Color(0xf0a36d);
const targetOrbitColor = currentOrbitColor.clone();

function makeOrbitPoint(profile, planet, anomaly) {
  const bodyRadius = bodyRadii[planet];
  const maxAltitude = orbitScaleAltitudes[planet];
  const altitudeOffset = (altitude) => {
    const fraction = Math.log1p(altitude / planetRadiusKm[planet])
      / Math.log1p(maxAltitude / planetRadiusKm[planet]);
    return 0.2 + 0.75 * Math.sqrt(THREE.MathUtils.clamp(fraction, 0, 1));
  };
  const periapsis = bodyRadius + altitudeOffset(profile.periapsisKm);
  const apoapsis = bodyRadius + altitudeOffset(profile.apoapsisKm);
  const semiMajor = (periapsis + apoapsis) / 2;
  const eccentricity = (apoapsis - periapsis) / (apoapsis + periapsis);
  const radius = semiMajor * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(anomaly));
  const position = new THREE.Vector3(radius * Math.cos(anomaly), 0, radius * Math.sin(anomaly));
  position.applyEuler(new THREE.Euler(
    THREE.MathUtils.degToRad(profile.inclination),
    0,
    THREE.MathUtils.degToRad(profile.ascendingNode ?? 24)
  ));
  return position;
}

function setOrbitalProfile(mission) {
  orbitGroup.clear();
  orbitLine?.geometry.dispose();
  orbitLine?.material.dispose();
  orbitMarker?.geometry.dispose();
  orbitMarker?.material.dispose();
  orbitLine = null;
  orbitMarker = null;
  const profile = ORBITAL_PROFILES[mission?.id];
  activeOrbit = profile ? { ...profile, planet: activePlanet, phase: random() * Math.PI * 2 } : null;
  const readout = document.querySelector('#orbit-readout');
  if (!activeOrbit) {
    targetDistance = 5.1;
    readout.hidden = true;
    return;
  }

  readout.hidden = false;
  readout.querySelector('strong').textContent = mission.name;
  readout.querySelector('small').textContent = profile.orbitLabel;

  const route = Array.from({ length: 361 }, (_, index) => makeOrbitPoint(activeOrbit, activePlanet, (index / 360) * Math.PI * 2));
  const geometry = new THREE.BufferGeometry().setFromPoints(route);
  targetOrbitColor.set(activePlanet === 'moon' ? 0xb7d4f5 : 0xf0a36d);
  orbitLine = new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({
    color: currentOrbitColor, transparent: true, opacity: 0.82, depthWrite: false,
  }));
  orbitGroup.add(orbitLine);
  orbitMarker = new THREE.Mesh(
    new THREE.SphereGeometry(0.037, 12, 12),
    new THREE.MeshBasicMaterial({ color: currentOrbitColor.clone().lerp(targetOrbitColor, 0.3) })
  );
  orbitGroup.add(orbitMarker);

  const farthestPoint = Math.max(...route.map(point => point.length()));
  targetDistance = Math.max(5.1, farthestPoint / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.08);
}

document.querySelector('main').addEventListener('orbitalmissionselect', (event) => setOrbitalProfile(event.detail.mission));
orbitalPanel.setPlanet(activePlanet);

const resize = () => {
  const { width, height } = canvas.getBoundingClientRect();
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};
new ResizeObserver(resize).observe(canvas);
resize();

const minDistance = 3.4;
const maxDistance = 14;
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
  currentOrbitColor.lerp(targetOrbitColor, lightBlend);
  if (orbitLine) orbitLine.material.color.copy(currentOrbitColor);
  if (orbitMarker) orbitMarker.material.color.copy(currentOrbitColor).lerp(targetOrbitColor, 0.3);
  ambient.color.lerp(targetLighting.ambient, lightBlend);
  sun.color.lerp(targetLighting.sun, lightBlend);
  rim.color.lerp(targetLighting.rim, lightBlend);
  ambient.intensity = THREE.MathUtils.damp(ambient.intensity, targetLighting.ambientIntensity, 4, delta);
  sun.intensity = THREE.MathUtils.damp(sun.intensity, targetLighting.sunIntensity, 4, delta);
  rim.intensity = THREE.MathUtils.damp(rim.intensity, targetLighting.rimIntensity, 4, delta);
  if (activeOrbit && orbitMarker) {
    const time = activeOrbit.phase + clock.elapsedTime * 0.16;
    orbitMarker.position.copy(makeOrbitPoint(activeOrbit, activeOrbit.planet, time));
  }
  camera.position.z = THREE.MathUtils.damp(camera.position.z, targetDistance, 5, delta);
  renderer.render(scene, camera);
}
animate();
