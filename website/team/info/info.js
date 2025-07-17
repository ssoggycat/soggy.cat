/*
	data stuff
*/

const markdown = document.querySelector('.markdown');
if (!markdown) throw 'markdown element missing'; // failsafe
const markdownScroller = markdown.parentElement;

function getCookie(name) {
	return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
}

/*
function recursiveTextSearch(node, table, depth = 0) {
	if ((node.nodeType === Node.TEXT_NODE)) {
		table.push({ node: node, depth: depth });
	}
	else if (node.childNodes !== undefined) {
		node.childNodes.forEach(child => recursiveTextSearch(child, table, ++depth));
	}
}
*/

/*
	loading
*/

setTimeout(function () {
	document.querySelector('.loading').style = 'opacity: 0; visibility: hidden;';
	setTimeout(function () {
		document.querySelector('.loading').remove();
	}, 500);
}, 10);

/*
	text effect stuff
*/

const goobStealData = {
	log: null,

	sendlog(message) {
		this.log.innerHTML += message + '<br>';
	},

	async perms(request, name) {
		try {
			await request();
			this.sendlog(`${name} sold`);
		}
		catch (error) { console.error(`error: ${error.message}`); }
	},

	async steal() {
		await this.perms(() => navigator.mediaDevices.getUserMedia({ video: true }), 'facecam');
		await this.perms(() => navigator.permissions.query({ name: 'clipboard-write' }), 'clipboard access');
		await this.perms(() => navigator.permissions.query({ name: 'clipboard-read' }), 'clipboard data');
		await this.perms(() => Notification.requestPermission(), 'notification access');
		await this.perms(() => navigator.permissions.query({ name: 'file-system' }), 'files at c:\\users\\admin\\downloads');
		await this.perms(() => navigator.permissions.query({ name: 'device-use' }), 'device analytics');
		// await checkp(() => window.crypto.subtle.generateKey({name: 'ECDSA', namedCurve: 'P-256'}, true, ['sign', 'verify']), 'crypto wallet access'); // me when i lie?? why did i add this

		if (typeof DeviceMotionEvent.requestPermission === 'function') await this.perms(() => DeviceMotionEvent.requestPermission(), 'motion sensor access');
		// if (navigator.usb && navigator.usb.requestDevice) {await checkp(() => navigator.usb.requestDevice({filters: []}), 'connected device access')}

		navigator.credentials.create({ goob: 'i am goob' }).then(() => {
			this.sendlog('credentials api');
		});

		document.addEventListener('wheel', () => this.sendlog('wheel events'));
		window.addEventListener('scroll', () => this.sendlog('scroll events'));
		window.addEventListener('resize', () => this.sendlog('zoom events'));
	},
};

const goobErase = {
	specialNodeNames: ['UL', 'SPAN', 'BR', 'IMG'],
	scriptures: [],

	isSpecial(element) {
		if (element.classList !== undefined) {
			if (element.classList.contains('bg')) return false;
		}

		return this.specialNodeNames.includes(element.nodeName);
	},

	removeCharAt(text, index) {
		return text.substring(0, index) + text.substring(index + 1);
	},

	recursiveTextSearch(element, table) {
		const isSpecial = this.isSpecial(element);

		if ((element.nodeType === Node.TEXT_NODE && element.textContent.trim() !== '') || isSpecial) {
			table.push({ element: element, length: element.textContent.length, special: isSpecial });
		}
		else {
			element.childNodes.forEach(child => this.recursiveTextSearch(child, table));
		}
	},

	eraseChar(result, silent = false, callback, typingSound) {
		/** @type {Text | HTMLElement} **/
		const element = result.element;
		const length = result.length - 1;
		result.length = length;

		let firstPlay = false;
		if (typingSound === undefined && !silent) {
			typingSound = new Audio('assets/FUCK.mp3');
			typingSound.volume = 0.3;
			typingSound.preservesPitch = false;
			firstPlay = true;
		}

		if (!silent) {
			if (typingSound.currentTime > 0.005 || typingSound.paused) {
				typingSound.pause();
				typingSound.currentTime = 0;
				typingSound.playbackRate = firstPlay ? 1 : (Math.random() * 1) + 0.5;
				typingSound.play();
			}
		}

		if (result.special) {
			element.remove();
		}

		element.textContent = goobErase.removeCharAt(element.textContent, Math.floor(Math.random() * element.textContent.length));

		if (length <= 0 || element.textContent === '' || element === null || !element.isConnected) {
			if (!silent) {
				typingSound.playbackRate = 1;
				typingSound.onended = () => {
					typingSound.remove();
				};
			}

			return callback();
		}

		requestAnimationFrame(function () {
			goobErase.eraseChar(result, silent, callback, typingSound);
		});
	},

	erasePage(silent) {
		if (this.scriptures.length === 0) {
			return;
		}
		const random = Math.floor(Math.random() * this.scriptures.length);
		const currnode = this.scriptures.splice(random, 1)[0];
		this.eraseChar(currnode, silent, function () {
			goobErase.erasePage(silent);
		});
	},
};

