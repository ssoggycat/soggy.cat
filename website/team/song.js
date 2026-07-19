// jukebox!
const songs = [
	{
		artist: 'Chroma', name: 'Guardian Of The Flower Offering',
		file: '/static/other/team/audio/chroma.ogg',
		url: 'https://soundcloud.com/c-h-r-o-m-a/lqyzxilzziyj',
		loop: 3.0585, fx: 'desat',
	},
	{
		artist: '???', name: 'what the fuck',
		file: '/static/other/team/audio/whatthefuck.ogg',
		loop: null, instant: true, fx: 'wtf', weight: 1, info: false,
	},
	{
		artist: 'tn-shi', name: 'Synthesis',
		file: '/static/other/team/audio/synthesis.ogg',
		url: 'https://soundcloud.com/tn-shi/synthesis',
		loop: 1.3136, fx: 'purplehue',
		sources: [
			['/static/ssoggycat/team/videos/stars2-av1.mp4', 'video/mp4'],
			['/static/ssoggycat/team/videos/stars2-h264.mp4', 'video/mp4'],
		],
	},
	{
		artist: 'AZALI', name: 'VOIDSIDE SWORDFIGHT',
		file: '/static/other/team/audio/voidside.ogg',
		url: 'https://open.spotify.com/track/2gK2pHWovCVnTKm0LIEycY',
		loop: 1.1748, fx: 'mono',
	},
	{
		artist: 'SH2K', name: 'Unending Uncanny',
		file: '/static/other/team/audio/uncanny.ogg',
		url: 'https://sh2k.bandcamp.com/track/024-unending-uncanny',
		loop: null, instant: 'flash',
		sog: '/static/ssoggycat/team/images/canny.webp',
		canny: true,
	},
	{
		artist: 'Toby Fox', name: 'AIRWAVES',
		file: '/static/other/team/audio/doNOTcheckjonglerspronounsinch5sadface.ogg',
		url: 'https://tobyfox.bandcamp.com/album/deltarune-chapters-3-4-ost',
		loop: 1.6969, fx: 'party',
	},
];

const autoshare = (100 - songs.reduce((sum, s) => sum + (s.weight || 0), 0)) / songs.filter(s => !s.weight).length;
const track = (function () {
	let roll = Math.random() * 100;
	for (const s of songs) {
		if ((roll -= s.weight || autoshare) < 0) return s;
	}
	return songs[0];
})();

document.addEventListener('DOMContentLoaded', function () {
	const songlink = document.querySelector('.song');
	if ((track.name || track.artist) && track.info !== false) {
		songlink.textContent = '♪ ' + [track.artist, track.name].filter(Boolean).join(' ~ ');
		if (track.url) {
			songlink.href = track.url;
		}
		else { songlink.removeAttribute('href'); }
	}
});

/* ////////////////////////////////////////////////////////////////////// */

let muted = false;
let audioload = false;

var context = new (window.AudioContext || window.webkitAudioContext)();
var volume = context.createGain();
volume.gain.value = 0.5;
volume.connect(context.destination);

var buffer = null;
var song = null;

// instant song queueing, any delay and the intro is cooked
function songfix() {
	const audioRequest = new XMLHttpRequest();
	audioRequest.open('GET', track.file, true);
	audioRequest.responseType = 'arraybuffer';
	audioRequest.onload = function () {
		context.decodeAudioData(audioRequest.response, function (decodedBuffer) {
			buffer = decodedBuffer;
			audioload = true;
		});
	};
	audioRequest.send();
}
songfix();

function makesource() {
	const source = context.createBufferSource();
	source.buffer = buffer;
	source.connect(volume);
	source.loop = true;
	source.loopStart = track.loop || 0;
	source.loopEnd = buffer.duration;
	return source;
}

function WEEE(offset) {
	if (!buffer || !audioload) return;
	if (song) {
		song.stop(0);
		song.disconnect();
	}
	song = makesource();
	if (track.name || track.artist) {
		document.title = '♪ ' + [track.name, track.artist].filter(Boolean).join(' - ');
	}
	song.start(0, offset || 0);
}

let songwait = null;
function songwhenready(offset) {
	if (audioload) {
		WEEE(offset);
		return;
	}
	clearInterval(songwait);
	songwait = setInterval(function () {
		if (audioload) {
			clearInterval(songwait);
			WEEE(offset);
		}
	}, 10);
}

function songstop() {
	clearInterval(songwait);
	if (song) {
		song.stop(0);
		song = null;
	}
}
function songresume() {
	if (!buffer) return;
	if (song) {
		song.stop(0);
		song.disconnect();
	}
	song = makesource();
	song.start(0, context.currentTime % buffer.duration);
}

/* ////////////////////////////////////////////////////////////////////// */

document.addEventListener('DOMContentLoaded', () => {
	const slider = document.querySelector('.slider');

	slider.addEventListener('input', () => {
		volume.gain.value = slider.value;
		muted = slider.value == 0;
		document.querySelector('.toggle').src = muted
			? '/static/other/team/images/muted.png'
			: '/static/other/team/images/unmuted.png';
	});

	document.querySelector('.toggle').addEventListener('click', () => {
		if (muted) {
			volume.gain.value = slider.value;
			document.querySelector('.toggle').src = '/static/other/team/images/unmuted.png';
		}
		else {
			volume.gain.value = 0;
			document.querySelector('.toggle').src = '/static/other/team/images/muted.png';
		}
		muted = !muted;
	});
});
