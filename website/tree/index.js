const progresstext = document.getElementById("progresstext");
const fileinput = document.getElementById("filepicker");

// worker api endpoint!!!!!!!!!!!!!!
// for the code check ssoggycat cloudflare account -> build -> compute -> workers & pages
const workerlink = "https://treeapi.soggy.cat";

let currentzoom = 1;
let treeimage = null;
let treemaskcanvas = null;
let treemaskctx = null;

let submitbutton = null;
let hassubmitted = false;
let placedfile = null;
let placedplacement = null;

// lower for better performance
const RESSCALE = 4;

if (!progresstext || !fileinput) {console.error("required dom elements not found?!")}
else {inittreepage()}

function inittreepage() {
	const container = document.createElement("div");
	container.id = "tree-container";
	Object.assign(container.style, {
		position: "fixed",
		left: "50%", top: "50%",
		transformOrigin: "0 0",
		transform: "translate(-50%, -50%)",
		WebkitTransform: "translate(-50%, -50%)",
		width: "min(480px, 80vw)",
		height: "min(700px, 90vh)",
		pointerEvents: "auto",
		overflow: "visible",
	});

	// scale wrapper
	const scalewrapper = document.createElement("div");
	scalewrapper.id = "tree-scale-wrapper";
	Object.assign(scalewrapper.style, {
		position: "absolute",
		left: "0", top: "0",
		width: "100%", height: "100%",
		transform: `scale(${1/RESSCALE})`,
		WebkitTransform: `scale(${1/RESSCALE})`,
		transformOrigin: "top left",
		pointerEvents: "none",
	});

	// perspective wrapper
	const perspectivewrapper = document.createElement("div");
	perspectivewrapper.id = "tree-perspective";
	Object.assign(perspectivewrapper.style, {
		position: "absolute",
		left: "0", top: "0",
		width: `${100 * RESSCALE}%`,
		height: `${100 * RESSCALE}%`,
		perspective: `${2000 * RESSCALE}px`,
		perspectiveOrigin: "center center",
		pointerEvents: "auto",
	});

	const tree3d = document.createElement("div");
	tree3d.id = "tree-3d";
	Object.assign(tree3d.style, {
		position: "relative",
		width: "100%", height: "100%",
		transformStyle: "preserve-3d",
		WebkitTransformStyle: "preserve-3d",
		transform: "rotateY(0deg)",
		WebkitTransform: "rotateY(0deg)",
		transition: "transform 0.15s ease-out",
		userSelect: "none",
	});

	const fronttree = createtreeside("front");
	const backtree = createtreeside("back");

	tree3d.appendChild(fronttree);
	tree3d.appendChild(backtree);
	perspectivewrapper.appendChild(tree3d);
	scalewrapper.appendChild(perspectivewrapper);
	container.appendChild(scalewrapper);
	document.body.appendChild(container);

	const decorations = [];
	let isdragging = false;
	let dragstartx = 0; let dragstarty = 0;
	let activepointerid = null;
	let rotationy = 0;
	let panx = 0;
	let pany = 0;

	function updatecontainertransform() {
		container.style.transform = `translate(${panx}px, ${pany}px) scale(${currentzoom}) translate(-50%, -50%)`;
		container.style.WebkitTransform = `translate(${panx}px, ${pany}px) scale(${currentzoom}) translate(-50%, -50%)`;
	}

	function updatetreerotation() {
		tree3d.style.transform = `rotateY(${rotationy}deg)`;
		tree3d.style.WebkitTransform = `rotateY(${rotationy}deg)`;
	}
	updatecontainertransform();

	const handlepointerdown = (event) => {
		if (event.button !== undefined && event.button !== 0) return;
		if (
			event.target.closest("#zoomcontrols") ||
			event.target.closest("#sidemenu") ||
			event.target.closest("#circlebtn") ||
			event.target.closest("#progresstext") ||
			event.target.closest(".plusmark") ||
			event.target.closest(".spinbutton") ||
			event.target.tagName === "BUTTON" ||
			event.target.tagName === "A" ||
			event.target.tagName === "INPUT"
		) {return}

		isdragging = true;
		activepointerid = event.pointerId;
		dragstartx = event.clientX;
		dragstarty = event.clientY;
		if (event.target && event.target.setPointerCapture) {
			try {event.target.setPointerCapture(event.pointerId)} catch (e) {}
		}
	};

	const handlepointermove = (event) => {
		if (!isdragging || (activepointerid !== null && event.pointerId !== activepointerid)) return;
		const dx = event.clientX - dragstartx;
		const dy = event.clientY - dragstarty;
		dragstartx = event.clientX;
		dragstarty = event.clientY;

		if (plusmarker && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
			removeplusmarker(plusmarker);
			plusmarker = null;
			clearTimeout(clicktimeout);
			clicktimeout = null;
		}
		panx += dx; pany += dy;
		updatecontainertransform();
	};

	const handlepointerend = (event) => {
		if (!isdragging || (activepointerid !== null && event.pointerId !== activepointerid)) return;
		isdragging = false;
		activepointerid = null;
		if (event.target && event.target.releasePointerCapture) {
			try {event.target.releasePointerCapture(event.pointerId)} catch (e) {}
		}
	};
	document.addEventListener("pointerdown", handlepointerdown);
	document.addEventListener("pointermove", handlepointermove);
	document.addEventListener("pointerup", handlepointerend);
	document.addEventListener("pointercancel", handlepointerend);

	setupspinbuttons(tree3d, (delta) => {
		rotationy += delta;
		updatetreerotation();
	});

	let pendingplacement = null;
	let plusmarker = null;
	let clicktimeout = null;
	let lastclicktime = 0;
	let lastclickx = 0;
	let lastclicky = 0;
	const doubleclicktiming = 500;

	container.addEventListener("click", (event) => {
		if (
			event.target.closest(".decoration") ||
			event.target.closest("#zoomcontrols") ||
			event.target.closest("#sidemenu") ||
			event.target.closest("#circlebtn") ||
			event.target.closest("#progresstext") ||
			event.target.tagName === "BUTTON" ||
			event.target.tagName === "A" ||
			event.target.tagName === "INPUT"
		) {return}

		const rect = container.getBoundingClientRect();
		const relx = event.clientX - rect.left;
		const rely = event.clientY - rect.top;
		const now = Date.now();
		const isdoubleclick =
			now - lastclicktime < doubleclicktiming &&
			Math.abs(relx - lastclickx) < 10 &&
			Math.abs(rely - lastclicky) < 10;

		if (isdoubleclick) {
			clearTimeout(clicktimeout);
			clicktimeout = null;
			event.preventDefault();

			const hit = computetreehit(event.clientX, event.clientY, rect, rotationy);
			if (!hit) {
				removeplusmarker(plusmarker);
				plusmarker = null;
				setprogress("BROTHER, that is not on a tree..");
				setTimeout(() => setprogress("double click any place on the tree to add a static decoration!"), 2500);
			return;
		}
			const side = sidefromrotation(rotationy);
			let x = hit.x;
			if (side === 2) {
				x = 1 - x;
			}
			pendingplacement = { x, y: hit.y, side, marker: plusmarker };
		fileinput.click();
		} else {
			clearTimeout(clicktimeout);
			lastclicktime = now;
			lastclickx = relx; lastclicky = rely;

			const hit = computetreehit(event.clientX, event.clientY, rect, rotationy);
			if (hit) {
				removeplusmarker(plusmarker);
				plusmarker = createplusmarker(event.clientX, event.clientY, rect);
				document.body.appendChild(plusmarker);
			}

			clicktimeout = setTimeout(() => {
				removeplusmarker(plusmarker);
				plusmarker = null;
				clicktimeout = null;
			}, doubleclicktiming);
		}
	});
	fileinput.addEventListener("change", (event) => {
		const file = event.target.files[0];
		event.target.value = "";
		if (!file || !pendingplacement) return;

		const placement = pendingplacement;
		pendingplacement = null;

		const reader = new FileReader();
		reader.onload = async () => {
			const dataurl = reader.result;

			setprogress("compressing image...");
			let compressedblob;
			try {
				compressedblob = await compressimage(file, 100, 20000);
				if (compressedblob.size > 20000) {
					setprogress("image too large after compression?! (max 20kb)");
					setTimeout(() => setprogress("double click any place on the tree to add a static decoration!"), 3000);
					return;
				}
			} catch (error) {
				console.error("compression failed:", error);
				setprogress("compression failed, using original");
				compressedblob = file;
			}

			const compressedurl = URL.createObjectURL(compressedblob);
			const decoration = createdecorationelement({
				imageurl: compressedurl,
				x: placement.x,
				y: placement.y,
				side: placement.side,
			});
			decorations.push(decoration);
			if (placement.side === 1) {
				fronttree.appendChild(decoration.element);
			} else {
				backtree.appendChild(decoration.element);
			}
			removeplusmarker(placement.marker);
			plusmarker = null;
			clearTimeout(clicktimeout);
			clicktimeout = null;

			placedfile = compressedblob;
			placedplacement = placement;
			hassubmitted = false;

			setprogress("submit decoration");
			showsubmitbutton();
		};
		reader.onerror = () => {
			setprogress("error reading file?!");
		};
		reader.readAsDataURL(file);
	});

	function adjustzoom(delta) {
		currentzoom = Math.max(0.25, Math.min(10.0, currentzoom + delta));
		updatecontainertransform();
	}

	setupzoomcontrols(adjustzoom);

	loadtreemask();
	setprogress("double click any place on the tree to add a static decoration!");
	loadstaticdecorations(fronttree, backtree, decorations);
	loadremotedecorations(fronttree, backtree, decorations);
}

