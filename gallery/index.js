import * as THREE from 'three';
import {GLTFLoader} from 'GLTFLoader';
import {DRACOLoader} from 'DRACOLoader'
import {StandardControls} from 'StandardControls';

import * as debug from 'debug';
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();


dracoLoader.setDecoderConfig({ type: 'js' });
dracoLoader.setDecoderPath('/gallery/threejs/draco/');

gltfLoader.setDRACOLoader(dracoLoader);

let cframe = 0, last_rendered_time;
let controls;
let camera, scene, renderer;
let root, sog, plane;
let light;
let cubeRenderTarget, cubeCamera;


init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 100 );
	camera.position.x = 0;
	camera.position.z = 5;

	cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 512 );
	cubeRenderTarget.texture.type = THREE.HalfFloatType;

	cubeCamera = new THREE.CubeCamera( 1, 1000, cubeRenderTarget );

	controls = new StandardControls(camera,document.body);

	scene = new THREE.Scene();

	const ambient = new THREE.HemisphereLight(0x00000,0xb6f3b7,.5)
	scene.add(ambient);

	light = new THREE.SpotLight('#dafed6', 60);
	light.castShadow = true;
	light.shadow.blurSamples = 20;
	light.angle = Math.PI/3.5;
	light.penumbra = .75;
	light.shadow.radius = 2;
	light.shadow.mapSize.width = 2048;
	light.shadow.mapSize.height = 2048;
	
	light.position.z = 3;
	light.position.y = 4;

	scene.add(light);
	
	gltfLoader.load("assets/models/soggy.gltf", (gltf) => {
    	root = gltf.scene;
   		scene.add(root);

		const text = root.getObjectByName('Text');
		text.castShadow = true;
		text.receiveShadow = true;

		const spot = root.getObjectByName('Spot');
		spot.castShadow = true;

		const spot2 = root.getObjectByName('Spot001');
		spot2.castShadow = true;

		const text2 = root.getObjectByName('Text001');
		text2.castShadow = true;
		text2.receiveShadow = true;

		sog = root.getObjectByName('sogbgless');
		sog.castShadow = true;

		plane = root.getObjectByName('Plane');
		plane.receiveShadow = true;
		plane.material.envMap = cubeRenderTarget.texture;

		console.log(debug.dumpObject(root).join('\n'));
	});

	renderer = new THREE.WebGLRenderer( { antialias: true, logarithmicDepthBuffer: false } );
	renderer.shadowMap.enabled = true;
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	//

	cubeCamera.update( renderer, scene );
	window.addEventListener( 'resize', onWindowResize );
}

function onWindowResize() {
	
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate(time) {	

	cframe += 1;

	if (!last_rendered_time) last_rendered_time = time;
	let delta = (time-last_rendered_time);

	if (controls && camera) {
		controls.updateMovement(delta || 1,1/(250+16));
	};
	
	if (sog) {
		sog.rotation.x += 0.005;
		sog.rotation.y += 0.01;
		light.target = sog
	};

	if (plane) {
		cubeCamera.position.x = camera.position.x;
		cubeCamera.position.y = (plane.position.y*2.2)-camera.position.y; //i don't believe multiplying is the answer here, but why would i care? it works!
		cubeCamera.position.z = camera.position.z;
	};

	if (cframe % 2 == 0) cubeCamera.update( renderer, scene ); //render reflection at half the framerate
	
	

	last_rendered_time = time;
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}