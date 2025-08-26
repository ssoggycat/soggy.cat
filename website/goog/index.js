import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { DRACOLoader } from 'DRACOLoader';

let googtainer, scene, camera, raycaster, renderer, texloader;
let frame, goog, googLightmapMaterial;

let diffuseTex, glossyTex;

let targetRotationX = 0, targetRotationY = 0;
let lastRotationX = 0, lastRotationY = 0;
let targetFOV = 75, lastFOV = 75;

init();
animate();

function init() {
	googtainer = document.getElementById("googtainer");

	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.toneMapping = THREE.AgXToneMapping;
	renderer.toneMappingExposure = 2;
	renderer.setClearColor(0xffffff, 0);

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize( window.innerWidth, window.innerHeight);
	googtainer.appendChild(renderer.domElement);

	const loader = new GLTFLoader();
	const dracoLoader = new DRACOLoader();

	dracoLoader.setDecoderPath('/static/other/shared/web/threejs/draco/');

	loader.setDRACOLoader(dracoLoader);

	texloader = new THREE.TextureLoader();

	const frameTex = texloader.load('/static/ssoggycat/goog/scenes/main/frameBake.webp');
	frameTex.colorSpace = THREE.SRGBColorSpace;
	frameTex.flipY = false;
	frameTex.generateMipmaps = false;

	const defaultAlbedoTex = texloader.load('/static/ssoggycat/goog/images/goog.webp');
	diffuseTex = texloader.load('/static/ssoggycat/goog/scenes/main/googBake.webp');
	glossyTex = texloader.load('/static/ssoggycat/goog/scenes/main/googBakeGlossy.webp');

	defaultAlbedoTex.flipY = false;
	defaultAlbedoTex.generateMipmaps = false;
	diffuseTex.flipY = false;
	diffuseTex.generateMipmaps = false;
	glossyTex.flipY = false;
	glossyTex.generateMipmaps = false;

	const frameMaterial = new THREE.MeshBasicMaterial({
		map: frameTex,
	});

	googLightmapMaterial = new THREE.ShaderMaterial({
		uniforms: {
			albedo: { value: defaultAlbedoTex },
			diffuse: { value: diffuseTex },
			glossy: { value: glossyTex },
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
				vec4 albedoRGBA = texture2D(albedo, vUv);
				vec3 diffuseColor = texture2D(diffuse, vUv).rgb;
				vec3 glossyColor = texture2D(glossy, vUv).rgb;

				// not sure whether this should be grayscale or not, i think this should be an option
				// later on, in the side menu or somethin
				float gray = 0.21 * albedoRGBA.r + 0.71 * albedoRGBA.g + 0.07 * albedoRGBA.b;
				vec3 composite = (diffuseColor * albedoRGBA.rgb) + glossyColor;

				gl_FragColor = vec4(composite * albedoRGBA.a, albedoRGBA.a);
			}
		`,
	});

	loader.load('/static/ssoggycat/goog/scenes/main/scene.glb', (gltf) => {
		scene.add(gltf.scene);

		frame = gltf.scene.getObjectByName("Frame");
		frame.material = frameMaterial;

		goog = gltf.scene.getObjectByName("Goog");
		goog.material = googLightmapMaterial;
	});

	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1.2, 4);
	camera.position.set(0, 0, 2.5);

	// i don't know if its even worth using orbit controls at this point :sob:

	camStuff();

	raycaster = new THREE.Raycaster();

	document.addEventListener('mousemove', onDocumentMouseMove, false);
	document.addEventListener('mouseleave', mouseLeave);
	document.addEventListener('soggyupdate', onSoggyUpdate);

	window.addEventListener('resize', onWindowResize, false);
}

function onSoggyUpdate(e) {
	const newTexture = texloader.load(e.detail.result);
	newTexture.flipY = false;
	newTexture.generateMipmaps = false;

	googLightmapMaterial.uniforms.albedo = { value: newTexture };
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
	camera.updateProjectionMatrix();
	renderer.render(scene, camera);
}

function camStuff() {
	const lerpedY = THREE.MathUtils.lerp(lastRotationY, targetRotationY, 0.1);
	const lerpedX = THREE.MathUtils.lerp(lastRotationX, targetRotationX, 0.1);

	const lerpedFOV = THREE.MathUtils.lerp(lastFOV, targetFOV, 0.1);

	lastRotationX = lerpedX;
	lastRotationY = lerpedY;

	if (frame) frame.setRotationFromEuler(new THREE.Euler(-lerpedX - Math.PI / 2, Math.PI/1, lerpedY - Math.PI / 1, 'XYZ'));
	lastFOV = lerpedFOV;

	camera.fov = lerpedFOV;
}