function createtreeside(which) {
	const side = document.createElement("div");
	side.className = `tree-side tree-side-${which}`;

	Object.assign(side.style, {
		position: "absolute",
		left: "0", top: "0",
		width: "100%",
		height: "100%",
		backfaceVisibility: "hidden",
		WebkitBackfaceVisibility: "hidden",
		overflow: "hidden",
		display: "flex",
		alignItems: "flex-end",
		justifyContent: "center",
	});

	// use <img> instead of background-image, apparently this is better?
	const img = document.createElement("img");
	img.src = "assets/images/treeflatxl2.webp";
	img.alt = "";
	Object.assign(img.style, {
		width: "auto", height: "auto",
		maxWidth: "100%", maxHeight: "100%",
		objectFit: "contain",
		objectPosition: "center bottom",
		pointerEvents: "none",
		userSelect: "none",
	});
	side.appendChild(img);

	// 1px addition prevents z fighting
	if (which === "front") {
		side.style.transform = "rotateY(0deg) translateZ(1px)";
		side.style.WebkitTransform = "rotateY(0deg) translateZ(1px)";
	} else {
		side.style.transform = "rotateY(180deg) translateZ(1px)";
		side.style.WebkitTransform = "rotateY(180deg) translateZ(1px)";
	}
	return side;
}

