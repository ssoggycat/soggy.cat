document.title = 'soggy cat';

const sog = document.querySelector('.smallsog');
const flash = document.querySelector('.flash');
// const discord = document.querySelector('.discord');
const cocaine = document.getElementById('cocaine');

const videobg = document.querySelector('.videobackground');
const defaultSources = [
	['/static/ssoggycat/team/videos/stars.webm', 'video/webm'], // this one is considered hdr and it breaks the backdrop filters.. i am working on rerendering
	['/static/ssoggycat/team/videos/stars.mp4', 'video/mp4'],
];

// ?
(track.sources || defaultSources).forEach((source) => {
	const sourceElement = document.createElement('source');
	sourceElement.src = source[0];
	sourceElement.type = source[1];
	videobg.appendChild(sourceElement);
});

videobg.load();

let introactivated = false;

for (let i = 0; i < 9; i++) {
	const clone = document.querySelector('.snowflake').cloneNode(true);
	document.querySelector('.snowflakes').appendChild(clone);
}

// MAIN PART
function badgesout(fade) {
	document.querySelectorAll('.footerb > *').forEach(function (badge) {
		badge.style.transition = fade ? `opacity 0.75s ease ${Math.random() * 0.5}s` : 'none';
		badge.style.opacity = '0';
		badge.style.pointerEvents = 'none';
	});
}

function applyfx() {
	if (track.rate) {
		videobg.playbackRate = track.rate;
		setInterval(() => {
			if (videobg.duration && videobg.currentTime > videobg.duration - 0.25) {
				videobg.currentTime = 0;
			}
		}, 50);
	}
	if (!track.fx) return;
	document.body.classList.add(track.fx);
	if (track.fx === 'wtf') {
		setTimeout(() => {
			const text = document.createElement('div');
			text.className = 'wtfscroll';
			text.textContent = 'oh my god bruh';
			document.body.appendChild(text);

			text.addEventListener('animationend', () => {
				text.remove();
			});
		}, 6000);
	}
}

function songlabel(delay) {
	if ((!track.name && !track.artist) || track.info === false) return;
	setTimeout(() => {
		document.querySelector('.song').style.display = 'block';
	}, delay);
}

function intro() {
	sogdvd();
	sog.style.pointerEvents = 'none';
	if (videobg.readyState === 0) videobg.load();
	document.querySelector('.smallsogt').style.opacity = '0';
	document.querySelector('.skipintro').style.display = 'none';

	if (track.instant) {
		sog.style.display = 'none';
		badgesout(false);
		document.querySelector('.overlay').style.display = 'none';
		document.querySelector('.smallsogt').style.display = 'none';
		applyfx();
		if (track.fx !== 'wtf') videobg.play().catch(() => {});
		if (track.instant === 'flash') {
			flash.style.opacity = '.5';
			setTimeout(() => {
				flash.style.transition = 'opacity 0.6s ease-in-out';
				flash.style.opacity = '0';
			}, 50);
		}
		songlabel(track.instant === 'flash' ? 700 : 0);
		return;
	}

	const introtime = track.loop || 1.5;
	sog.style.animation = `slide ${introtime / 0.75}s cubic-bezier(0.550, 0.085, 0.680, 0.530) forwards`;
	sog.addEventListener('animationend', () => {
		sog.style.display = 'none';
	}, { once: true });

	flash.style.transition = `opacity ${introtime}s ease-in`;
	flash.style.opacity = '1';
	badgesout(true);

	setTimeout(() => {
		let revealed = false;
		function reveal() {
			if (revealed) return;
			revealed = true;
			document.querySelector('.overlay').style.display = 'none';
			document.querySelector('.smallsogt').style.display = 'none';
			flash.style.transition = 'opacity 2s ease-in-out';
			flash.style.opacity = '0';
			applyfx();
			songlabel(2000);
		}
		videobg.play().then(reveal).catch(reveal);
		setTimeout(reveal, 5000);
	}, introtime * 1000);
}
document.addEventListener('DOMContentLoaded', () => {
	setTimeout(() => {
		if (!introactivated) {
			document.querySelector('.smallsogt').style.opacity = '0.5';
		}
	}, 2000);
});

