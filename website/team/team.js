document.addEventListener("contextmenu", (event) => {
	event.preventDefault();
});

const sog = document.querySelector(".smallsog");
const flash = document.querySelector(".flash");
const discord = document.querySelector(".discord");
const videoBackground = document.getElementById("video-background");
const cocaine = document.getElementById("cocaine");

let introactivated = false;

for (let i = 0; i < 9; i++) {
		const clone = document.querySelector(".snowflake").cloneNode(true);
		document.querySelector(".snowflakes").appendChild(clone);
}

// MAIN PART
function badgesout(fade) {
	document.querySelectorAll(".footerb > *").forEach(function (badge) {
		badge.style.transition = fade ? `opacity 0.75s ease ${Math.random() * 0.5}s` : "none";
		badge.style.opacity = "0";
	});
}
function badgesback(fade) {
	document.querySelectorAll(".footerb > *").forEach(function (badge) {
		badge.style.transition = fade ? `opacity 0.5s ease ${Math.random() * 0.3}s` : "none";
		badge.style.opacity = "";
	});
}

function intro() {
	sogdvd();
	sog.style.pointerEvents = "none";
	if (videoBackground.readyState === 0) {videoBackground.load()}
	document.querySelector(".song").style.display = "block";
	document.querySelector(".smallsogt").style.opacity = "0";
	document.querySelector(".skipintro").style.display = "none";

	if (track.instant) {
		sog.style.opacity = "0";
		badgesout(false);
		document.querySelector(".overlay").style.display = "none";
		document.querySelector(".smallsogt").style.display = "none";
		if (track.wtf) {document.body.classList.add("wtf")}
		videoBackground.play().catch(function () {});
		setTimeout(function () {badgesback(true)}, 700);
		return;
	}

	// the intro pace follows the track's loop point (the white fade out doesn't)
	const introtime = track.loop;
	sog.style.animation = `slide ${introtime / 0.75}s cubic-bezier(0.550, 0.085, 0.680, 0.530) forwards`;
	flash.style.transition = `opacity ${introtime}s ease-in`;
	flash.style.opacity = "1";
	badgesout(true);
	setTimeout(function () {
		let revealed = false;
		function reveal() {
			if (revealed) return;
			revealed = true;
			document.querySelector(".overlay").style.display = "none";
			document.querySelector(".smallsogt").style.display = "none";
			flash.style.transition = "opacity 2s ease-in-out";
			flash.style.opacity = "0";
			badgesback(false);
		}
		videoBackground.play().then(reveal).catch(reveal);
		setTimeout(reveal, 5000);
	}, introtime * 1000);
}
document.addEventListener("DOMContentLoaded", function () {
	setTimeout(function () {
		if (!introactivated) {
			document.querySelector(".smallsogt").style.opacity = "0.5";
		}
	}, 2000);
});

// click the bart (sog)
document.addEventListener("click", function (event) {
	if (event.target.classList.contains("smallsog") && !introactivated) {
		introactivated = true;
		if (context.state === "suspended") {context.resume()}
		songwhenready(0);
		intro();
	}
});

////////////////////////////////////////////////////////////////

// bouncy little guys
function sogdvd() {
	const sogImageSrc = "/static/ssoggycat/team/images/cheese.webp";

	function birth(container) {
		for (let i = 0; i < 6; i++) {
			const img = document.createElement("img");
			img.src = sogImageSrc;
			img.classList.add("sog");
			img.style.position = "absolute";
			img.style.width = "50px"; img.style.height = "50px";

			const sogdiv = container.getBoundingClientRect();
			const rtop = Math.random() * (sogdiv.height - 50);
			const rleft = Math.random() * (sogdiv.width - 50);

			img.style.top = `${rtop}px`; img.style.left = `${rleft}px`;
			img.dataset.dx = (Math.random() * 2 - 1) * 2; img.dataset.dy = (Math.random() * 2 - 1) * 2;
			img.dataset.angle = Math.random() * 360;

			const blur = Math.random() * 3;
			const skewX = Math.random() * 10 - 5; const skewY = Math.random() * 10 - 5;

			img.style.filter = `blur(${blur}px)`;
			img.style.transform = `skew(${skewX}deg, ${skewY}deg)`;

			container.appendChild(img);
		}
	}

	function youth(container) {
		const sogs = container.querySelectorAll(".sog");
		const sogdiv = container.getBoundingClientRect();

		sogs.forEach((sog) => {
			let dx = parseFloat(sog.dataset.dx); let dy = parseFloat(sog.dataset.dy);
			let angle = parseFloat(sog.dataset.angle);
			let left = parseFloat(sog.style.left) + dx; let top = parseFloat(sog.style.top) + dy;

			if (left <= 0 || left + 50 >= sogdiv.width) {
				dx *= -1; left = Math.max(0, Math.min(left, sogdiv.width - 50));
			}
			if (top <= 0 || top + 50 >= sogdiv.height) {
				dy *= -1; top = Math.max(0, Math.min(top, sogdiv.height - 50));
			}

			sog.style.left = `${left}px`;
			sog.style.top = `${top}px`;
			sog.style.transform = `rotate(${(angle += 2) % 360}deg)`;

			sog.dataset.dx = dx;
			sog.dataset.dy = dy;
			sog.dataset.angle = angle;
		});
		requestAnimationFrame(() => youth(container));
	}
	document.addEventListener("DOMContentLoaded", () => {
		document.querySelectorAll(".sogs").forEach((container) => {
			birth(container); youth(container);
		});
	});
}
sogdvd();

