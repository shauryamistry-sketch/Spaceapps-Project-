import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import marsModelUrl from './assets/24881_Mars_1_6792.glb?url';

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

let seed = 914237;
const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const loader = new GLTFLoader();
loader.load(
  marsModelUrl,
  ({ scene: marsModel }) => {
    const bounds = new THREE.Box3().setFromObject(marsModel);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);
    marsModel.position.sub(center);
    marsModel.scale.setScalar(2.96 / maxDimension);
    marsModel.traverse((part) => {
      if (!part.isMesh) return;
      part.castShadow = false;
      part.receiveShadow = false;
      if (part.material) {
        part.material.roughness = Math.max(part.material.roughness ?? 0, 0.8);
        part.material.needsUpdate = true;
      }
    });
    globe.add(marsModel);
  },
  undefined,
  (error) => {
    document.querySelector('#mars-canvas').insertAdjacentHTML('afterend', '<p class="load-message">Could not load assets/24881_Mars_1_6792.glb. Check that the file is present and open the site using a local web server.</p>');
    console.error('Mars model failed to load:', error);
  }
);

scene.add(new THREE.AmbientLight(0x938b88, 1.2));
const sun = new THREE.DirectionalLight(0xffd1ae, 3.2);
sun.position.set(-4, 2.4, 5);
scene.add(sun);
const rim = new THREE.DirectionalLight(0xc64d2b, 1.9);
rim.position.set(3, -1.5, -3);
scene.add(rim);

const starCount = 1800;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const radius = 2.8 + random() * 17;
  const theta = random() * Math.PI * 2;
  const z = random() * 2 - 1;
  const planar = Math.sqrt(1 - z * z);
  starPositions[i * 3] = radius * planar * Math.cos(theta);
  starPositions[i * 3 + 1] = radius * planar * Math.sin(theta);
  starPositions[i * 3 + 2] = radius * z;
}
const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
globe.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 1.7, sizeAttenuation: false, transparent: true, opacity: 0.9 })));

// Mars's model uses Y as its polar axis, so the equatorial orbit lies in the XZ plane.
const orbitSpecs = [
  { radius: 1.64, flattening: 0.96, tilt: 0, rotation: 0, count: 160, phase: 0.01 },
  { radius: 1.98, flattening: 0.9, tilt: -0.34, rotation: 0.25, count: 190, phase: 0.025 },
  { radius: 2.32, flattening: 0.78, tilt: 0.2, rotation: -0.1, count: 220, phase: 0.04 },
];

for (const orbit of orbitSpecs) {
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
  globe.add(dots);
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
let previousX = 0;
let previousY = 0;
let velocityX = 0;
let velocityY = 0;
canvas.addEventListener('pointerdown', (event) => {
  dragging = true;
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
const release = () => { dragging = false; };
canvas.addEventListener('pointerup', release);
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
  camera.position.z = THREE.MathUtils.damp(camera.position.z, targetDistance, 5, delta);
  renderer.render(scene, camera);
}
animate();
