import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { EXRLoader } from 'EXRLoader';

let googtainer, scene, camera, raycaster, mouse, renderer, texloader = 0;
let frame, goog, hyperlink;

let targetRotationX = 0, targetRotationY = 0;
let lastRotationX = 0, lastRotationY = 0;
let targetFOV = 42, lastFOV = 42;

let lastFrameRayHit = false, hoveringHyperlink = false;
let cardMaterial;

init();
animate();

function init() {
    googtainer = document.getElementById("googtainer")
    
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setClearColor( 0xffffff, 0);

	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	googtainer.appendChild( renderer.domElement );

    const loader = new GLTFLoader();

    texloader = new THREE.TextureLoader();
    texloader.setPath("scene/");

    let albedo = texloader.load('cardAlbedo.webp');
    let ao_roughness = texloader.load('cardAORough.webp');
    let clearcoat_weightroughness = texloader.load('cardClearcoat.webp');
    let normal = texloader.load('cardNormal.webp');
    let emissive = texloader.load('cardEmissive.webp');

    albedo.flipY = false;
    ao_roughness.flipY = false;
    clearcoat_weightroughness.flipY = false;
    normal.flipY = false;
    emissive.flipY = false;
    
    albedo.generateMipmaps = false; //🐱👍!!!
    ao_roughness.generateMipmaps = false;
    emissive.generateMipmaps = false;
    
    let clearNScale = new THREE.Vector2(0.25, 0.25);
    let normalScale = new THREE.Vector2(0.5, 0.5);
    let envRotation = new THREE.Euler(0, -270 * (Math.PI / 180), 0);
    let emissiveCol = new THREE.Color(0x00C3FF);

    cardMaterial = new THREE.MeshPhysicalMaterial({
        map: albedo,
        roughness: 0.75,
        roughnessMap: ao_roughness,
        aoMap: ao_roughness,
        normalMap: normal,
        normalMapType: THREE.TangentSpaceNormalMap,
        normalScale: normalScale,
        emissive: emissiveCol,
        emissiveIntensity: .0,
        emissiveMap: emissive,
        reflectivity: 0.5,
        clearcoat: 0.5,
        clearcoatMap: clearcoat_weightroughness,
        clearcoatRoughnessMap: clearcoat_weightroughness,
        clearcoatNormalMap: normal,
        clearcoatNormalScale: clearNScale,
        envMapIntensity: 0.3,
        envMapRotation: envRotation
    });

    new EXRLoader().load('scene/reflections.exr', function(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        let envtex = new THREE.PMREMGenerator(renderer).fromEquirectangular(texture);
        cardMaterial.envMap = envtex.texture;
    });

    loader.load('scene/scene.gltf', (gltf) => {
        scene.add(gltf.scene);
        
        frame = gltf.scene.getObjectByName("Frame");
        frame.material = cardMaterial;

        goog = frame.getObjectByName("Goog");
        hyperlink = frame.getObjectByName("Hyperlink");

        goog.visible = false;
        hyperlink.visible = false;
    });

    camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 1.2, 9);
    camera.position.set(0, 0, 0);
    camStuff();

    raycaster = new THREE.Raycaster();
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseleave', mouseLeave, false);
    document.addEventListener('soggyupdate', onSoggyUpdate, false)
    window.addEventListener('click', onMouseClick, false);
    window.addEventListener('resize', onWindowResize, false);
}

function onSoggyUpdate(e) {
    const newTexture = texloader.load(e.detail.result);
    newTexture.flipY = false;

    googLightmapMaterial.uniforms.albedo = { value: newTexture };
    googLightmapMaterial.needsUpdate = true;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function mouseLeave() {
    lastFrameRayHit = false;
    updateMouseMovement(-1, -1, true);
}

function onDocumentMouseMove(event) {
    if (!goog || !frame) return;
    updateMouseMovement(event.clientX, event.clientY, false);
}

function onMouseClick() {
    if (hoveringHyperlink) {
        window.open("discord://discord.com/channels/992118472454717530/1325113345652817971/1325114302268702773", "Discord1");
        window.setTimeout(function() {
            window.location.replace("https://discord.com/channels/992118472454717530/1325113345652817971/1325114302268702773");
        }, 1000);
    }
}

function updateMouseMovement(clientX, clientY, forceUnhover) {
    let hovering = false;
    const whackyY = 2;
    const whackyX = 4.5;
    mouse = new THREE.Vector2(
        (clientX / window.innerWidth) * 2 - 1,
        -(clientY / window.innerHeight) * 2 + 1
    );

    const raymouse = new THREE.Vector2(
        0,
        -(clientY / window.innerHeight) * 2 + 1
    );

    if (!forceUnhover) {
        raycaster.setFromCamera(lastFrameRayHit ? raymouse : mouse, camera);

        const intersects = raycaster.intersectObjects([goog]);
        if (intersects.length > 0) {
            lastFrameRayHit = true;
            hovering = true;
        } else lastFrameRayHit = false;
    }

    if (hovering) {
        targetFOV = 20;

        let mouseFalloff = Math.max(Math.abs(mouse.x*2.8), .5)*2;
        targetRotationX = (-mouse.y * whackyY * (window.innerHeight / window.innerWidth) / mouseFalloff);
        targetRotationY = (mouse.x * whackyX);
    }
    else {
        targetFOV = 42;

        targetRotationX = 0;
        targetRotationY = 0;
    }
}

function animate() {
    requestAnimationFrame(animate);
    camStuff();

    let newIntensity = Math.min(Math.max(cardMaterial.emissiveIntensity + (hoveringHyperlink ? 0.05 : -0.05), 0), 2);
    if (newIntensity != cardMaterial.emissiveIntensity) {
        cardMaterial.emissiveIntensity = newIntensity;
    }

    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
}

function camStuff() {
    const lerpedX = THREE.MathUtils.lerp(lastRotationX, targetRotationX, 0.03);
    const lerpedY = THREE.MathUtils.lerp(lastRotationY, targetRotationY, 0.01);

    const lerpedFOV = THREE.MathUtils.lerp(lastFOV, targetFOV, 0.025);

    lastRotationX = lerpedX;
    lastRotationY = lerpedY;

    lastFOV = lerpedFOV;

    if (frame) frame.setRotationFromEuler(new THREE.Euler(-lerpedY + Math.PI / 2, -lerpedX - Math.PI, Math.PI / 2, 'ZYX'));
    camera.fov = lerpedFOV;

    if (!(raycaster && mouse)) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects1 = raycaster.intersectObjects([hyperlink]);
    hoveringHyperlink = intersects1.length > 0;

    googtainer.style["cursor"] = hoveringHyperlink ? "pointer" : "default";
}