// clickable anywhere!
document.addEventListener('click', (event) => {
	if (introactivated) return;
	if (event.target.closest('.skipintro, .volumeslider, .footerb, .footer')) return;
	introactivated = true;
	if (context.state === 'suspended') context.resume();
	songwhenready(0);
	intro();
});

////////////////////////////////////////////////////////////////

// bouncy little guys
function sogdvd() {
	const sogImageSrc = track.sog || '/static/ssoggycat/team/images/cheese.webp';

	function birth(container) {
		const sogdiv = container.getBoundingClientRect();
		const cats = [];
		for (let i = 0; i < 6; i++) {
			const img = document.createElement('img');
			img.src = sogImageSrc;
			img.classList.add('sog');
			img.style.filter = `blur(${Math.random() * 3}px)`;
			container.appendChild(img);

			cats.push({
				img,
				x: Math.random() * (sogdiv.width - 50), y: Math.random() * (sogdiv.height - 50),
				dx: (Math.random() * 2 - 1) * 2, dy: (Math.random() * 2 - 1) * 2,
				angle: (track.canny ? 0 : Math.random() * 360),
			});
		}
		return cats;
	}

	function youth(container, cats) {
		let sogdiv = container.getBoundingClientRect();
		addEventListener('resize', () => {
			sogdiv = container.getBoundingClientRect();
		});

		function step() {
			cats.forEach((cat) => {
				cat.x += cat.dx;
				cat.y += cat.dy;

				if (cat.x <= 0 || cat.x + 50 >= sogdiv.width) {
					cat.dx *= -1;
					cat.x = Math.max(0, Math.min(cat.x, sogdiv.width - 50));
				}

				if (cat.y <= 0 || cat.y + 50 >= sogdiv.height) {
					cat.dy *= -1;
					cat.y = Math.max(0, Math.min(cat.y, sogdiv.height - 50));
				}

				if (!track.canny) cat.angle = (cat.angle + 2) % 360;
				cat.img.style.transform = `translate(${cat.x}px, ${cat.y}px) rotate(${cat.angle}deg)`;
			});
			requestAnimationFrame(step);
		}
		step();
	}
	document.addEventListener('DOMContentLoaded', () => {
		document.querySelectorAll('.sogs').forEach((container) => {
			youth(container, birth(container));
		});
	});
}
sogdvd();

////////////////////////////////////////////////////////////////

const title = document.querySelector('.title');
document.body.style.overflow = 'hidden';

const ghostpool = [];
let ghostindex = 0;
const ghosts = document.createElement('div');
ghosts.className = 'ghosts';
document.body.appendChild(ghosts);

for (let i = 0; i < 64; i++) {
	const ghost = document.createElement('div');
	ghost.textContent = title.textContent;
	ghost.className = 'ghost';
	ghosts.appendChild(ghost);
	ghostpool.push(ghost);
}

function ghostrect() {
	ghostpool.forEach(function (ghost) {
		ghost.style.left = `${title.offsetLeft}px`;
		ghost.style.top = `${title.offsetTop}px`;
	});
}
ghostrect();
addEventListener('resize', ghostrect);
addEventListener('load', ghostrect);
document.fonts.ready.then(() => requestAnimationFrame(ghostrect));

function animate() {
	const ghost = ghostpool[ghostindex];
	ghostindex = (ghostindex + 1) % ghostpool.length;
	const snapshot = getComputedStyle(title).transform;
	if (ghost.fade) ghost.fade.cancel();
	ghost.fade = ghost.animate([
		{ transform: snapshot, opacity: 0.1 },
		{ transform: snapshot, opacity: 0 },
	], 500);
	requestAnimationFrame(animate);
}
animate();

// the secret fourth thing (i don't know what to put there it's a placeholder for now lol)
// ^- WDYM PLACEHOLDER?? I KNOW I WROTE THAT BUT IS THAT NOT ENOUGH
let cocainewait = null;
document.querySelector('.b4').addEventListener('click', () => {
	songstop();
	clearTimeout(cocainewait);
	cocaine.style.display = 'block';
	videobg.pause();
	videobg.currentTime = Math.random() * videobg.duration;
	cocaine.play();
});
cocaine.addEventListener('ended', () => {
	videobg.play();
	cocainewait = setTimeout(() => {
		cocaine.style.display = 'none';
		songresume();
	}, Math.random() > 0.25 ? 100 : 10000);
});