function createdecorationelement({ imageurl, x, y, side }) {
	const el = document.createElement("div");
	el.className = "decoration";
	const img = document.createElement("img");
	img.src = imageurl;
	img.alt = "";
	img.draggable = false;
	Object.assign(img.style, {
		width: "100%", height: "100%",
		objectFit: "contain",
		pointerEvents: "none",
		userSelect: "none",
		WebkitUserDrag: "none",
	});

	const sizepercent = 3;
	const z = side === 2 ? -2 : 2;
	Object.assign(el.style, {
		position: "absolute",
		left: `${x * 100}%`,
		top: `${y * 100}%`,
		transform: `translate(-50%, -50%) translateZ(${z}px)`,
		width: `${sizepercent}%`,
		aspectRatio: "1 / 1",
		pointerEvents: "auto",
		userSelect: "none",
		backfaceVisibility: "hidden",
		WebkitBackfaceVisibility: "hidden",
	});
	el.appendChild(img);

	el.addEventListener("dragstart", (e) => e.preventDefault());

	return {
		element: el, imageurl,
		x, y, side,
	};
}
function sidefromrotation(deg) {
	let angle = deg % 360;
	if (angle < 0) angle += 360;
	return angle >= 90 && angle <= 270 ? 2 : 1;
}

function setupzoomcontrols(adjustzoom) {
	const zoomcontainer = document.createElement("div");
	zoomcontainer.id = "zoomcontrols";

	const zoominbtn = document.createElement("button");
	zoominbtn.textContent = "+";
	zoominbtn.className = "zoombutton";
	zoominbtn.addEventListener("click", () => adjustzoom(0.1));

	const zoomoutbtn = document.createElement("button");
	zoomoutbtn.textContent = "−";
	zoomoutbtn.className = "zoombutton";
	zoomoutbtn.addEventListener("click", () => adjustzoom(-0.1));

	zoomcontainer.appendChild(zoomoutbtn);
	zoomcontainer.appendChild(zoominbtn);
	document.body.appendChild(zoomcontainer);
	let activepointers = new Map();

	window.addEventListener(
		"wheel",
		(event) => {
			if (!event.ctrlKey && !event.metaKey) {
				event.preventDefault();
			}
			const delta = event.deltaY > 0 ? -0.1 : 0.1;
			adjustzoom(delta);
		},
		{passive: false}
	);

	document.addEventListener("touchstart", (event) => {
		for (const touch of event.touches) {
			activepointers.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
		}
		if (activepointers.size === 2) {
			event.preventDefault();
		}
	}, { passive: false });

	document.addEventListener("touchmove", (event) => {
		if (activepointers.size === 2) {
			event.preventDefault();
			const touches = Array.from(event.touches);
			if (touches.length === 2) {
				const [t1, t2] = touches;
				const currentDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
				const [p1, p2] = Array.from(activepointers.values());
				const previousDistance = Math.hypot(p2.x - p1.x, p2.y - p1.y);

				if (previousDistance > 0) {
					const scale = currentDistance / previousDistance;
					const delta = (scale - 1) * 0.5;
					adjustzoom(delta);
				}
				for (const touch of touches) {
					activepointers.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
				}
			}
		}
	}, { passive: false });

	document.addEventListener("touchend", (event) => {
		for (const touch of event.changedTouches) {
			activepointers.delete(touch.identifier);
		}
	});
}

