import * as three from "three";
import { GLTFLoader } from "GLTFLoader";
import { DRACOLoader } from "DRACOLoader";

let scene, camera, renderer, model, raycaster, modelgroup;
let isdragging = false;
let ismousedown = false;
let previousmouseposition = { x: 0, y: 0 };
let rotationy = 0;
let pendingclick = null;
let clicktimeout = null;
let lastclicktime = 0;
let clickcount = 0;
let plusmarkelement = null;
let lastplusmarkposition = null;
let modelsize = { width: 0, height: 0, depth: 0 };
let modelcenter = new three.Vector3();
let cameradistance = 5;
const decorations = [];
const progresstext = document.getElementById("progresstext");
const fileinput = document.getElementById("filepicker");
const WORKER_ENDPOINT = "https://treeapi.soggy.cat";
const MAX_WEBP_BYTES = 20000;

let submitButton = null;
let hasSubmitted = false;
let placedDecoration = null;
let placedBlob = null;
let loadingDecorations = false;

if (!progresstext || !fileinput) {
	console.error("Required DOM elements not found");
} else {
	init();
	animate();
}

function init() {
	scene = new three.Scene();
	camera = new three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	cameradistance = 5;
	camera.position.set(0, -5.5, cameradistance);

	renderer = new three.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x000000, 0);
	document.body.appendChild(renderer.domElement);

	const ambientlight = new three.AmbientLight(0xffffff, 1.6); // adjust for better brightness!!
	scene.add(ambientlight);

	const directionallight = new three.DirectionalLight(0xffffff, 3.6);
	directionallight.position.set(5, 5, 5);
	scene.add(directionallight);

	const loader = new GLTFLoader();
	const dracoloader = new DRACOLoader();
	dracoloader.setDecoderPath("/static/other/shared/web/threejs/draco/");
	loader.setDRACOLoader(dracoloader);

	loader.load("assets/static/bybsmaan123456.glb", (gltf) => {
		model = gltf.scene;

		const box = new three.Box3().setFromObject(model);
		const size = box.getSize(new three.Vector3());
		const center = box.getCenter(new three.Vector3());

		const targetsize = 5;
		const maxdimension = Math.max(size.x, size.y, size.z);

		if (maxdimension > 0 && maxdimension < targetsize) {
			const scale = targetsize / maxdimension;
			model.scale.set(scale, scale, scale);
		} else if (maxdimension > targetsize * 2) {
			const scale = (targetsize * 2) / maxdimension;
			model.scale.set(scale, scale, scale);
		}

		modelgroup = new three.Group();
		model.position.sub(center.clone().multiplyScalar(model.scale.x));
		modelgroup.add(model);
		// model displacement
		modelgroup.position.set(0, -5.5, 0);
		scene.add(modelgroup);

		modelgroup.updateMatrixWorld();
		const finalbox = new three.Box3().setFromObject(modelgroup);
		const finalsize = finalbox.getSize(new three.Vector3());
		modelsize.width = finalsize.x;
		modelsize.height = finalsize.y;
		modelsize.depth = finalsize.z;
		modelcenter = finalbox.getCenter(new three.Vector3());

		console.log("model size:", modelsize);

		loadExistingDecorations();
	}, undefined, (error) => {
		console.error("FUUUCK");
	});

	raycaster = new three.Raycaster();

	renderer.domElement.addEventListener("mousedown", onmousedown);
	renderer.domElement.addEventListener("mousemove", onmousemove);
	renderer.domElement.addEventListener("mouseup", onmouseup);
	renderer.domElement.addEventListener("click", onclick);

	fileinput.addEventListener("change", handlefileselect);

	setupzoomcontrols();

	window.addEventListener("resize", onwindowresize);
}