const lol = document.querySelector('.lol');
const lollocal = location.hostname === 'localhost' || location.hostname.startsWith('127.') || location.hostname.startsWith('192.168.') || location.protocol === 'file:';
let lolopen = false;

function lolcheck() {
	const open = outerWidth - innerWidth > 160 || outerHeight - innerHeight > 160;
	if (open && !lolopen) {
		lol.style.transition = 'none';
		lol.style.opacity = '1';
		lol.style.display = 'flex';
		setTimeout(() => {
			lol.style.transition = 'opacity 0.4s ease';
			lol.style.opacity = '0';
			setTimeout(() => {
				lol.style.display = 'none';
			}, 400);
		}, 750);
	}
	lolopen = open;
}
if (!lollocal) {
	lolcheck();
	addEventListener('resize', lolcheck);
}

////////////////////////////////////////////////////////////////

// copy button code
document.addEventListener('mousedown', (e) => {
	if (e.button !== 2) return;
	const el = e.target.closest('[copiable="true"]');
	if (!el) return;
	navigator.clipboard.writeText(el.outerHTML);
	document.querySelector('.footerbcopied').style.opacity = '1';
	setTimeout(() => {
		document.querySelector('.footerbcopied').style.opacity = '0';
	}, 1000);
});

/* discord widget
document.querySelector('.b2').addEventListener('click', function () {
		discord.style.opacity = '1';
		discord.style.pointerEvents = 'all';
		document.querySelector('.close').style.pointerEvents = 'all';
		document.querySelector('.join').style.pointerEvents = 'all';

		const lowpass = context.createBiquadFilter();
		lowpass.type = 'lowpass';
		lowpass.frequency.value = 500;
		volume.disconnect();
		volume.connect(lowpass).connect(context.destination);
});
document.querySelector('.close').addEventListener('click', function () {
				discord.style.opacity = '0';
				discord.style.pointerEvents = 'none';
				document.querySelector('.dbutton').style.pointerEvents = 'none';
				volume.disconnect();
				volume.connect(context.destination);
});
*/

/* bah bai!
window.addEventListener('beforeunload', function () {
		flash.style.backgroundColor = 'black';
		flash.style.transition = 'opacity 0.35s ease-in-out';
		flash.style.opacity = '1';
});
*/

// resume bg when tabbing back in
document.addEventListener('visibilitychange', () => {
	if (document.visibilityState === 'visible' && introactivated && track.fx !== 'wtf' && (cocaine.paused || cocaine.ended)) {
		videobg.pause();
		videobg.currentTime = 0;
		videobg.play().catch(() => {});
	}
});

////////////////////////////////////////////////////////////////

const pals = document.querySelector('.buddypals');

function fitpals() {
	pals.style.zoom = '';
	const space = document.querySelector('.footerb').getBoundingClientRect().top - 20 - (title.offsetTop + title.offsetHeight);
	if (pals.offsetHeight > space) {
		pals.style.zoom = Math.max(space / pals.offsetHeight, 0.4);
	}
}
fitpals();
addEventListener('resize', fitpals);
addEventListener('load', fitpals);
document.fonts.ready.then(() => requestAnimationFrame(fitpals));

////////////////////////////////////////////////////////////////

// skip
document.querySelector('.skipintro').addEventListener('click', () => {
	if (!introactivated) {
		introactivated = true;
		if (context.state === 'suspended') context.resume();
		songwhenready(track.loop || 0);
		badgesout(false);
		flash.style.opacity = '.5';
		if (videobg.readyState === 0) videobg.load();
		document.querySelector('.smallsog').style.display = 'none';
		document.querySelector('.smallsogt').style.opacity = '0';
		document.querySelector('.skipintro').style.display = 'none';
		document.querySelector('.overlay').style.display = 'none';
		document.querySelector('.smallsogt').style.display = 'none';
		applyfx();
		setTimeout(() => {
			if (track.fx !== 'wtf') videobg.play().catch(() => {});
			flash.style.transition = 'opacity 0.6s ease-in-out';
			flash.style.opacity = '0';
		}, 50);
		songlabel(700);
	}
});