function setupspinbuttons(tree3d, onrotate) {
	const spinspeed = 2; // degrees per frame
	let spininterval = null;
	let spindirection = 0;

	function createspinbutton(side) {
		const btn = document.createElement("div");
		btn.className = `spinbutton spinbutton-${side}`;
		Object.assign(btn.style, {
			position: "fixed",
			top: "50%", transform: "translateY(-50%)",
			[side]: "0", width: "60px", height: "40vh",
			minHeight: "150px", maxHeight: "400px",
			display: "flex", alignItems: "center",
			justifyContent: "center", cursor: "pointer",
			userSelect: "none", zIndex: "100",
			background: "linear-gradient(to " + (side === "left" ? "right" : "left") + ", rgba(255,255,255,0.08), transparent)",
			borderRadius: side === "left" ? "0 20px 20px 0" : "20px 0 0 20px",
		});

		const arrow = document.createElement("div");
		arrow.textContent = side === "left" ? "←" : "→";
		Object.assign(arrow.style, {
			fontSize: "24px",
			color: "rgba(255,255,255)",
			pointerEvents: "none",
		});
		btn.appendChild(arrow);

		btn.addEventListener("pointerdown", () => {
			btn.style.background = "linear-gradient(to " + (side === "left" ? "right" : "left") + ", rgba(255,255,255,0.15), transparent)";
		});
		const resetHoldStyle = () => {
			btn.style.background = "linear-gradient(to " + (side === "left" ? "right" : "left") + ", rgba(255,255,255,0.08), transparent)";
		};
		btn.addEventListener("pointerup", resetHoldStyle);
		btn.addEventListener("pointerleave", resetHoldStyle);
		btn.addEventListener("pointercancel", resetHoldStyle);
		return btn;
	}

	const leftbtn = createspinbutton("left");
	const rightbtn = createspinbutton("right");

	function startspin(direction) {
		if (spininterval) return;
		spindirection = direction;
		tree3d.style.transition = "none";
		spininterval = setInterval(() => {
			onrotate(spindirection * spinspeed);
		}, 16);
	}

	function stopspin() {
		if (spininterval) {
			clearInterval(spininterval);
			spininterval = null;
			tree3d.style.transition = "transform 0.15s ease-out";
		}
	}

	leftbtn.addEventListener("pointerdown", (e) => {
		e.preventDefault();
		startspin(-1);
	});
	leftbtn.addEventListener("pointerup", stopspin);
	leftbtn.addEventListener("pointerleave", stopspin);
	leftbtn.addEventListener("pointercancel", stopspin);

	rightbtn.addEventListener("pointerdown", (e) => {
		e.preventDefault();
		startspin(1);
	});
	rightbtn.addEventListener("pointerup", stopspin);
	rightbtn.addEventListener("pointerleave", stopspin);
	rightbtn.addEventListener("pointercancel", stopspin);

	document.body.appendChild(leftbtn);
	document.body.appendChild(rightbtn);
}

