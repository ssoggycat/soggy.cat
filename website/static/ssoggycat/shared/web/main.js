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
