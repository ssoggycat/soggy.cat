const progresstext = document.getElementById("progresstext");

let currentzoom = 1;
let treeimage = null;
let treemaskcanvas = null;
let treemaskctx = null;
let decorations = [];
let lazyobserver = null;
let treemaskoverlay = null;
let treemaskoverlaycanvas = null;
let treemaskoverlayctx = null;
const maskeddecorationcache = new Map();
let isdraggingtree = false;
let treehasdragged = false;
const imageprocessingqueue = [];
let isprocessingqueue = false;

let presentscontainer = null;
let presentsready = false;

// decrease for worse quality but better performance
const resscale = 8;
const loaddeco = true;

if (!progresstext) {console.error("required dom elements not found?!")}
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
	const scalewrapper = document.createElement("div");
	scalewrapper.id = "tree-scale-wrapper";
	Object.assign(scalewrapper.style, {
		position: "absolute",
		left: "0", top: "0",
		width: "100%", height: "100%",
		transform: `scale(${1/resscale})`,
		WebkitTransform: `scale(${1/resscale})`,
		transformOrigin: "top left",
		pointerEvents: "none",
	});
	const perspectivewrapper = document.createElement("div");
	perspectivewrapper.id = "tree-perspective";
	Object.assign(perspectivewrapper.style, {
		position: "absolute",
		left: "0", top: "0",
		width: `${100 * resscale}%`,
		height: `${100 * resscale}%`,
		perspective: `${2000 * resscale}px`,
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
		userSelect: "none", willChange: "transform",
	});
	const fronttree = createtreeside("front");
	const backtree = createtreeside("back");
	tree3d.appendChild(fronttree);
	tree3d.appendChild(backtree);
	perspectivewrapper.appendChild(tree3d);
	scalewrapper.appendChild(perspectivewrapper);
	container.appendChild(scalewrapper);
	document.body.appendChild(container);

	window.treecontainer = container;
	window.tree3d = tree3d;
	decorations = [];
	let isdragging = false;
	let dragstartx = 0; let dragstarty = 0;
	let activepointerid = null;
	let dragstartedondeco = false;
	let rotationy = 0;
	let panx = 0; let pany = 0;
	function updatecontainertransform() {
		container.style.transform = `translate(${panx}px, ${pany}px) scale(${currentzoom}) translate(-50%, -50%)`;
		container.style.WebkitTransform = `translate(${panx}px, ${pany}px) scale(${currentzoom}) translate(-50%, -50%)`;
		if (presentsready) {
			updatepresentsposition();
		}
	}
	function updatetreerotation() {
		tree3d.style.transform = `rotateY(${rotationy}deg)`;
		tree3d.style.WebkitTransform = `rotateY(${rotationy}deg)`;
		tree3d.style.willChange = "transform";
        const side = sidefromrotation(rotationy);
        if (side === 1) {
            fronttree.style.pointerEvents = "auto";
            fronttree.style.visibility = "visible";
            fronttree.style.zIndex = "10";
            backtree.style.pointerEvents = "none";
            backtree.style.visibility = "hidden";
            backtree.style.zIndex = "0";
        } else {
            fronttree.style.pointerEvents = "none";
            fronttree.style.visibility = "hidden";
            fronttree.style.zIndex = "0";
            backtree.style.pointerEvents = "auto";
            backtree.style.visibility = "visible";
            backtree.style.zIndex = "10";
        }
		if (presentsready && presentscontainer && !animationcompleted && !isfadingoutpresents) {
			const opacity = side === 1 ? "1" : "0.5";
			presentscontainer.style.opacity = opacity;
		}
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
			event.target.closest("#gift-overlay") ||
			event.target.tagName === "BUTTON" ||
			event.target.tagName === "A" ||
			event.target.tagName === "INPUT"
		) {return}
		dragstartedondeco = !!event.target.closest(".decoration");
		isdragging = true;
		isdraggingtree = !dragstartedondeco;
		treehasdragged = false;
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
		if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
			treehasdragged = true;
		}
		dragstartx = event.clientX;
		dragstarty = event.clientY;
		if (isdraggingtree && !dragstartedondeco) {
			panx += dx; pany += dy;
			updatecontainertransform();
		}
	};
	const handlepointerend = (event) => {
		if (!isdragging || (activepointerid !== null && event.pointerId !== activepointerid)) return;
		isdragging = false;
		setTimeout(() => {
			isdraggingtree = false;
			treehasdragged = false;
		}, 100);
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
	function adjustzoom(delta, zoompointx = null, zoompointy = null) {
		const oldzoom = currentzoom;
		currentzoom = Math.max(0.25, Math.min(10.0, currentzoom + delta));
		if (zoompointx !== null && zoompointy !== null) {
			const rect = container.getBoundingClientRect();
			const containercenterx = rect.left + rect.width / 2;
			const containercentery = rect.top + rect.height / 2;
			const mousex = zoompointx - containercenterx;
			const mousey = zoompointy - containercentery;
			const zoomratio = currentzoom / oldzoom;
			panx = mousex - (mousex - panx) * zoomratio;
			pany = mousey - (mousey - pany) * zoomratio;
		}
		updatecontainertransform();
	}
	setupzoomcontrols(adjustzoom);
	loadtreemask();
	if (loaddeco) {loaddecorationsfromjson(fronttree, backtree, decorations)}
	setuplazyloading();
}