function setprogress(text) {
	if (!progresstext) return;
	const mainText = document.getElementById("progresstextmain");
	const subText = document.getElementById("progresstextsub");
	const defaultMessage = "double click any place on the tree to add a static decoration!";

	if (mainText) {
		mainText.textContent = text || "";
		if (subText) {
			if (text === defaultMessage) {
				subText.style.display = "block";
			} else {
				subText.style.display = "none";
			}
		}
	} else {
		progresstext.textContent = text || "";
	}
}

function createplusmarker(clientX, clientY, rect) {
	const marker = document.createElement("div");
	marker.className = "plusmark";
	Object.assign(marker.style, {
		position: "fixed",
		width: "30px",
		height: "30px",
		left: `${clientX}px`,
		top: `${clientY}px`,
		transform: "translate(-50%, -50%)",
		pointerEvents: "none",
		zIndex: "1000",
	});

	const svgns = "http://www.w3.org/2000/svg";
	const svg = document.createElementNS(svgns, "svg");
	svg.setAttribute("width", "30");
	svg.setAttribute("height", "30");
	svg.setAttribute("viewBox", "0 0 30 30");

	const line1 = document.createElementNS(svgns, "line");
	line1.setAttribute("x1", "15");
	line1.setAttribute("y1", "5");
	line1.setAttribute("x2", "15");
	line1.setAttribute("y2", "25");
	line1.setAttribute("stroke", "#ffffff");
	line1.setAttribute("stroke-width", "3");
	line1.setAttribute("stroke-linecap", "round");

	const line2 = document.createElementNS(svgns, "line");
	line2.setAttribute("x1", "5");
	line2.setAttribute("y1", "15");
	line2.setAttribute("x2", "25");
	line2.setAttribute("y2", "15");
	line2.setAttribute("stroke", "#ffffff");
	line2.setAttribute("stroke-width", "3");
	line2.setAttribute("stroke-linecap", "round");

	svg.appendChild(line1);
	svg.appendChild(line2);
	marker.appendChild(svg);
	return marker;
}

function removeplusmarker(marker) {
	if (marker && marker.parentNode) {
		marker.parentNode.removeChild(marker);
	}
}

function loadtreemask() {
	treeimage = new Image();
	treeimage.src = "assets/images/treemask.png";
	treeimage.crossOrigin = "anonymous";
	treeimage.onload = () => {
		treemaskcanvas = document.createElement("canvas");
		treemaskcanvas.width = treeimage.naturalWidth || treeimage.width;
		treemaskcanvas.height = treeimage.naturalHeight || treeimage.height;
		treemaskctx = treemaskcanvas.getContext("2d");
		treemaskctx.drawImage(treeimage, 0, 0);
	};
	treeimage.onerror = () => {
		console.warn("failed to load tree image for alpha hit-test");
	};
}

