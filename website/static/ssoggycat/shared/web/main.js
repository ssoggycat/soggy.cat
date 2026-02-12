// redirect to https
// if (window.location.protocol != 'https:') {}
// window.location.protocol = "https"

// waits for the website to load because IT DOESN'T WORK OTHERWISE RGARGARGRAG
document.addEventListener('DOMContentLoaded', function () {
	const isVtilt = document.body.getAttribute('data-soggy-pagetype') == 'vtilt-js';
	const sog = document.getElementById('soggycat');

	const picker = document.getElementById('picker');

	let colorstealing;
	if (isVtilt) colorstealing = new ColorThief();

	if (!picker) return;
	picker.addEventListener('change', function (event) {
		const file = event.target.files[0];
		if (file) {
			const reader = new FileReader();

			reader.onload = function (e) {
				const soggyUpdateEvent = new CustomEvent('soggyupdate', {
					detail: {
						result: e.target.result,
					},
				});

				document.dispatchEvent(soggyUpdateEvent);

				if (isVtilt) {
					sog.src = e.target.result;
					sog.onload = function () {
						// STEAL COLORS!!!! this almost feels like chicory

						const palette = colorstealing.getPalette(sog, 5);
						const gradientc = palette.map((color, index) => {
							const position = Math.floor((index / (palette.length - 1)) * 100);
							return `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1) ${position}%`;
						});
						const epicgradient = `radial-gradient(circle, ${gradientc.join(', ')})`;

						document.querySelectorAll('.gradient-background').forEach((background) => {
							background.style.background = epicgradient;
						});
					};
				}
			};

			reader.readAsDataURL(file);
		}
	});
});

// win 1 billion soggybucks now!
function showcodeinput() {
	const modal = document.getElementById('codeinputelmodal');
	const input = document.getElementById('codeinputel');
	if (!modal || !input) return;

	modal.classList.remove('entercodehidden');
	input.value = '';
	input.focus();

	const handleKeyDown = function(e) {
		if (e.key === 'Enter') {
			const code = input.value.trim();

			if (code === 'GOOG') {
				window.location.href = `https://tiagozip.github.io///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////tetapux/red/encrypt0rh4xx#%E2%B6%BD%E2%96%B9%E2%86%B4%E2%94%A9%E2%9E%BD%E2%8B%A6%E2%84%B3%E2%AE%96%E2%BC%98%E2%AB%92%E2%9E%82%E2%B4%A4%E2%A8%9F%E2%99%AD%E2%B9%9A%E2%B6%8B%E2%8A%B9%E2%9F%8C%E2%AA%A5%E2%8E%94%E2%93%82%E2%87%AD%E2%92%B7%E2%BC%B3%E2%A8%A8%E2%88%BA%E2%BA%87%E2%80%BA%E2%90%92%E2%B3%8F%E2%A9%9B%E2%A6%A5%E2%A6%93%E2%84%85%E2%A7%98%E2%9B%A7%E2%98%8A%E2%A8%BA%E2%BD%84%E2%82%99%E2%95%95%E2%AB%8A%E2%8E%A6%E2%9B%95%E2%97%80%E2%BC%84%E2%B1%97%E2%AC%B1%E2%8C%92%E2%BC%9E%E2%8B%BC%E2%8F%A4%E2%BE%80%E2%B8%91%E2%8B%94%E2%A5%84%E2%A3%B9%E2%8B%82%E2%B0%B7%E2%82%96%E2%AE%A7%E2%9D%9E%E2%A1%85%E2%BA%B1%E2%AD%85%E2%A2%87%E2%BB%B0%E2%80%A1`;
			} else if (code === 'IWantToGetAMiddleFingerAgainThatBitIsVeryFunny') {
				window.location.href = `https://soggy.cat/free`;
			} else if (code === 'ssoggycat') {
				window.location.href = `https://s.soggy.cat`;
			}
			else if (code !== '') {
				const buzzer = new Audio('/soggle/assets/audio/buzzer.mp3');
				buzzer.play();
				murdercodeinput();
			} else {murdercodeinput()}
		} else if (e.key === 'Escape') {murdercodeinput()}
	};
	const handleModalClick = function(e) {
		if (e.target === modal) {murdercodeinput()}
	};
	input.addEventListener('keydown', handleKeyDown);
	modal.addEventListener('click', handleModalClick);
	input._codeKeyHandler = handleKeyDown;
	modal._codeClickHandler = handleModalClick;
}
function murdercodeinput() {
	const modal = document.getElementById('codeinputelmodal');
	const input = document.getElementById('codeinputel');
	if (!modal || !input) return;
	modal.classList.add('entercodehidden');

	if (input._codeKeyHandler) {
		input.removeEventListener('keydown', input._codeKeyHandler);
		delete input._codeKeyHandler;
	}
	if (modal._codeClickHandler) {
		modal.removeEventListener('click', modal._codeClickHandler);
		delete modal._codeClickHandler;
	}
}
window.showcodeinput = showcodeinput;