function createtreeside(which) {
	const side = document.createElement("div");
	side.className = `tree-side tree-side-${which}`;
	Object.assign(side.style, {
		position: "absolute",
		left: "0", top: "0",
		width: "100%",
		height: "100%",
		display: "flex",
		alignItems: "flex-end",
		justifyContent: "center",
	});
	const img = document.createElement("img");
	img.src = "assets/images/treeflatxl.webp";
	img.alt = "";
	Object.assign(img.style, {
		width: "100%", height: "100%",
		objectFit: "contain",
		objectPosition: "center bottom",
		pointerEvents: "none",
		userSelect: "none",
        position: "absolute",
        zIndex: "0",
	});
	side.appendChild(img);

    const decorationsLayer = document.createElement("div");
    decorationsLayer.className = "decorations-layer";
    Object.assign(decorationsLayer.style, {
        position: "absolute",
        left: "0", top: "0",
        width: "100%", height: "100%",
        pointerEvents: "none",
        zIndex: "1",
        maskImage: "url(assets/images/treemask.webp)",
        webkitMaskImage: "url(assets/images/treemask.webp)",
        maskSize: "cover",
        webkitMaskSize: "cover",
        maskPosition: "center bottom",
        webkitMaskPosition: "center bottom",
        maskRepeat: "no-repeat",
        webkitMaskRepeat: "no-repeat",
        maskMode: "alpha",
        webkitMaskMode: "alpha"
    });
    side.appendChild(decorationsLayer);
    side.decorationsLayer = decorationsLayer;

	if (which === "front") {
		side.style.transform = "rotateY(0deg) translateZ(1px)";
		side.style.WebkitTransform = "rotateY(0deg) translateZ(1px)";
	} else {
		side.style.transform = "rotateY(180deg) translateZ(1px)";
		side.style.WebkitTransform = "rotateY(180deg) translateZ(1px)";
	}
	return side;
}