function computetreehit(clientx, clienty, containerrect, rotationdeg) {
	const w = containerrect.width; const h = containerrect.height;
	const relx = clientx - containerrect.left; const rely = clienty - containerrect.top;

	if (relx < 0 || relx > w || rely < 0 || rely > h) return null;
	if (!treeimage || !treemaskctx) {return { x: relx / w, y: rely / h }}

	const iw = treeimage.naturalWidth || treeimage.width;
	const ih = treeimage.naturalHeight || treeimage.height;
	if (!w || !h || !iw || !ih) return null;

	const scale = Math.min(w / iw, h / ih);
	const rw = iw * scale; const rh = ih * scale;
	const y0 = h - rh; const cx = w / 2;

	let angle = rotationdeg % 360;
	if (angle < 0) angle += 360;
	const rad = (angle * Math.PI) / 180;
	const cos = Math.cos(rad);

	if (Math.abs(cos) < 0.1) return null;
	const xlocal = (relx - cx) / cos;
	const halftree = rw / 2;
	if (Math.abs(xlocal) > halftree) return null;

	const u = (xlocal + halftree) / rw;
	const v = (rely - y0) / rh;
	if (u < 0 || u > 1 || v < 0 || v > 1) return null;

	const px = Math.floor(u * iw);
	const py = Math.floor(v * ih);
	const data = treemaskctx.getImageData(px, py, 1, 1).data;
	const alpha = data[0];
	if (alpha <= 10) return null;

	const xdisplay = (xlocal + w / 2) / w;
	const ydisplay = rely / h;

	return {
		x: clamp01(xdisplay),
		y: clamp01(ydisplay),
	};
}

async function loadstaticdecorations(fronttree, backtree, decorations) {
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

		for (const entry of payload) {
			try {
				const imageurl = entry.imageurl || entry.imageUrl;
				const x = Number(entry.x);
				const y = Number(entry.y);
				const side = Number(entry.side) === 2 ? 2 : 1;

				if (!imageurl || !isFinite(x) || !isFinite(y)) {
					continue;
				}

				const decoration = createdecorationelement({
					imageurl,
					x: clamp01(x),
					y: clamp01(y),
					side,
				});
				decorations.push(decoration);
				if (side === 1) {
					fronttree.appendChild(decoration.element);
				} else {
					backtree.appendChild(decoration.element);
				}
			} catch (err) {
				console.error("error creating decoration from entry:", err, entry);
			}
		}
	} catch (error) {
		console.error("error loading deco.json:", error);
	}
}

async function loadremotedecorations(fronttree, backtree, decorations) {
	try {
		const response = await fetch(`${workerlink}/decorations`, { cache: "default" });
		if (!response.ok) {
			if (response.status === 429) {
				console.warn("rate limited when loading decorations");
			} else {
				console.warn("failed to load remote decorations:", response.status);
			}
			return;
		}
		const remotedecos = await response.json();
		if (!Array.isArray(remotedecos)) {
			console.warn("remote decorations response is not an array");
			return;
		}

		let loaded = 0;
		for (const deco of remotedecos) {
			try {
				const imageurl = deco.imagedata || deco.imageData;
				const x = Number(deco.x);
				const y = Number(deco.y);
				const side = Number(deco.side) === 2 ? 2 : 1;

				if (!imageurl || !isFinite(x) || !isFinite(y)) {
					continue;
				}

				const decoration = createdecorationelement({
					imageurl,
					x: clamp01(x),
					y: clamp01(y),
					side,
				});
				decorations.push(decoration);
				if (side === 1) {
					fronttree.appendChild(decoration.element);
				} else {
					backtree.appendChild(decoration.element);
				}
				loaded++;
			} catch (err) {
				console.error("error creating remote decoration:", err, deco);
			}
		}

		if (loaded > 0) {
			console.log(`loaded ${loaded} remote decoration(s)`);
		}
	} catch (error) {
		console.error("error loading remote decorations:", error);
	}
}

function ensuresubmitbutton() {
	if (!submitbutton) {
		submitbutton = document.createElement("button");
		submitbutton.className = "submitbutton";
		submitbutton.textContent = "submit decoration";
		submitbutton.type = "button";
		submitbutton.addEventListener("click", handlesubmitclick, true);
		submitbutton.addEventListener("pointerdown", (e) => {
			e.stopPropagation();
		}, true);
	}
}

function showsubmitbutton() {
	if (!progresstext) return;
	ensuresubmitbutton();
	const subText = document.getElementById("progresstextsub");
	const children = Array.from(progresstext.children);
	for (const child of children) {
		if (child.id !== "progresstextsub") {
			progresstext.removeChild(child);
		}
	}
	progresstext.appendChild(submitbutton);
	if (subText && !subText.parentNode) {
		progresstext.appendChild(subText);
	}
	submitbutton.disabled = false;
	submitbutton.textContent = "submit decoration";
	submitbutton.style.pointerEvents = "auto";
	submitbutton.style.cursor = "pointer";
}