function setupzoomcontrols() {
	const zoomcontainer = document.createElement("div");
	zoomcontainer.id = "zoomcontrols";

	const zoominbtn = document.createElement("button");
	zoominbtn.textContent = "+";
	zoominbtn.className = "zoombutton";
	zoominbtn.onclick = () => zoomcamera(0.9);

	const zoomoutbtn = document.createElement("button");
	zoomoutbtn.textContent = "−";
	zoomoutbtn.className = "zoombutton";
	zoomoutbtn.onclick = () => zoomcamera(1.1);

	zoomcontainer.appendChild(zoomoutbtn);
	zoomcontainer.appendChild(zoominbtn);
	document.body.appendChild(zoomcontainer);

	renderer.domElement.addEventListener("wheel", (event) => {
		event.preventDefault();
		const zoomfactor = event.deltaY > 0 ? 1.1 : 0.9;
		zoomcamera(zoomfactor);
	}, { passive: false });
}

function zoomcamera(factor) {
	cameradistance *= factor;
	cameradistance = Math.max(2, Math.min(20, cameradistance));
	camera.position.z = cameradistance;
}

function onmousedown(event) {
	ismousedown = true;
	previousmouseposition = { x: event.clientX, y: event.clientY };
	isdragging = false;
}

function onmousemove(event) {
	if (!ismousedown) return;

	if (!isdragging) {
		const deltax = Math.abs(event.clientX - previousmouseposition.x);
		const deltay = Math.abs(event.clientY - previousmouseposition.y);
		if (deltax > 5 || deltay > 5) {
			isdragging = true;
			removeplusmark();
			if (clicktimeout) {
				clearTimeout(clicktimeout);
				clicktimeout = null;
				clickcount = 0;
			}
		}
	}

	if (isdragging && modelgroup) {
		const deltax = event.clientX - previousmouseposition.x;
		rotationy += deltax * 0.01;
		if (modelgroup) {
			modelgroup.rotation.y = rotationy;
		}
		previousmouseposition = { x: event.clientX, y: event.clientY };
	}
}

function onmouseup(event) {
	ismousedown = false;
	isdragging = false;
}

function onclick(event) {
	if (isdragging && ismousedown) return;

	const mouse = new three.Vector2();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	const decorationintersects = raycaster.intersectObjects(decorations, true);

	if (decorationintersects.length > 0) {
		const clickeddecoration = decorationintersects[0].object;
		if (clickeddecoration.userData.imageUrl) {
			window.open(clickeddecoration.userData.imageUrl, "_blank");
		}
		return;
	}

	const currenttime = Date.now();
	const timesincelastclick = currenttime - lastclicktime;

	if (timesincelastclick < 300 && clickcount === 1) {
		clickcount = 0;
		lastclicktime = 0;

		if (clicktimeout) {
			clearTimeout(clicktimeout);
			clicktimeout = null;
		}

		removeplusmark();

		const modelintersects = raycaster.intersectObject(modelgroup, true).filter(intersect => {
			return !decorations.includes(intersect.object);
		});
		if (modelintersects.length > 0) {
			pendingclick = {
				x: event.clientX,
				y: event.clientY,
				intersect: modelintersects[0],
				time: Date.now()
			};
			fileinput.click();
		}
	} else {
		clickcount = 1;
		lastclicktime = currenttime;

		clicktimeout = setTimeout(() => {
			if (clickcount === 1 && !isdragging) {
				handlesingleclick(event.clientX, event.clientY);
				clickcount = 0;
			}
		}, 200);
	}
}

