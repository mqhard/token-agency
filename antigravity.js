import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ---- Scene Setup ---- //
const canvas = document.getElementById('webgl-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x0a0f24, 1);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0f24);
scene.fog = new THREE.FogExp2(0x0a0f24, 0.015);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

// ---- Post Processing ---- //
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.1;
bloomPass.strength = 1.6; // High bloom for neon effect
bloomPass.radius = 0.6;
composer.addPass(bloomPass);

// ---- Particles Constellation Mesh ---- //
const maxParticleCount = 800;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(maxParticleCount * 3);
const particleData = [];

const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2(-10, -10);
const targetMouse = new THREE.Vector2(-10, -10);
let mouseSpeed = 0;

for (let i = 0; i < maxParticleCount; i++) {
    const x = (Math.random() - 0.5) * 160;
    const y = (Math.random() - 0.5) * 160;
    const z = (Math.random() - 0.5) * 80 - 10;

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    particleData.push({
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05),
        basePos: new THREE.Vector3(x, y, z),
        numConnections: 0,
        tempTarget: new THREE.Vector3()
    });
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

// Create circle texture for glowing dots
const canvasDot = document.createElement('canvas');
canvasDot.width = 16; canvasDot.height = 16;
const context = canvasDot.getContext('2d');
context.beginPath();
context.arc(8, 8, 8, 0, 2 * Math.PI, false);
context.fillStyle = "white";
context.fill();
const dotTexture = new THREE.CanvasTexture(canvasDot);

const pointMaterial = new THREE.PointsMaterial({
    color: 0xadff2f, // MATCHES: var(--primary-lime)
    size: 0.8,
    map: dotTexture,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const particles = new THREE.Points(particleGeometry, pointMaterial);
scene.add(particles);

// ---- Connecting Lines ---- //
// Preallocate maximum possible lines based on max count
const segments = maxParticleCount * maxParticleCount;

const linePositions = new Float32Array(segments * 3);
const lineColors = new Float32Array(segments * 3);

const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(linesMesh);

// Setup Line Colors (Lime to Cyan interpolations for brand consistency)
const color1 = new THREE.Color(0xadff2f); // Lime Green
const color2 = new THREE.Color(0x00e5ff); // Cyan

// ---- Background Scene Only (No internal webGL logos) ---- //


// ---- Events ---- //
window.addEventListener('mousemove', (event) => {
    targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// ---- Animation Loop ---- //
const clock = new THREE.Clock();
const effectController = {
    minDistance: 12,
    limitConnections: false,
    maxConnections: 10,
    repulsionRadius: 18,
    repulsionForce: 25
};

function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.1);
    const time = clock.getElapsedTime();

    // Mouse Tracking
    mouse.lerp(targetMouse, 10 * dt);
    mouseSpeed = Math.abs(mouse.x - targetMouse.x) + Math.abs(mouse.y - targetMouse.y);

    raycaster.setFromCamera(mouse, camera);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(interactionPlane, intersectPoint);

    // Asset animations removed

    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    for (let i = 0; i < maxParticleCount; i++) particleData[i].numConnections = 0;

    const repulsionDist = effectController.repulsionRadius + mouseSpeed * 10;

    for (let i = 0; i < maxParticleCount; i++) {
        const particleDataA = particleData[i];

        // Base velocity
        particleDataA.basePos.add(particleDataA.velocity);

        // Bounds wrapping
        if (particleDataA.basePos.y < -80) particleDataA.basePos.y = 80;
        if (particleDataA.basePos.y > 80) particleDataA.basePos.y = -80;
        if (particleDataA.basePos.x < -100) particleDataA.basePos.x = 100;
        if (particleDataA.basePos.x > 100) particleDataA.basePos.x = -100;

        particleDataA.tempTarget.copy(particleDataA.basePos);

        // Interaction with mouse (Repulsion / Parting the network)
        const currentPosVec = new THREE.Vector3(particlePositions[i * 3], particlePositions[i * 3 + 1], particlePositions[i * 3 + 2]);
        const distToMouse = currentPosVec.distanceTo(intersectPoint);

        if (distToMouse < repulsionDist) {
            const dir = new THREE.Vector3().subVectors(currentPosVec, intersectPoint).normalize();
            const force = Math.pow((1.0 - (distToMouse / repulsionDist)), 2) * effectController.repulsionForce;
            particleDataA.tempTarget.add(dir.multiplyScalar(force));
        }

        // Apply easing towards target
        currentPosVec.lerp(particleDataA.tempTarget, 5 * dt);

        // Update buffers
        particlePositions[i * 3] = currentPosVec.x;
        particlePositions[i * 3 + 1] = currentPosVec.y;
        particlePositions[i * 3 + 2] = currentPosVec.z;

        // Line connections check
        if (effectController.limitConnections && particleDataA.numConnections >= effectController.maxConnections) continue;

        for (let j = i + 1; j < maxParticleCount; j++) {
            const particleDataB = particleData[j];
            if (effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections) continue;

            const currentPosVecB = new THREE.Vector3(particlePositions[j * 3], particlePositions[j * 3 + 1], particlePositions[j * 3 + 2]);
            const dist = currentPosVec.distanceTo(currentPosVecB);

            if (dist < effectController.minDistance) {
                particleDataA.numConnections++;
                particleDataB.numConnections++;

                const alpha = 1.0 - dist / effectController.minDistance;

                linePositions[vertexpos++] = currentPosVec.x;
                linePositions[vertexpos++] = currentPosVec.y;
                linePositions[vertexpos++] = currentPosVec.z;

                linePositions[vertexpos++] = currentPosVecB.x;
                linePositions[vertexpos++] = currentPosVecB.y;
                linePositions[vertexpos++] = currentPosVecB.z;

                const c = color1.clone().lerp(color2, alpha);

                lineColors[colorpos++] = c.r * alpha;
                lineColors[colorpos++] = c.g * alpha;
                lineColors[colorpos++] = c.b * alpha;

                lineColors[colorpos++] = c.r * alpha;
                lineColors[colorpos++] = c.g * alpha;
                lineColors[colorpos++] = c.b * alpha;

                numConnected++;
            }
        }
    }

    linesMesh.geometry.setDrawRange(0, numConnected * 2);
    linesMesh.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.attributes.color.needsUpdate = true;
    particles.geometry.attributes.position.needsUpdate = true;

    // Slight floating camera rotation
    scene.rotation.y = Math.sin(time * 0.1) * 0.1;
    scene.rotation.x = Math.cos(time * 0.1) * 0.05;

    composer.render();
}

animate();