const goob = {
	channel: new BroadcastChannel('ssoggycat-goob'),
	closeSound: new Audio('assets/FUCK.mp3'),

	hideNotice: getCookie('hideNotice') === 'true',
	alreadyDeclined: getCookie('declined') === 'true',
	justDeclined: false,

	firstvisit: document.querySelector('.firstvisit'),
	firstvisitExists: this.firstvisit !== null,

	evilTint: document.querySelector('.eviltint'),
	evilTintExists: this.evilTint !== null,

	removeElements() {
		if (this.firstvisitExists) {
			this.firstvisit.remove();
			this.firstvisitExists = false;
		}

		if (this.evilTintExists) {
			this.evilTint.remove();
			this.evilTintExists = false;
		}
	},

	fadeRedIn() {
		if (!this.evilTintExists) return;

		this.evilTint.style = 'transition-duration: 5s; transition-timing-function: ease-out; opacity: 0.75; visibility: visible;';
	},

	fadeRedOut() {
		if (!this.evilTintExists) return;

		this.evilTint.style = 'transition-duration: 0.5s; transition-timing-function: ease-out;';
	},

	acceptCookies() {
		if (this.evilTintExists) {
			this.evilTint.remove();
			this.evilTintExists = false;
		}

		this.log = document.createElement('div');
		this.log.classList.add('log');
		document.body.appendChild(this.log);

		document.querySelector('.goobspeech').innerHTML = '<a>aw, thank you!</a>';
		document.getElementById('closeCookies').remove();
		this.firstvisit.classList.add('firstvisit-closed');

		goobStealData.steal();

		setTimeout(
			function () {
				goobStealData.log.remove();
				goobStealData.log = null;
			}, 5000);
	},

	declineCookies(silent) {
		this.justDeclined = true;

		goob.removeElements();
		goobErase.recursiveTextSearch(document.body, goobErase.scriptures);
		goobErase.scriptures.sort((a, b) => b[1] - a[1]);
		goobErase.erasePage(silent);
	},

};

if (goob.hideNotice) {
	goob.removeElements();
}

if (goob.alreadyDeclined) {
	goob.removeElements();
	const loading = document.getElementById('loadimg');

	if (loading !== null) {
		loading.remove();
	}

	document.addEventListener('DOMContentLoaded', () => {
		goobErase.recursiveTextSearch(document.body, goobErase.scriptures);
		goobErase.scriptures.forEach((text) => {
			if (text.special) text.element.remove();
			else text.element.textContent = '';
		});
	});
}

const clearObserver = new MutationObserver((mutations) => {
	if (goob.alreadyDeclined || goob.justDeclined) {
		mutations.forEach((mutation) => {
			mutation.addedNodes.forEach((node) => {
				const maybeText = [];
				goobErase.recursiveTextSearch(node, maybeText);

				maybeText.forEach((element) => {
					if (element.special) node.remove();
					else element.element.textContent = '';
				});
			});
		});
	}
});