function createdecorationelement({imageurl, x, y, side, username, userid, id}) {
	const el = document.createElement("div");
	el.className = "decoration";
	if (id) {el.dataset.decorationid = id}
	const img = document.createElement("img");
	img.alt = "";
	img.draggable = false;
	img.dataset.src = imageurl;
	img.loading = "lazy";
	Object.assign(img.style, {
		width: "100%", height: "100%",
		objectFit: "contain",
		pointerEvents: "none",
		userSelect: "none",
		WebkitUserDrag: "none",
		opacity: "0",
		imageRendering: "auto",
	});
	const sizepercent = 2;
	const halfsize = sizepercent / 200;
	const clampedx = Math.max(halfsize, Math.min(1 - halfsize, x));
	const clampedy = Math.max(halfsize, Math.min(1 - halfsize, y));
	Object.assign(el.style, {
		position: "absolute",
		left: `${clampedx * 100}%`,
		top: `${clampedy * 100}%`,
		transform: `translate(-50%, -50%)`,
		WebkitTransform: `translate(-50%, -50%)`,
		width: `${sizepercent}%`,
		aspectRatio: "1 / 1",
		pointerEvents: "auto",
		userSelect: "none",
		backfaceVisibility: "visible",
		WebkitBackfaceVisibility: "visible",
		overflow: "visible",
		willChange: "transform",
		transformStyle: "preserve-3d",
		WebkitTransformStyle: "preserve-3d",
	});
	el.appendChild(img);
	if (username || userid) {
		el.title = username ? `${username}${userid ? ` (${userid})` : ""}` : userid;
		const tooltip = document.createElement("div");
		tooltip.className = "decoration-tooltip";
		tooltip.textContent = username || userid || "";
		Object.assign(tooltip.style, {
			position: "absolute",
			bottom: "100%", left: "50%",
			transform: "translate3d(-50%, 0, 100px)",
			WebkitTransform: "translate3d(-50%, 0, 100px)",
			background: "rgba(0, 0, 0, 0.8)",
			color: "white",
			padding: "4px 8px", borderRadius: "4px",
			fontSize: "10px", fontFamily: "Spline Sans Mono",
			whiteSpace: "nowrap",
			pointerEvents: "none", opacity: "0",
			transition: "opacity 0.2s",
			marginBottom: "4px",
			zIndex: "999999",
			transformOrigin: "center bottom",
			transformStyle: "flat",
			WebkitTransformStyle: "flat",
			backfaceVisibility: "visible",
			WebkitBackfaceVisibility: "visible",
			display: "block",
		});
		el.appendChild(tooltip);
		el.addEventListener("mouseenter", (e) => {
			e.stopPropagation();
			tooltip.style.opacity = "1";
		});
		el.addEventListener("mouseleave", (e) => {
			e.stopPropagation();
			tooltip.style.opacity = "0";
		});
		el.addEventListener("pointerenter", (e) => {
			e.stopPropagation();
			tooltip.style.opacity = "1";
		});
		el.addEventListener("pointerleave", (e) => {
			e.stopPropagation();
			tooltip.style.opacity = "0";
		});
	}
	el.addEventListener("dragstart", (e) => e.preventDefault());
	el.addEventListener("click", (e) => {
		if (treehasdragged) {
			e.stopPropagation();
			return;
		}
		e.stopPropagation();
		showdecorationoverlay(imageurl, username, x, y);
	});
	return {
		element: el, imageurl,
		x, y, side, id,
		img: img,
	};
}

/*//////////////////////////////////////////////////////////////////////*/

function setuplazyloading() {
	if (!window.IntersectionObserver) {
		document.querySelectorAll(".decoration img[data-src]").forEach(img => {
			const imageurl = img.dataset.src;
			img.src = imageurl;
            img.style.transition = "opacity 0.2s ease";
			img.onload = () => { img.style.opacity = "1"; };
		});
		return;
	}
	lazyobserver = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const img = entry.target;
				if (img.dataset.src) {
					const imageurl = img.dataset.src;
					img.src = imageurl;
                    img.style.transition = "opacity 0.2s ease";
					img.onload = () => {
						img.style.opacity = "1";
					};
					img.removeAttribute("data-src");
					lazyobserver.unobserve(img);
				}
			}
		});
	}, {
		rootMargin: "200px",
		threshold: 0
	});
}