function handlesingleclick(x, y) {
	if (!modelgroup) return;

	const mouse = new three.Vector2();
	mouse.x = (x / window.innerWidth) * 2 - 1;
	mouse.y = -(y / window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObject(modelgroup, true).filter(intersect => {
		return !decorations.includes(intersect.object);
	});

	if (intersects.length > 0) {
		const intersect = intersects[0];
		showplusmark(intersect.point, intersect.face.normal);
		pendingclick = { x, y, intersect: intersect };
	}
}

function showplusmark(position, normal) {
	if (lastplusmarkposition) {
		const distance = position.distanceTo(lastplusmarkposition);
		if (distance < 0.1) {
			return;
		}
	}

	lastplusmarkposition = position.clone();

	removeplusmark();

	plusmarkelement = document.createElement("div");
	plusmarkelement.className = "plusmark";

	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("width", "30");
	svg.setAttribute("height", "30");
	svg.setAttribute("viewBox", "0 0 30 30");

	const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
	line1.setAttribute("x1", "15");
	line1.setAttribute("y1", "5");
	line1.setAttribute("x2", "15");
	line1.setAttribute("y2", "25");
	line1.setAttribute("stroke", "#ffffff");
	line1.setAttribute("stroke-width", "3");
	line1.setAttribute("stroke-linecap", "round");

	const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
	line2.setAttribute("x1", "5");
	line2.setAttribute("y1", "15");
	line2.setAttribute("x2", "25");
	line2.setAttribute("y2", "15");
	line2.setAttribute("stroke", "#ffffff");
	line2.setAttribute("stroke-width", "3");
	line2.setAttribute("stroke-linecap", "round");

	svg.appendChild(line1);
	svg.appendChild(line2);
	plusmarkelement.appendChild(svg);

	const vector = position.clone();
	vector.project(camera);

	const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
	const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

	plusmarkelement.style.left = x + "px";
	plusmarkelement.style.top = y + "px";

	document.body.appendChild(plusmarkelement);

	plusmarkelement.userData = { position: position.clone() };
}

function removeplusmark() {
	if (plusmarkelement) {
		plusmarkelement.remove();
		plusmarkelement = null;
		lastplusmarkposition = null;
	}
}

function removeLocalDecoration() {
	if (placedDecoration) {
		if (placedDecoration.parent) {
			placedDecoration.parent.remove(placedDecoration);
		}
		const idx = decorations.indexOf(placedDecoration);
		if (idx !== -1) {
			decorations.splice(idx, 1);
		}
		if (placedDecoration.userData?.imageUrl && placedDecoration.userData.imageUrl.startsWith("blob:")) {
			URL.revokeObjectURL(placedDecoration.userData.imageUrl);
		}
		placedDecoration = null;
		placedBlob = null;
		hasSubmitted = false;
		if (submitButton && submitButton.parentElement) {
			submitButton.parentElement.removeChild(submitButton);
		}
		submitButton = null;
	}
}

async function handlefileselect(event) {
	if (hasSubmitted) {
		updateprogress("already submitted!");
		return;
	}

	const file = event.target.files[0];
	if (!file || !pendingclick) return;

	event.target.value = "";

	let intersect;
	if (pendingclick.intersect) {
		intersect = pendingclick.intersect;
	} else {
		const mouse = new three.Vector2();
		mouse.x = (pendingclick.x / window.innerWidth) * 2 - 1;
		mouse.y = -(pendingclick.y / window.innerHeight) * 2 + 1;
		raycaster.setFromCamera(mouse, camera);
		const intersects = raycaster.intersectObject(modelgroup, true).filter(intersect => {
			return !decorations.includes(intersect.object);
		});
		if (intersects.length === 0) {
			pendingclick = null;
			return;
		}
		intersect = intersects[0];
	}

	const position = intersect.point.clone();
	const normal = intersect.face.normal.clone().normalize();

	removeplusmark();
	updateprogress("processing file...");
	removeLocalDecoration();

	try {
		const filename = file.name.toLowerCase();
		const isanimated = file.type === "image/gif" || filename.endsWith(".gif") ||
		                   file.type === "image/apng" || filename.endsWith(".apng");

		let processedblob;
		let processedurl;

		if (isanimated) {
			updateprogress("processing...");
			processedblob = await processanimatedimage(file, 500);
			processedurl = URL.createObjectURL(processedblob);
		} else {
			updateprogress("converting...");
			processedblob = await processstaticimage(file, 500);
			processedurl = URL.createObjectURL(processedblob);
		}

		const plane = await createimagedecoration(position, normal, processedurl, processedblob, { source: "local" });
		registerLocalDecoration(plane, processedblob);

		updateprogress("submit decoration");
		showSubmitButton();

	} catch (error) {
		console.error("error processing file:", error);
		updateprogress("error processing file");
		setTimeout(() => updateprogress(""), 2000);
	}

	pendingclick = null;
}

function registerLocalDecoration(plane, blob) {
	placedDecoration = plane;
	placedBlob = blob;
	hasSubmitted = false;
}

function ensureSubmitButton() {
	if (!submitButton) {
		submitButton = document.createElement("button");
		submitButton.className = "submitbutton";
		submitButton.textContent = "submit decoration";
		submitButton.addEventListener("click", handlesubmitclick);
	}
}

function showSubmitButton() {
	if (!progresstext) return;
	ensureSubmitButton();
	progresstext.textContent = "";
	progresstext.innerHTML = "";
	progresstext.appendChild(submitButton);
	submitButton.disabled = false;
	submitButton.textContent = "submit decoration";
}

async function handlesubmitclick() {
	if (!placedDecoration || !placedBlob || hasSubmitted) return;
	if (!submitButton) return;

	const password = prompt("enter a password:");
	if (!password) {
		return;
	}

	submitButton.disabled = true;
	submitButton.textContent = "submitting...";

	try {
		const worldpos = placedDecoration.userData?.worldpos || new three.Vector3();
		const modellocal = placedDecoration.userData?.modelpos || new three.Vector3();
		const normal = placedDecoration.userData?.normal || new three.Vector3();

		const formData = new FormData();
		formData.append("password", password);
		formData.append("image", placedBlob, "decoration.webp");
		formData.append("x", worldpos.x);
		formData.append("y", worldpos.y);
		formData.append("z", worldpos.z);
		formData.append("localX", modellocal.x);
		formData.append("localY", modellocal.y);
		formData.append("localZ", modellocal.z);
		formData.append("nx", normal.x);
		formData.append("ny", normal.y);
		formData.append("nz", normal.z);

		const response = await fetch(WORKER_ENDPOINT, {
			method: "POST",
			body: formData
		});

		if (!response.ok) {
			const errorText = await response.text();
			if (response.status === 401) {
				throw new Error("invalid password");
			}
			throw new Error("worker rejected: " + response.status + " - " + errorText);
		}

		hasSubmitted = true;
		submitButton.textContent = "submitted!";
		submitButton.disabled = true;
	} catch (error) {
		console.error("submit failed", error);
		submitButton.disabled = false;
		submitButton.textContent = "retry submit";
		const errorMsg = error.message.includes("invalid password")
			? "invalid password"
			: "error submitting?! (you can only submit one decoration per day)";
		updateprogress(errorMsg);
		setTimeout(() => {
			if (submitButton && !hasSubmitted) {
				submitButton.textContent = "submit decoration";
			}
			updateprogress("");
		}, 2500);
	}
}

async function processstaticimage(file, maxsize) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			let width = img.width;
			let height = img.height;
			if (width > maxsize || height > maxsize) {
				const ratio = Math.min(maxsize / width, maxsize / height);
				width = Math.floor(width * ratio);
				height = Math.floor(height * ratio);
			}

			let targetWidth = width;
			let targetHeight = height;
			const minSize = 64;
			let quality = 0.9;

			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			const attemptCompression = () => {
				canvas.width = targetWidth;
				canvas.height = targetHeight;
				ctx.clearRect(0, 0, targetWidth, targetHeight);
				ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

				canvas.toBlob((blob) => {
					if (!blob) {
						reject(new Error("failed to convert to webp?!"));
						return;
					}

					if (blob.size <= MAX_WEBP_BYTES) {
						resolve(blob);
						return;
					}

					if (quality > 0.4) {
						quality = Math.max(0.4, quality - 0.1);
						canvas.toBlob((qblob) => {
							if (qblob && qblob.size <= MAX_WEBP_BYTES) {
								resolve(qblob);
							} else if (targetWidth > minSize && targetHeight > minSize) {
								targetWidth = Math.floor(targetWidth * 0.88);
								targetHeight = Math.floor(targetHeight * 0.88);
								quality = 0.85;
								attemptCompression();
							} else {
								resolve(qblob || blob);
							}
						}, "image/webp", quality);
					} else if (targetWidth > minSize && targetHeight > minSize) {
						targetWidth = Math.floor(targetWidth * 0.88);
						targetHeight = Math.floor(targetHeight * 0.88);
						quality = 0.85;
						attemptCompression();
					} else {
						resolve(blob);
					}
				}, "image/webp", quality);
			};

			attemptCompression();
		};
		img.onerror = reject;
		img.src = URL.createObjectURL(file);
	});
}