async function handlesubmitclick(event) {
	event.preventDefault();
	event.stopPropagation();

	console.log("submit button clicked", { placedfile: !!placedfile, placedplacement: !!placedplacement, hassubmitted });

	if (!placedfile || !placedplacement || hassubmitted) {
		console.warn("submit blocked:", { placedfile: !!placedfile, placedplacement: !!placedplacement, hassubmitted });
		return;
	}
	if (!submitbutton) {
		console.warn("submit button not found");
		return;
	}

	submitbutton.disabled = true;
	submitbutton.textContent = "submitting...";

	try {
		const formdata = new FormData();
		formdata.append("image", placedfile, "decoration.webp");
		formdata.append("x", placedplacement.x.toString());
		formdata.append("y", placedplacement.y.toString());
		formdata.append("side", placedplacement.side.toString());

		const response = await fetch(`${workerlink}/submit`, {
			method: "POST",
			body: formdata
		});

		if (response.ok) {
			hassubmitted = true;
			submitbutton.textContent = "submitted!";
			submitbutton.disabled = true;
			setprogress("decoration published! refresh to glare upon its beauty");
			setTimeout(() => {
				setprogress("double click any place on the tree to add a static decoration!");
				if (submitbutton && submitbutton.parentElement) {
					submitbutton.parentElement.removeChild(submitbutton);
				}
				submitbutton = null;
				placedfile = null;
				placedplacement = null;
			}, 2000);
		} else {
			const errortext = await response.text();
			submitbutton.disabled = false;
			submitbutton.textContent = "retry submit";
			const errormsg = errortext.includes("rate limited")
				? "you can place up to 5 decorations per day.."
				: `error submitting?! ${errortext}`;
			setprogress(errormsg);
			setTimeout(() => {
				if (submitbutton && !hassubmitted) {
					submitbutton.textContent = "submit decoration";
				}
				setprogress("");
			}, 3000);
		}
	} catch (error) {
		console.error("submit failed:", error);
		submitbutton.disabled = false;
		submitbutton.textContent = "retry submit";
		setprogress("error submitting?! (check console if on pc)");
		setTimeout(() => {
			if (submitbutton && !hassubmitted) {
				submitbutton.textContent = "submit decoration";
			}
			setprogress("");
		}, 3000);
	}
}

// image compressor
async function compressimage(file, maxsize, maxbytes) {
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

			let targetwidth = width;
			let targetheight = height;
			const minsize = 64;
			let quality = 0.9;

			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			const attemptcompression = () => {
				canvas.width = targetwidth;
				canvas.height = targetheight;
				ctx.clearRect(0, 0, targetwidth, targetheight);
				ctx.drawImage(img, 0, 0, targetwidth, targetheight);

				canvas.toBlob((blob) => {
					if (!blob) {
						reject(new Error("failed to convert to webp?!"));
						return;
					}

					if (blob.size <= maxbytes) {
						resolve(blob);
						return;
					}

					if (quality > 0.4) {
						quality = Math.max(0.4, quality - 0.1);
						canvas.toBlob((qblob) => {
							if (qblob && qblob.size <= maxbytes) {
								resolve(qblob);
							} else if (targetwidth > minsize && targetheight > minsize) {
								targetwidth = Math.floor(targetwidth * 0.88);
								targetheight = Math.floor(targetheight * 0.88);
								quality = 0.85;
								attemptcompression();
							} else {
								resolve(qblob || blob);
							}
						}, "image/webp", quality);
					} else if (targetwidth > minsize && targetheight > minsize) {
						targetwidth = Math.floor(targetwidth * 0.88);
						targetheight = Math.floor(targetheight * 0.88);
						quality = 0.85;
						attemptcompression();
					} else {
						resolve(blob);
					}
				}, "image/webp", quality);
			};

			attemptcompression();
		};
		img.onerror = reject;
		img.src = URL.createObjectURL(file);
	});
}

function clamp01(v) {
	if (v < 0) return 0;
	if (v > 1) return 1;
	return v;
}
