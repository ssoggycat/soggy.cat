// redirect to https
if (window.location.protocol != "https:") {}
    //window.location.protocol = "https"

const circlebutton = document.getElementById('circlebtn');
if (circlebutton) circlebutton.addEventListener('click', toggleMenu);

const sidemenu = document.getElementById('sidemenu');
let menuOut = false;

function updateMenu() {
	if (menuOut) {
		sidemenu.classList.remove("sm-closed");
	}
	else {
		sidemenu.classList.add("sm-closed");
	}
}

function toggleMenu() {
	menuOut = !menuOut;
	updateMenu();
}

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
				const soggyUpdateEvent = new CustomEvent('soggyupdate',{
					detail: {
						result: e.target.result
					}
				});

				document.dispatchEvent(soggyUpdateEvent);

				if (isVtilt) {
					sog.src = e.target.result;
					sog.onload = function () {
						// STEAL COLORS!!!! this almost feels like chicory
						
						const palette = colorstealing.getPalette(soggycat, 5);
						const gradientc = palette.map((color, index) => {
							const position = Math.floor((index / (palette.length - 1)) * 100);
							return `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1) ${position}%`;
						});
						const epicgradient = `radial-gradient(circle, ${gradientc.join(', ')})`;
						document.body.style.background = epicgradient;
					};
				}
			};

			reader.readAsDataURL(file);
		}
	});

});

// this probably could be improved by implementing a list of all known crypto sites
// ^- i added some!
const blocked_domains = [
	'nomics.com', 'cryptoslate.com', 'ftmscan.com', 'coingecko.com', 'polygonscan.com',
	'dextools.io', 'zerion.io', 'cryptocompare.com', 'curve.fi', 'etherscan.io',
	'uniswap.org', 'pancakeswap.finance', 'dexscreener.com', 'tradingview.com', 'cryptowatch.ch',
	'blockchair.com', 'coinpaprika.com', 'tokenview.com', 'coinscan.com', 'geckoterminal.com',
	'aave.com', 'binance.com', 'defipulse.com', 'yearn.finance', 'bscscan.com',
	'livecoinwatch.com', 'sushiswap.fi', '1inch.io', 'coinmarketcap.com', 'zapper.fi',
	'debank.com', 'tokenterminal.com', 'pump.fun'
];

function scamStop() {
	referrer = document.referrer;
	try
	{
		const url = new URL(referrer);
		const domain = url.hostname;
		if (domain != "" && blocked_domains.includes(domain))
		{
			console.log("blocked domain: " + domain);
			window.location.href = "https://soggy.cat/stop";
		}
		
	}
	catch (e)
	{
		console.log("no referrer");
	}

}; 

scamStop();