async function processanimatedimage(file, maxsize) {
	return processstaticimage(file, maxsize);
}

function createimagedecoration(position, normal, imageurl, blob, options = {}) {
	return new Promise((resolve, reject) => {
		const isgif = blob && (blob.type === "image/gif" || imageurl.toLowerCase().includes(".gif"));

		let texture;
		let loadTimeout;
		const maxWaitTime = 10000;
		if (isgif) {
			const img = document.createElement("img");
			img.src = imageurl;
			img.crossOrigin = "anonymous";
			texture = new three.Texture(img);
			texture.needsUpdate = true;
			texture.userData.gifImage = img;

			img.onload = () => {
				texture.needsUpdate = true;
			};
			img.onerror = () => {
				clearTimeout(loadTimeout);
				reject(new Error(`failed to load image: ${imageurl}`));
			};
		} else {
			const textureloader = new three.TextureLoader();
			textureloader.setCrossOrigin("anonymous");
			texture = textureloader.load(
				imageurl,
				() => {},
				undefined,
				(error) => {
					clearTimeout(loadTimeout);
					reject(new Error(`failed to load texture: ${imageurl} - ${error}`));
				}
			);
		}

		const finalize = () => {
			clearTimeout(loadTimeout);
			const plane = setupdecoration(texture, position, normal, imageurl, blob, isgif, options);
			decorations.push(plane);
			resolve(plane);
		};

		loadTimeout = setTimeout(() => {
			reject(new Error(`timeout loading image: ${imageurl}`));
		}, maxWaitTime);

		if (texture.image && texture.image.complete) {
			finalize();
		} else if (texture.image) {
			texture.image.onload = finalize;
			texture.image.onerror = () => {
				clearTimeout(loadTimeout);
				reject(new Error(`image load error: ${imageurl}`));
			};
		} else {
			setTimeout(() => {
				if (texture.image && texture.image.complete) {
					finalize();
				} else {
					let checkCount = 0;
					const maxChecks = maxWaitTime / 10;
					const checktexture = () => {
						checkCount++;
						if (checkCount > maxChecks) {
							clearTimeout(loadTimeout);
							reject(new Error(`timeout waiting for texture: ${imageurl}`));
							return;
						}
						if (texture.image && texture.image.complete) {
							finalize();
						} else {
							setTimeout(checktexture, 10);
						}
					};
					checktexture();
				}
			}, 10);
		}
	});
}