function observedecorations() {
	if (!lazyobserver) return;
	document.querySelectorAll(".decoration img[data-src]").forEach(img => {
		lazyobserver.observe(img);
	});
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
	let wheeltimeout = null;
	let lastwheeltime = 0;
	const wheelthrottle = 16;
	window.addEventListener(
		"wheel",
		(event) => {
			if (!event.ctrlKey && !event.metaKey) {
				event.preventDefault();
			}
			const now = performance.now();
			if (now - lastwheeltime < wheelthrottle) {
				if (wheeltimeout) return;
				wheeltimeout = setTimeout(() => {
					const delta = event.deltaY > 0 ? -0.1 : 0.1;
					adjustzoom(delta, event.clientX, event.clientY);
					wheeltimeout = null;
					lastwheeltime = performance.now();
				}, wheelthrottle - (now - lastwheeltime));
				return;
			}
			lastwheeltime = now;
			const delta = event.deltaY > 0 ? -0.1 : 0.1;
			adjustzoom(delta, event.clientX, event.clientY);
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
		if (event.touches.length === 1) {
			const touch = event.touches[0];
			const now = Date.now();
			if (lasttouchtime && now - lasttouchtime < 300 &&
			    Math.abs(touch.clientX - lasttouchx) < 10 &&
			    Math.abs(touch.clientY - lasttouchy) < 10) {
				event.preventDefault();
			}
			lasttouchtime = now;
			lasttouchx = touch.clientX;
			lasttouchy = touch.clientY;
		}
	}, { passive: false });
	let lasttouchtime = 0;
	let lasttouchx = 0;
	let lasttouchy = 0;
	document.addEventListener("touchmove", (event) => {
		if (activepointers.size === 2) {
			event.preventDefault();
			const touches = Array.from(event.touches);
			if (touches.length === 2) {
				const [t1, t2] = touches;
				const currentdistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
				const [p1, p2] = Array.from(activepointers.values());
				const previousdistance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
				if (previousdistance > 0) {
					const scale = currentdistance / previousdistance;
					const delta = (scale - 1) * 0.5;
					const centerx = (t1.clientX + t2.clientX) / 2;
					const centery = (t1.clientY + t2.clientY) / 2;
					adjustzoom(delta, centerx, centery);
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
	const spinspeed = 2;
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
		const resetholdstyle = () => {
			btn.style.background = "linear-gradient(to " + (side === "left" ? "right" : "left") + ", rgba(255,255,255,0.08), transparent)";
		};
		btn.addEventListener("pointerup", resetholdstyle);
		btn.addEventListener("pointerleave", resetholdstyle);
		btn.addEventListener("pointercancel", resetholdstyle);
		return btn;
	}
	const leftbtn = createspinbutton("left");
	const rightbtn = createspinbutton("right");
	function startspin(direction) {
		if (spininterval) return;
		spindirection = direction;
		tree3d.style.transition = "none";
		tree3d.style.willChange = "transform";
		let lasttime = performance.now();
		const animate = (currenttime) => {
			if (!spininterval) return;
			const delta = currenttime - lasttime;
			lasttime = currenttime;
			onrotate(spindirection * spinspeed * (delta / 16));
			spininterval = requestAnimationFrame(animate);
		};
		spininterval = requestAnimationFrame(animate);
	}
	function stopspin() {
		if (spininterval) {
			cancelAnimationFrame(spininterval);
			spininterval = null;
			tree3d.style.transition = "transform 0.15s ease-out";
			setTimeout(() => {
				tree3d.style.willChange = "transform";
			}, 200);
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

let decorationoverlay = null;

function showdecorationoverlay(imageurl, username, decox, decoy) {
	if (decorationoverlay) {
		closedecorationoverlay();
	}

	decorationoverlay = document.createElement("div");
	decorationoverlay.id = "decoration-overlay";
	Object.assign(decorationoverlay.style, {
		position: "fixed",
		top: "0", left: "0",
		width: "100%", height: "100%",
		background: "rgba(0, 0, 0, 0.75)",
		zIndex: "10000",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		opacity: "0",
		transition: "opacity 0.2s ease-in",
		pointerEvents: "auto",
	});

	const imagecontainer = document.createElement("div");
	Object.assign(imagecontainer.style, {
		width: "min(400px, 75vw)",
		height: "min(400px, 75vw)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: "20px",
		pointerEvents: "auto",
	});

	const overlayimg = document.createElement("img");
	overlayimg.src = imageurl;
	overlayimg.alt = "";
	Object.assign(overlayimg.style, {
		maxWidth: "100%",
		maxHeight: "100%",
		width: "100%",
		height: "100%",
		objectFit: "contain",
		pointerEvents: "none",
		userSelect: "none",
	});
	imagecontainer.appendChild(overlayimg);

	imagecontainer.addEventListener("click", (e) => {
		e.stopPropagation();
	});

	if (username) {
		const usernametext = document.createElement("div");
		usernametext.id = "decoration-overlay-username";
		Object.assign(usernametext.style, {
			position: "fixed",
			bottom: "20px",
			left: "50%",
			transform: "translateX(-50%)",
			color: "white",
			textAlign: "center",
			fontFamily: "Spline Sans Mono",
			fontSize: "16px",
			padding: "10px 20px",
			borderRadius: "5px",
			pointerEvents: "none",
			userSelect: "none",
			textShadow: "0 0 8px rgba(0, 0, 0, 1), 0 0 18px rgba(0, 0, 0, 0.9), 0 0 32px rgba(0, 0, 0, 0.8), 0 4px 12px rgba(0, 0, 0, 0.9)",
		});
		usernametext.textContent = `by ${username}`;
		decorationoverlay.appendChild(usernametext);
	}

	decorationoverlay.appendChild(imagecontainer);

	decorationoverlay.addEventListener("click", (e) => {
		if (e.target === decorationoverlay) {
			closedecorationoverlay();
		}
	});

	document.body.appendChild(decorationoverlay);
	requestAnimationFrame(() => {
		decorationoverlay.style.opacity = "1";
	});
}

function closedecorationoverlay() {
	if (!decorationoverlay) return;
	decorationoverlay.style.opacity = "0";
	setTimeout(() => {
		if (decorationoverlay && decorationoverlay.parentNode) {
			decorationoverlay.parentNode.removeChild(decorationoverlay);
		}
		decorationoverlay = null;
	}, 200);
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

	treemaskoverlay = new Image();
	treemaskoverlay.src = "assets/images/treemask.webp";
	treemaskoverlay.crossOrigin = "anonymous";
	treemaskoverlay.onload = () => {
		treemaskoverlaycanvas = document.createElement("canvas");
		treemaskoverlaycanvas.width = treemaskoverlay.naturalWidth || treemaskoverlay.width;
		treemaskoverlaycanvas.height = treemaskoverlay.naturalHeight || treemaskoverlay.height;
		treemaskoverlayctx = treemaskoverlaycanvas.getContext("2d");
		treemaskoverlayctx.drawImage(treemaskoverlay, 0, 0);
	};
	treemaskoverlay.onerror = () => {
		console.warn("failed to load tree mask for overlay");
		treemaskoverlay = null;
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

async function loaddecorationsfromjson(fronttree, backtree, decorations) {
	try {
		const response = await fetch("deco.json");
		if (!response.ok) {
			console.warn("failed to load decorations from deco.json:", response.status);
			return;
		}
		const decos = await response.json();
		if (!Array.isArray(decos)) {
			console.warn("deco.json response is not an array");
			return;
		}
		let loaded = 0;
		const batchsize = 25;
		let batchindex = 0;
		const loadbatch = () => {
			const batch = decos.slice(batchindex, batchindex + batchsize);
			for (const deco of batch) {
				try {
					const imageurl = deco.imagepath || deco.imagedata || deco.imageData;
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
						username: deco.username,
						userid: deco.userid,
						id: deco.id,
					});
					decorations.push(decoration);
					if (side === 1) {
                        if (fronttree.decorationsLayer) fronttree.decorationsLayer.appendChild(decoration.element);
						else fronttree.appendChild(decoration.element); // fallback
					} else {
                        if (backtree.decorationsLayer) backtree.decorationsLayer.appendChild(decoration.element);
						else backtree.appendChild(decoration.element); // fallback 2
					}
					loaded++;
				} catch (err) {
					console.error("error creating decoration:", err, deco);
				}
			}
			batchindex += batchsize;
			if (batchindex < decos.length) {
				requestAnimationFrame(loadbatch);
			} else {
				if (loaded > 0) {
					console.log(`loaded ${loaded} decoration(s)`);
				}
				setTimeout(observedecorations, 100);
			}
		};
		loadbatch();
	} catch (error) {
		console.error("error loading decorations from deco.json:", error);
	}
}

function clamp01(v) {
	if (v < 0) return 0;
	if (v > 1) return 1;
	return v;
}

/*//////////////////////////////////////////////////////////////////////*/

// gift animation
let giftoverlay = null; let giftcontainer = null;
let giftpart1 = null; let giftpart2 = null; let giftpart3 = null;
let giftpartreward = null; let iscutsceneplaying = false;
let animationcompleted = false; let isfadingoutpresents = false;

function updatepresentsposition() {if (!presentsready || !presentscontainer) return}
function createpresents() {
	presentscontainer = document.createElement("div");
	presentscontainer.id = "presents-container";
	const decorationsize = 20;
	const container = window.treecontainer || document.getElementById("tree-container");
	if (!container) {
		setTimeout(createpresents, 100);
		return;
	}
	const tree3d = window.tree3d || document.getElementById("tree-3d");
	if (!tree3d) {
		setTimeout(createpresents, 100);
		return;
	}
	const containerwidth = container.offsetWidth || parseInt(getComputedStyle(container).width);
	Object.assign(presentscontainer.style, {
		position: "absolute",
		left: "0", bottom: "0", width: "100%",
		display: "flex", justifyContent: "space-around",
		alignItems: "flex-end", flexWrap: "wrap",
		gap: "20px", padding: "20px",
		pointerEvents: "none", transformStyle: "preserve-3d",
		WebkitTransformStyle: "preserve-3d", backfaceVisibility: "visible",
		WebkitBackfaceVisibility: "visible",
		transform: "translateZ(10px)", WebkitTransform: "translateZ(10px)",
	});
	const decorationsizepx = (decorationsize / 100) * containerwidth;
	const avgpresentsize = decorationsizepx * 2.5; const spacing = 5;
	const numpresents = Math.max(10, Math.floor((containerwidth - 40) / (avgpresentsize + spacing)) * 3);

	for (let i = 0; i < numpresents; i++) {
		const sizemultiplier = 1.2 + Math.random() * 2.6;
		const sizepx = decorationsizepx * sizemultiplier;
		const present = document.createElement("img");
		present.src = "assets/images/presentsmall.webp";
		present.className = "present-small";
		present.alt = "";
		present.draggable = false;
		Object.assign(present.style, {
			width: `${sizepx}px`,
			height: "auto",
			display: "block",
			pointerEvents: "auto",
		});
		present.addEventListener("click", (e) => {
			e.stopPropagation();
			if (!iscutsceneplaying && !animationcompleted) {
				showgiftoverlay();
			}
		});
		presentscontainer.appendChild(present);
	}
	tree3d.appendChild(presentscontainer);
	presentsready = true;
	presentscontainer.style.opacity = "1";
}

function showgiftoverlay() {
	if (giftoverlay) {
		closegiftoverlay();
		return;
	}
	giftoverlay = document.createElement("div");
	giftoverlay.id = "gift-overlay";
	giftcontainer = document.createElement("div");
	giftcontainer.id = "gift-container";
	giftcontainer.style.transform = "scaleY(1)";

	giftpart2 = document.createElement("img");
	giftpart2.id = "giftpart2";
	giftpart2.className = "giftpart";
	giftpart2.src = "assets/images/parts/present2.webp";
	giftpart2.alt = "";
	giftpart2.draggable = false;

	giftpartreward = document.createElement("img");
	giftpartreward.id = "giftpartreward";
	giftpartreward.className = "giftpart";
	giftpartreward.src = "assets/images/parts/presentreward.webp";
	giftpartreward.alt = "";
	giftpartreward.draggable = false;
	giftpartreward.style.opacity = "0";
	giftpartreward.style.transform = "scale(0.5)";
	giftpartreward.style.transformOrigin = "center center";

	giftpart1 = document.createElement("img");
	giftpart1.id = "giftpart1";
	giftpart1.className = "giftpart";
	giftpart1.src = "assets/images/parts/present1.webp";
	giftpart1.alt = "";
	giftpart1.draggable = false;

	giftpart3 = document.createElement("img");
	giftpart3.id = "giftpart3";
	giftpart3.className = "giftpart";
	giftpart3.src = "assets/images/parts/present3.webp";
	giftpart3.alt = "";
	giftpart3.draggable = false;

	giftcontainer.appendChild(giftpart2);
	giftcontainer.appendChild(giftpartreward);
	giftcontainer.appendChild(giftpart1);
	giftcontainer.appendChild(giftpart3);
	giftoverlay.appendChild(giftcontainer);

	giftcontainer.style.pointerEvents = "auto";
	giftcontainer.style.cursor = "pointer";

	const handlegiftclick = (e) => {
		e.stopPropagation();
		if (!iscutsceneplaying) {
			startgiftcutscene();
		}
	};

	giftcontainer.addEventListener("click", handlegiftclick);
	giftpart1.addEventListener("click", handlegiftclick);
	giftpart2.addEventListener("click", handlegiftclick);
	giftpart3.addEventListener("click", handlegiftclick);
	giftpartreward.addEventListener("click", handlegiftclick);

	giftoverlay.addEventListener("click", (e) => {
		if (e.target === giftoverlay && !iscutsceneplaying) {
			startgiftcutscene();
		}
	});
	giftoverlay.addEventListener("pointerdown", (e) => {
		e.stopPropagation();
	});
	giftoverlay.addEventListener("mousedown", (e) => {
		e.stopPropagation();
	});
	giftoverlay.addEventListener("touchstart", (e) => {
		e.stopPropagation();
	});
	document.body.appendChild(giftoverlay);
	requestAnimationFrame(() => {
		giftoverlay.classList.add("show");
	});
}

function closegiftoverlay() {
	if (!giftoverlay) return;
	giftoverlay.classList.remove("show");
	setTimeout(() => {
		if (giftoverlay && giftoverlay.parentNode) {
			giftoverlay.parentNode.removeChild(giftoverlay);
		}
		giftoverlay = null; giftcontainer = null;
		giftpart1 = null; giftpart2 = null; giftpart3 = null;
		giftpartreward = null;
	}, 300);
}

function startgiftcutscene() {
	if (iscutsceneplaying || !giftpart3) return;
	iscutsceneplaying = true;
	const obtainedel = document.querySelector(".obtained");
	if (obtainedel) {
		obtainedel.classList.remove("show");
		obtainedel.style.opacity = "0";
		obtainedel.style.pointerEvents = "none";
	}
	const pop = new Audio("assets/audio/pop.mp3"); pop.play();
	giftpart3.style.transition = "none";
	requestAnimationFrame(() => {
		giftpart3.style.transform = "translateY(-30px) rotate(15deg)";
		giftpart3.style.transition = "transform 0.2s ease-out";
		setTimeout(() => {
			giftpart3.style.transition = "transform 0.8s ease-in";
			giftpart3.style.transform = `translateY(${window.innerHeight + 100}px) rotate(15deg)`;
			setTimeout(() => {
				startrewardanimation();
			}, 800);
		}, 200);
	});
	setTimeout(() => {
		showobtained();
	}, 3000);
}

function startrewardanimation() {
	if (!giftpartreward) return;
	const jetfly = new Audio("assets/audio/jetfly.mp3"); jetfly.play();
	giftpartreward.style.opacity = "0";
	giftpartreward.style.transition = "opacity 0.25s ease";
	requestAnimationFrame(() => {
		giftpartreward.style.opacity = "1";
	});
	const tree3d = document.getElementById("tree-3d");
	if (tree3d) {
		tree3d.style.transition = "transform 0.5s ease-out";
		tree3d.style.transform = "rotateY(0deg) rotateX(-10deg)";
	}
	setTimeout(() => {
		const starttime = performance.now();
		const duration = 3000;
		const traveldistance = window.innerHeight + 200;
		const present3falleny = window.innerHeight + 100;
		function animatereward() {
			const elapsed = performance.now() - starttime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(2, -10 * progress);
			const rewardabsolutey = -traveldistance * eased;
			const cameray = rewardabsolutey * 0.8;
			const cameraoffset = -cameray;
			giftpartreward.style.transform = `translateY(${rewardabsolutey}px) scale(0.5)`;
			giftpartreward.style.WebkitTransform = `translateY(${rewardabsolutey}px) scale(0.5)`;
			if (giftpart1) {
				giftpart1.style.transform = `translateY(${cameraoffset}px)`;
				giftpart1.style.WebkitTransform = `translateY(${cameraoffset}px)`;
			}
			if (giftpart2) {
				giftpart2.style.transform = `translateY(${cameraoffset}px)`;
				giftpart2.style.WebkitTransform = `translateY(${cameraoffset}px)`;
			}
			if (giftpart3) {
				const present3y = present3falleny + cameraoffset;
				giftpart3.style.transform = `translateY(${present3y}px) rotate(15deg)`;
				giftpart3.style.WebkitTransform = `translateY(${present3y}px) rotate(15deg)`;
			}
			if (progress < 1) {
				requestAnimationFrame(animatereward);
			}
		}
		requestAnimationFrame(animatereward);
	}, 250);
}

function showobtained() {
	const obtainedel = document.querySelector(".obtained");
	const hk = new Audio("assets/audio/hkobtained.mp3"); hk.play();
	obtainedel.style.transition = "opacity 2s ease";
	obtainedel.style.opacity = "1";
	obtainedel.style.pointerEvents = "auto";
	obtainedel.classList.add("show");
	setTimeout(() => {
		obtainedel.style.transition = "opacity 5s ease";
		obtainedel.style.opacity = "0";
		obtainedel.style.pointerEvents = "none";
		if (giftoverlay) {
			giftoverlay.style.transition = "opacity 5s ease";
			giftoverlay.style.opacity = "0";
		}
		if (presentscontainer) {
			isfadingoutpresents = true;
			presentscontainer.style.transition = "opacity 5s ease";
			presentscontainer.style.opacity = "0";
			presentscontainer.style.pointerEvents = "none";
		}
		setTimeout(() => {
			obtainedel.classList.remove("show");
			const tree3d = document.getElementById("tree-3d");
			if (tree3d) {
				tree3d.style.transition = "transform 0.5s ease-out";
				tree3d.style.transform = "rotateY(0deg) rotateX(0deg)";
			}
			closegiftoverlay();
			iscutsceneplaying = false;
			animationcompleted = true;
		}, 5000);
	}, 4000);
}

setTimeout(() => {
	createpresents();
}, 100);