////////////////////////////////////////////////////////////////

// big text motion blur
const title = document.querySelector(".title");
document.body.style.overflow = "hidden";

function ghost(x, y) {
	let ghost = document.createElement("div");
	ghost.textContent = title.textContent;
	ghost.className = "ghost";

	let titleStyles = window.getComputedStyle(title);
	let width = title.getBoundingClientRect().width;

	ghost.style.left = `${x + width / 2}px`;
	ghost.style.top = `${y}px`;
	ghost.style.transform = titleStyles.transform;

	document.body.appendChild(ghost);
	setTimeout(() => ghost.remove(), 500);
}
let angle = 0;
function animate() {
	ghost(title.getBoundingClientRect().left, title.getBoundingClientRect().top);
	angle += 0.05;
	requestAnimationFrame(animate);
}
animate();

// the secret fourth thing (i don't know what to put there it's a placeholder for now lol)
document.querySelector(".b4").addEventListener("click", function () {
	songstop();
	cocaine.style.display = "block";
	videoBackground.pause();
	videoBackground.currentTime = Math.random() * videoBackground.duration;
	cocaine.play();
	cocaine.onended = function () {
		videoBackground.play();
		setTimeout(() => {
			cocaine.style.display = "none";
			songresume();
		}, Math.random() > 0.25 ? 100 : 10000);
	};
});

// copy button code
document.addEventListener("mousedown", (e) => {
	if (e.button !== 2) return;
	let el = e.target.closest("[copiable='true']");
	if (!el) return;
	navigator.clipboard.writeText(el.outerHTML);
	document.querySelector(".footerbcopied").style.opacity = "1";
	setTimeout(function () {
		document.querySelector(".footerbcopied").style.opacity = "0";
	}, 1000);
});

/* discord widget
document.querySelector(".b2").addEventListener("click", function () {
		discord.style.opacity = "1";
		discord.style.pointerEvents = "all";
		document.querySelector(".close").style.pointerEvents = "all";
		document.querySelector(".join").style.pointerEvents = "all";

		const lowpass = context.createBiquadFilter();
		lowpass.type = "lowpass";
		lowpass.frequency.value = 500;
		volume.disconnect();
		volume.connect(lowpass).connect(context.destination);
});
document.querySelector(".close").addEventListener("click", function () {
				discord.style.opacity = "0";
				discord.style.pointerEvents = "none";
				document.querySelector(".dbutton").style.pointerEvents = "none";
				volume.disconnect();
				volume.connect(context.destination);
});
*/

/* bah bai!
window.addEventListener("beforeunload", function () {
		flash.style.backgroundColor = "black";
		flash.style.transition = "opacity 0.35s ease-in-out";
		flash.style.opacity = "1";
});
*/

// resume bg when tabbing back in
document.addEventListener("visibilitychange", () => {
	if (document.visibilityState === "visible" && introactivated && (cocaine.paused || cocaine.ended)) {
		videoBackground.play().catch(function () {});
	}
});

const buttonsrow = document.querySelector(".buttons");
const badges = document.querySelector(".footerb");
const sitediv = document.querySelector(".site");

function fitbuttons() {
	buttonsrow.style.transform = "translateX(-50%)";
	const sitetop = sitediv.getBoundingClientRect().top;
	const row = buttonsrow.getBoundingClientRect();
	const lastrow = buttonsrow.lastElementChild.getBoundingClientRect();
	const space = badges.getBoundingClientRect().top - 15 - (row.top - sitetop + sitediv.scrollTop);
	const scale = Math.max(Math.min(1, space / (lastrow.bottom - row.top)), 0.4);
	buttonsrow.style.transform = `translateX(-50%) scale(${scale})`;
}
fitbuttons();
addEventListener("resize", fitbuttons);
document.fonts.ready.then(fitbuttons);

////////////////////////////////////////////////////////////////

// skip
document.querySelector(".skipintro").addEventListener("click", function () {
	if (!introactivated) {
		introactivated = true;
		if (context.state === "suspended") {context.resume()}
		songwhenready(track.loop || 0);
		badgesout(false);
		flash.style.opacity = ".5";
		if (videoBackground.readyState === 0) {videoBackground.load()}
		document.querySelector(".song").style.display = "block";
		document.querySelector(".smallsog").style.opacity = "0";
		document.querySelector(".smallsogt").style.opacity = "0";
		document.querySelector(".skipintro").style.display = "none";
		document.querySelector(".overlay").style.display = "none";
		document.querySelector(".smallsogt").style.display = "none";
		if (track.wtf) {document.body.classList.add("wtf")}
		setTimeout(function () {
			videoBackground.play().catch(function () {});
			flash.style.transition = "opacity 0.6s ease-in-out";
			flash.style.opacity = "0";
		}, 50);
		setTimeout(function () {badgesback(true)}, 700);
	}
});