function setupdecoration(texture, position, normal, imageurl, blob, isgif, options = {}) {
	const aspect = texture.image.width / texture.image.height;

	const modelmaxdimension = Math.max(modelsize.width, modelsize.height, modelsize.depth);
	const maxwidth = modelmaxdimension * 0.25;
	const maxheight = modelmaxdimension * 0.05;

	let width = maxwidth;
	let height = width / aspect;
	if (height > maxheight) {
		height = maxheight;
		width = height * aspect;
	}
	if (width <= 0 || height <= 0 || !isFinite(width) || !isFinite(height)) {
		console.warn("invalid decoration size?! using defaults", { width, height, modelsize });
		width = 0.1;
		height = 0.1 / aspect;
	}

	width *= 0.1;
	height *= 0.1;

	const planegeometry = new three.PlaneGeometry(width, height);
	texture.colorSpace = three.SRGBColorSpace;
	const planematerial = new three.MeshBasicMaterial({
		map: texture,
		transparent: true,
		side: three.DoubleSide,
		depthWrite: false
	});

	const plane = new three.Mesh(planegeometry, planematerial);

	const directionfromcenter = position.clone().sub(modelcenter).normalize();
	const fixeddistance = Math.max(modelsize.width, modelsize.height, modelsize.depth) * 0.15;
	const targetworldpos = options.worldpos
		? options.worldpos.clone()
		: modelcenter.clone().add(directionfromcenter.multiplyScalar(fixeddistance));

	model.updateMatrixWorld();
	const modelinversematrix = new three.Matrix4().copy(model.matrixWorld).invert();
	const modelpos = options.modelpos
		? options.modelpos.clone()
		: targetworldpos.clone().applyMatrix4(modelinversematrix);
	plane.position.copy(modelpos);

	plane.userData = {
		imageUrl: imageurl, blob: blob,
		worldpos: targetworldpos.clone(),
		modelpos: modelpos.clone(),
		normal: (normal || directionfromcenter).clone(),
		isGif: isgif || false,
		texture: texture,
		source: options.source || "local"
	};
	model.add(plane);
	return plane;
}

