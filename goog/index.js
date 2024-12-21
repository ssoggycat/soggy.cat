import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { DRACOLoader } from 'DRACOLoader';
import { OrbitControls } from 'OrbitControls';

let googtainer, scene, camera, controls, raycaster, renderer, texloader;
let frame, goog, googLightmapMaterial;

let defaultAlbedoTex, diffuseTex, glossyTex;

let targetRotationX = 0, targetRotationY = 0;
let lastRotationX = 0, lastRotationY = 0;
let targetFOV = 75, lastFOV = 75;

init();
animate();

function init() {
    googtainer = document.getElementById("googtainer")
    
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = 2;
    renderer.setClearColor( 0xffffff, 0);

	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	googtainer.appendChild( renderer.domElement );

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();

    dracoLoader.setDecoderConfig({ type: 'js' });
    dracoLoader.setDecoderPath('threejs/draco/');

    loader.setDRACOLoader(dracoLoader);

    texloader = new THREE.TextureLoader();

    defaultAlbedoTex = texloader.load('scene/goog.webp');
    diffuseTex = texloader.load('scene/googBake.webp');
    glossyTex = texloader.load('scene/googBakeGlossy.webp');

    defaultAlbedoTex.flipY = false;
    diffuseTex.flipY = false;
    glossyTex.flipY = false;

    googLightmapMaterial = new THREE.ShaderMaterial({
        uniforms: {
            albedo: { value: defaultAlbedoTex },
            diffuse: { value: diffuseTex },
            glossy: { value: glossyTex }
        },

        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = vec2(uv.x, uv.y);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,

        fragmentShader: `
            varying vec2 vUv;
            uniform sampler2D albedo;
            uniform sampler2D diffuse;
            uniform sampler2D glossy;
    
            void main() {
                vec4 albedoColor = texture2D(albedo, vUv);
                vec4 diffuseColor = texture2D(diffuse, vUv);
                vec4 glossyColor = texture2D(glossy, vUv);

                gl_FragColor = (albedoColor * diffuseColor) + glossyColor;
            }
        `
    });

    loader.load('scene/scene.gltf', (gltf) => {
        scene.add(gltf.scene);
        
        frame = gltf.scene.getObjectByName("Frame");
        frame.material.map.generateMipmaps = false; //🐱👍!!!

        goog = gltf.scene.getObjectByName("Goog");
        goog.material = googLightmapMaterial
    });

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1.2, 4);
    camera.position.set(0, 0, 2.5);

    controls = new OrbitControls(camera, googtainer);
    controls.target.set(0, 0, 0);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.keys = {};
    controls.mouseButtons = {};
    // i don't know if its even worth using orbit controls at this point :sob:

    camStuff();
    controls.update();

    raycaster = new THREE.Raycaster();

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseleave', mouseLeave);
    document.addEventListener('soggyupdate', onSoggyUpdate)

    window.addEventListener('resize', onWindowResize, false);
}

function onSoggyUpdate(e) {
    console.log(e.detail.result);
    const newTexture = new THREE.Texture(e.detail.result);
    newTexture.flipY = false;

    googLightmapMaterial.uniforms.albedo = newTexture;
    googLightmapMaterial.needsUpdate = true;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function mouseLeave() {
    updateMouseMovement(-1, -1, true);
}

function onDocumentMouseMove(event) {
    if (!goog || !frame) return;
    updateMouseMovement(event.clientX, event.clientY, false);
}

function updateMouseMovement(clientX, clientY, forceUnhover) {
    let hovering = false;
    const whacky = 0.3;

    const mouse = new THREE.Vector2(
        (clientX / window.innerWidth) * 2 - 1,
        -(clientY / window.innerHeight) * 2 + 1
    );

    if (!forceUnhover) {
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects([frame, goog]);
        if (intersects.length > 0 && intersects[0].object === goog)
            hovering = true;

    }

    if (hovering) {
        targetFOV = 70;

        targetRotationX = (-mouse.y * whacky);
        targetRotationY = (mouse.x * whacky * (window.innerWidth / window.innerHeight));
    }
    else {
        targetFOV = 75;

        targetRotationX = 0;
        targetRotationY = 0;
    }
}

function animate() {
    requestAnimationFrame(animate);

    camStuff();
    controls.update();
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
}

function camStuff() {
    const lerpedX = THREE.MathUtils.lerp(lastRotationX, targetRotationX, 0.1);
    const lerpedY = THREE.MathUtils.lerp(lastRotationY, targetRotationY, 0.1);

    const lerpedFOV = THREE.MathUtils.lerp(lastFOV, targetFOV, 0.1);

    lastRotationX = lerpedX;
    lastRotationY = lerpedY;

    lastFOV = lerpedFOV;

    controls.minAzimuthAngle = lerpedY;
    controls.maxAzimuthAngle = lerpedY;

    controls.minPolarAngle = lerpedX + (Math.PI / 2);
    controls.maxPolarAngle = lerpedX + (Math.PI / 2);

    camera.fov = lerpedFOV;
}