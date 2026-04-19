import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ---- Scene Setup ---- //
const canvas = document.getElementById('webgl-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070a);
scene.fog = new THREE.FogExp2(0x05070a, 0.012);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 60;

// ---- Post Processing ---- //
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.2;
bloomPass.strength = 1.2;
bloomPass.radius = 0.5;
composer.addPass(bloomPass);

// ---- Interaction Engine ---- //
const mouse = new THREE.Vector2(-10, -10);
const targetMouse = new THREE.Vector2(-10, -10);
const raycaster = new THREE.Raycaster();
const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const mouse3D = new THREE.Vector3();

window.addEventListener('mousemove', (e) => {
    targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// ---- Cursor Light ---- //
const cursorLight = new THREE.PointLight(0xadff2f, 150, 100); // Lime cursor light
scene.add(cursorLight);
// ---- Materials ---- //
const textureLoader = new THREE.TextureLoader();
const envMap = textureLoader.load('crystal_ref.jpg');
envMap.mapping = THREE.EquirectangularReflectionMapping;

// Crystal Colors inspired by input_image_10.png
const colors = [
    0xda00ff, // Magenta
    0x00e5ff, // Cyan
    0xffd700, // Gold
    0xff1e00, // Red
    0x8e2de2  // Violet
];

function createCrystalMaterial(color) {
    return new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.9,
        thickness: 2.0,
        ior: 1.5,
        iridescence: 0.8,
        iridescenceIOR: 1.3,
        sheen: 1,
        envMap: envMap,
        envMapIntensity: 1.5,
        transparent: true,
        opacity: 0.9
    });
}

// ---- Crystal Shard Construction ---- //
const shards = [];
const shardCount = 120;
const geometries = [
    new THREE.OctahedronGeometry(1.5, 0),
    new THREE.TetrahedronGeometry(2, 0),
    new THREE.IcosahedronGeometry(1.2, 0)
];

for (let i = 0; i < shardCount; i++) {
    const geo = geometries[Math.floor(Math.random() * geometries.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const mat = createCrystalMaterial(color);
    
    const shard = new THREE.Mesh(geo, mat);
    
    // Initial random positions
    shard.position.set(
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 60 - 20
    );
    
    shard.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    
    shard.userData = {
        basePos: shard.position.clone(),
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05
        ),
        rotSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
        )
    };
    
    scene.add(shard);
    shards.push(shard);
}

// ---- Logo Integration ---- //
let logoGroup = new THREE.Group();
scene.add(logoGroup);

// Asset B (Primary Focal Point) - Complex Crystalline Logo
const logoBTexture = textureLoader.load('logo_b.png');
const logoBMaterial = new THREE.MeshBasicMaterial({
    map: logoBTexture,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide
});
const logoBPlane = new THREE.Mesh(new THREE.PlaneGeometry(35, 35), logoBMaterial);
logoBPlane.position.z = -10;
logoGroup.add(logoBPlane);

// Asset A (Simplified) - Central floating artifact
const logoATexture = textureLoader.load('logo_a.jpg');
const logoAMaterial = new THREE.MeshBasicMaterial({
    map: logoATexture,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
});
const logoAPlane = new THREE.Mesh(new THREE.PlaneGeometry(15, 15), logoAMaterial);
logoAPlane.position.z = 5;
logoGroup.add(logoAPlane);

// Central Pulsing Light
const coreLight = new THREE.PointLight(0xda00ff, 20, 100); 
coreLight.position.set(0, 0, -5);
scene.add(coreLight);

// ---- Animation Loop ---- //
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Smooth Mouse Interaction
    mouse.lerp(targetMouse, 0.1);
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(interactionPlane, mouse3D);

    cursorLight.position.copy(mouse3D);
    cursorLight.position.z = 15;

    // Pulse core light
    coreLight.intensity = 15 + Math.sin(time * 2) * 10;
    coreLight.color.setHSL((Math.sin(time * 0.5) * 0.5 + 0.5), 0.8, 0.5);

    // Antigravity Field Logic
    const repulsionRadius = 25;
    const repulsionForce = 40;

    shards.forEach(shard => {
        // Subtle drift
        const ud = shard.userData;
        ud.basePos.add(ud.velocity);
        
        // Wrap around
        if (Math.abs(ud.basePos.x) > 100) ud.basePos.x *= -0.95;
        if (Math.abs(ud.basePos.y) > 70) ud.basePos.y *= -0.95;

        const targetPos = ud.basePos.clone();
        const dist = shard.position.distanceTo(mouse3D);

        if (dist < repulsionRadius) {
            const dir = new THREE.Vector3().subVectors(shard.position, mouse3D).normalize();
            const power = (1 - dist / repulsionRadius) * repulsionForce;
            targetPos.add(dir.multiplyScalar(power));
        }

        // Apply position with smoothing
        shard.position.lerp(targetPos, 0.05);

        // Rotation
        shard.rotation.x += ud.rotSpeed.x;
        shard.rotation.y += ud.rotSpeed.y;
        shard.rotation.z += ud.rotSpeed.z;
    });

    // Logo Animation
    logoGroup.rotation.y = Math.sin(time * 0.2) * 0.1;
    logoBPlane.material.opacity = 0.7 + Math.sin(time * 1.5) * 0.2;

    // Check if mouse is over center for stronger repulsion
    if (mouse.length() < 0.2) {
        // Stronger repulsion when near logo
        // (Handled by smaller distance check above implicitly but could be boosted)
    }

    composer.render();
}

// Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

animate();