async function loadExistingDecorations() {
	if (loadingDecorations) return;
	if (!model || !modelgroup) {
		console.warn("model not ready, skipping decoration load");
		return;
	}
	loadingDecorations = true;
	try {
		const response = await fetch("deco.json", { cache: "no-store" });
		if (!response.ok) {
			console.warn("deco.json not found or error:", response.status);
			return;
		}
		const payload = await response.json();
		if (!Array.isArray(payload)) {
			console.warn("deco.json is not an array");
			return;
		}

		console.log(`loading ${payload.length} decoration(s)`);
		for (const entry of payload) {
			try {
				await createDecorationFromEntry(entry);
			} catch (error) {
				console.error("error loading decoration entry:", error, entry);
			}
		}
	} catch (error) {
		console.error("error loading decorations:", error);
	}
}

async function createDecorationFromEntry(entry) {
	if (!entry) {
		console.warn("createDecorationFromEntry: empty entry");
		return;
	}

	const imageUrl = entry.imageUrl || entry.imageurl;
	if (!imageUrl) {
		console.warn("createDecorationFromEntry: missing imageUrl", entry);
		return;
	}

	const positionData = entry.worldpos || entry.worldpos || entry.position || {};
	const normalData = entry.normal || null;
	const modelLocalData = entry.modelpos || entry.modelpos || null;

	const pos = new three.Vector3(
		Number(positionData.x) || 0,
		Number(positionData.y) || 0,
		Number(positionData.z) || 0
	);
	const normal = normalData
		? new three.Vector3(Number(normalData.x) || 0, Number(normalData.y) || 0, Number(normalData.z) || 0)
		: pos.clone().sub(modelcenter).normalize();

	const options = {
		worldpos: pos,
		modelpos: modelLocalData
			? new three.Vector3(Number(modelLocalData.x) || 0, Number(modelLocalData.y) || 0, Number(modelLocalData.z) || 0)
			: undefined,
		source: "static"
	};

	try {
		await createimagedecoration(pos, normal, imageUrl, null, options);
		console.log("loaded decoration:", imageUrl);
	} catch (error) {
		console.error("error creating decoration:", error, { imageUrl, pos, normal });
	}
}

function updateprogress(text) {
	if (!progresstext) return;
	if (submitButton && progresstext.contains(submitButton)) {
		if (!hasSubmitted) {
			submitButton.textContent = text || "submit decoration";
		}
	} else {
		progresstext.textContent = text;
	}
}

function onwindowresize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.position.z = cameradistance;
}

function animate() {
	requestAnimationFrame(animate);

	decorations.forEach(decoration => {
		if (decoration.userData.isGif && decoration.userData.texture) {
			decoration.userData.texture.needsUpdate = true;
			if (decoration.userData.texture.userData.gifImage) {
				decoration.userData.texture.needsUpdate = true;
			}
		}
		if (!decoration.userData.modelpos) return;

		const cameraworldpos = new three.Vector3();
		camera.getWorldPosition(cameraworldpos);
		model.updateMatrixWorld();
		const decorationworldpos = new three.Vector3();
		decoration.getWorldPosition(decorationworldpos);

		const modelinversematrix = new three.Matrix4().copy(model.matrixWorld).invert();
		const localcamerapos = cameraworldpos.clone().applyMatrix4(modelinversematrix);

		const localpos = decoration.position.clone();

		const dx = localcamerapos.x - localpos.x;
		const dz = localcamerapos.z - localpos.z;

		const yrotation = Math.atan2(dx, dz);

		decoration.rotation.set(0, yrotation, 0);
	});

	if (plusmarkelement && plusmarkelement.userData) {
		const vector = plusmarkelement.userData.position.clone();
		vector.project(camera);
		const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
		const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
		plusmarkelement.style.left = x + "px";
		plusmarkelement.style.top = y + "px";
	}

	renderer.render(scene, camera);
}