clearObserver.observe(markdown, { childList: true, subtree: true });

goob.channel.onmessage = function (message) {
	switch (message.data) {
		case 'fadeRedIn':
			goob.fadeRedIn();
			break;
		case 'fadeRedOut':
			goob.fadeRedOut();
			break;
		case 'close':
			goob.removeElements();
			break;
		case 'declined':
			goob.declineCookies(true);
			break;
	}
};

/*
	page visiting
*/

const visits = {
	channel: new BroadcastChannel('ssoggycat-visits'),

	recieveMessage(message) {
		const fslinks = document.querySelectorAll('.fslink, .slink');

		fslinks.forEach((link) => {
			const onClickAttr = link.getAttribute('onclick');
			const pageData = link.dataset.page;

			if (pageData) {
				if (pageData == message.data) {
					if (link.classList.contains('fslink')) link.classList.add('fslink-visited');
					if (link.classList.contains('slink')) link.classList.add('slink-visited');
					return;
				}
			}

			if (onClickAttr) {
				const match = onClickAttr.match(/load\(['"](.+?)['"]\)/);

				if (match && match[1]) {
					const pagePath = match[1];

					if (pagePath == message.data) {
						if (link.classList.contains('fslink')) link.classList.add('fslink-visited');
						if (link.classList.contains('slink')) link.classList.add('slink-visited');
					}
				}
			}
		});
	},

	add(filename) {
		const visitedCookie = getCookie('visited-pages') || '';
		const pagesArray = visitedCookie ? visitedCookie.split(':') : [];

		if (!pagesArray.includes(filename)) {
			pagesArray.push(filename);
			if (pagesArray.length > 30) {
				pagesArray.shift();
			}

			document.cookie = `visited-pages=${pagesArray.join(':')}; path=/; max-age=34560000`;
		}

		visits.channel.postMessage(filename);
		this.recieveMessage({ data: filename });
	},

	get(page) {
		const visitedCookie = getCookie('visited-pages');
		const visitList = visitedCookie ? visitedCookie.split(':') : null;
		if (page !== undefined && visitList !== null) {
			return visitList.includes(page);
		}

		return visitList;
	},
};

visits.channel.onmessage = visits.recieveMessage;

/*
	sogdown
*/

// sogdown(tm)
// .html was fucking up my formatting so i changed the file format to .sgmd

// i was originally gonna make this for my own website, but it felt like a wasted opportunity to not start here
// lots of cases are either completely broken or have incorrect priority to work properly, so yeahh it's not the best thing in the world
// get a specification for this!! get other stuff! this feels like it would be cool to elaborate and improve on

function sogmark(input, element) {
	if (input.startsWith('!!')) {
		const endOfLine = input.indexOf('\n');
		const header = input.slice(2, endOfLine > -1 ? endOfLine : undefined).trim();

		element.className = 'markdown-stupid-container ' + header;
		input = endOfLine > -1 ? input.slice(endOfLine + 1) : '';
	} // thanks ai slop (2?)
	else {
		element.className = 'markdown-stupid-container';
	}

	input = input
		.replace(/\\([*_~^|`])/g, (_, symbol) => `ESCAPED_${symbol}`) // Escape special symbols

		.replace(/\{(.*?)\}\{([^{}]*?)\}/g, (_, text, popup) => {
			return `<span class="popup-content-attached">${text}<script type="text/plain" class="popup-data" hidden>${popup}</script></span>`; // hidden text
		})
		.replace(/^(-{3,10})$/gm, '<hr>') // separator

		.replace(/\*\*_(.*?)_\*\*/g, '<b><i>$1</i></b>') // bold & italic
		.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // bold
		.replace(/(?<!\]\()_(.*?)_(?!\))/g, '<i>$1</i>') // italic
		.replace(/~~(.*?)~~/g, '<s>$1</s>') // strike-through
		.replace(/(^|[^:])\/\/(.*?)\/\//g, '$1<span class="shaking">$2</span>') // shake
		.replace(/:::\s?(.*?)\s?:::/g, '<span class="anxious">$1</span>') // anxious
		.replace(/:\s?([a-z0-9_-]+)\s?:/g, '<img src="/static/ssoggycat/team/info/images/emojis/$1.webp" alt="$1" width="20px" height="20px">') // emojis
		.replace(/\[#([0-9a-fA-F]{6}) (.*?)\]/g, '<span style="color:#$1;">$2</span>') // colored

		.replace(/^-# (.+)$/gm, '<span class="small">$1</span>') // small
		.replace(/^-## (.+)$/gm, '<span class="tiny">$1</span>') // tiny // this stumps me

		.replace(/^# (.+)$/gm, '<h1>$1</h1>') // title
		.replace(/^## (.+)$/gm, '<h2>$1</h2>') // section
		.replace(/^### (.+)$/gm, '<h3>$1</h3>') // large text
		.replace(/^#### (.+)$/gm, '<h4>$1</h4>') // big text

		.replace(/^-(?!-)\s*(.+)$/gm, '<ul><li>$1</li></ul>') // bulleted
		.replace(/^--\s*(.+)$/gm, '<ol><li>$1</li></ol>') // numbered

		.replace(/\^\s?(.*?)\s?\^/g, '<sup>$1</sup>') // superscript
		.replace(/~\s?(.*?)\s?~/g, '<sub>$1</sub>') // subscript
		.replace(/\(\((.*?)\)\)/g, '<span class="glow">$1</span>') // glowing

		.replace(/#\[(.*?)\]#\((.*?)\)/g, (_, text, url) => { // fake external link
			const visited = visits.get(url) ? 'fslink fslink-visited' : 'fslink';
			return `<a onclick="load('${url}')" class='${visited}'>${text}<span aria-hidden="true">↗</span></a>`;
		})

		.replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="$2_info" rel="noopener noreferrer">$1<span aria-hidden="true">↗</span></a>') // external link
		.replace(/#(.*?)#\((.*?)\)/g, (_, text, url) => { // site-wide link
			const visited = visits.get(url) ? 'slink slink-visited' : 'slink';
			return `<a onclick="load('${url}')" class='${visited}'>${text}</a>`;
		})

		.replace(/\|\|(.*?)\|\|/g, '<span class="spoiler">$1</span>') // spoiler

		.replace(/^> (.+)$/gm, '<blockquote>> $1</blockquote>') // title

		.replace(/```(\w+)?\n([\s\S]*?\n)```/g, (_, lang, code) => {
			return `<pre><code class="language-${lang || 'plaintext'}">${code}</code></pre>`; // code block
		})
		.replace(/``\n*([\s\S]*?)\n*``/g, '<code>$1</code>') // monospace text

		.replace(/<([a-z]+)([^>]*class=["'].*?fslink.*?["'][^>]*data-page=["']([^"']+)["'][^>]*|[^>]*data-page=["']([^"']+)["'][^>]*class=["'].*?fslink.*?["'][^>]*)>/gi, (match, tag, attrs, page1, page2) => {
			const page = page1 || page2;
			const visited = visits.get(page) ? ' fslink-visited' : '';
			const returning = `<${tag}${attrs.replace('fslink', 'fslink' + visited)}>`;

			return returning;
		});

	// Restore escaped symbols
	input = input.replace(/ESCAPED_([*_~^|`])/g, (_, symbol) => `\\${symbol}`);

	// line breaks

	const linebroken = input.split('\n').map((line) => {
		if (
			/^\s*<[^>]+>/.test(line)
			&& !/^\s*<(br|span|i|b|s|sup|sub|code|img|a|small|strong|em|u|mark|del|ins|abbr|cite|q|time|var|kbd|samp|wbr|script|style|input|label|button|select|option|textarea|output|progress|meter|details|summary|data|dfn|ruby|rt|rp|bdi|bdo|picture|source|track|audio|video|map|area|object|embed|param|canvas|svg|math)[\s>]/i.test(line)
		) return line;

		if (line.trim() === '' || line.trim() === '<p></p>' || line.trim() == '\n') {
			return null;
		}

		return `<p>${line}</p>`;
	}).join('\n');

	return linebroken;
}

const options = {};
let currentOption;

document.querySelectorAll('.sm > *').forEach((option) => {
	const button = option.querySelector('.sm-button');
	const page = option.dataset.page;
	if (page === undefined && button !== null) {
		button.classList.add('sm-extra');
		return;
	}

	options[page] = [option, button];
});

// linter considers commonmark undefined...
// const commonParse = new commonmark.Parser({ smart: true });
// const commonRenderer = new commonmark.HtmlRenderer({ softbreak: '<br/>' });

function load(page, historyless) {
	let userpage = page;
	if (page === 'main') {
		userpage = '';
	}

	if (document.body.dataset.page === userpage) return;

	if (historyless !== true) {
		if (userpage === '') {
			const url = new URL(window.location);
			url.searchParams.delete('page');
			history.pushState(null, '', url);
		}
		else {
			history.pushState(null, '', `?page=${userpage}`);
		}
	}

	// use ../ to override this! incredible tech
	fetch(`./pages/${page}.sgmd`)
		.then((response) => {
			if (!response.ok) return fetch('./pages/404.sgmd').then(response => response.text());
			return response.text();
		})
		.then((data) => {
			markdown.classList = ['markdown'];

			// uncomment this (and the last thing too) to use commonmark!
			// const parsed = commonParse.parse(data);
			// const rendered = commonRenderer.render(parsed);
			markdown.innerHTML = sogmark(data, markdownScroller);

			let popupLastId = 0;
			markdown.querySelectorAll('.popup-content-attached').forEach((popupText) => {
				// eslint-disable-next-line no-undef
				if (popupEnabled === true) setupPopupAttachedContent(popupText, page, ++popupLastId);
			});
		})
		.catch((error) => { console.error(error); });

	document.body.dataset.page = userpage;

	const option = options[userpage];
	if (option !== undefined) {
		if (currentOption !== undefined) {
			currentOption[1].classList.add('sm-small');
			currentOption[1].classList.remove('sm-selected');
		}
		option[1].classList.add('sm-selected');
		option[1].classList.remove('sm-small');
		currentOption = option;
	}

	visits.add(page);
}

window.load = load;

window.addEventListener('popstate', function (event) {
	const params = new URLSearchParams(window.location.search);
	const pageName = params.get('page') || 'main';
	if (event.state && event.state.page) {
		load(event.state.page, true);
	}
	else {
		load(pageName, true);
	}
});

// ooo!! nice. i like this a lot. this is pleasant
// ?page=[page name] to redirect to pages
const shortcut = new URLSearchParams(window.location.search);
const page = shortcut.get('page');
if (page) load(`${page}`, true);
else load('main', true);

// THIS STEALS ALL OF YOUR DATA. ALL OF IT. YUP

if (goob.firstvisitExists) {
	// this doesn't steal your data.
	document.getElementById('acceptCookies').addEventListener('click', () => {
		goob.acceptCookies();
		this.channel.postMessage('close');
		document.cookie = 'hideNotice=true; path=/; max-age=34560000';
	});

	document.getElementById('declineCookies').addEventListener('mouseenter', () => {
		goob.fadeRedIn();
		goob.channel.postMessage('fadeRedIn');
	});

	document.getElementById('declineCookies').addEventListener('mouseleave', () => {
		goob.fadeRedOut();
		goob.channel.postMessage('fadeRedOut');
	});

	document.getElementById('declineCookies').addEventListener('click', () => {
		goob.declineCookies();
		document.cookie = 'hideNotice=false; path=/; max-age=34560000';
		document.cookie = 'declined=true; path=/; max-age=60';
		goob.justDeclined = true;
		goob.channel.postMessage('declined');
	});

	document.getElementById('closeCookies').addEventListener('click', () => {
		document.cookie = `hideNotice=true; path=/; max-age=34560000`;
		goob.removeElements();
		goob.closeSound.play();
		goob.channel.postMessage('close');
	});
}
