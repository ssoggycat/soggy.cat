let popupEnabled = false;

if (window.mobileCheck && !window.mobileCheck()) {
	popupEnabled = true;
}

if (popupEnabled) {
	const popupScroller = document.querySelector('.markdown').parentElement;

	const popup = document.querySelector('.popup');
	const popupFade = popup.querySelector('.popup-fade');
	const popupContentContainer = popupFade.querySelector('.popup-content-container');

	let popupTimer = 0;
	let popupFadeTimer = 0;
	let hoveredPopupId = null;
	let hoveringPopupText = false;
	let lastHoveredText = null;
	let hoveringPopup = false;
	let holdingShift = false;

	function easeInOutCubic(x) {
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	}

	// remove on scroll
	popupScroller.addEventListener('scroll', () => {
		lastHoveredText = null;
		hoveringPopupText = false;
		hoveringPopup = false;
		popupTimer = 0;
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Shift') {
			holdingShift = true;
		}
	});

	document.addEventListener('keyup', (event) => {
		if (event.key === 'Shift') {
			holdingShift = false;
		}
	});

	window.addEventListener('blur', () => {
		holdingShift = false;
	});

	popup.addEventListener('mouseenter', () => {
		hoveringPopup = true;
	});

	popup.addEventListener('mouseleave', () => {
		hoveringPopup = false;
	});

	// eslint-disable-next-line no-unused-vars
	function setupPopupAttachedContent(popupText, page, popupId) {
		popupText.dataset.popupId = page + popupId;

		popupText.addEventListener('mouseenter', (e) => {
			holdingShift = e.shiftKey;

			if (hoveredPopupId != popupText.dataset.popupId) {
				popupContentContainer.innerHTML = popupText.querySelector('.popup-data').innerHTML;
				if (popupFadeTimer > 0.1) {
					popupFadeTimer += 0.25;
					popupTimer = Math.max(popupTimer + 0.25, 0.5);
				}
			}

			popup.style.display = null;

			hoveringPopupText = true;
			lastHoveredText = popupText;
			hoveredPopupId = popupText.dataset.popupId;

			const popupRect = popup.getBoundingClientRect();
			let textRect = popupText.getBoundingClientRect();

			const focusedRects = popupText.getClientRects();
			if (focusedRects.length > 1) {
				let closestIndex = null;
				let closestDistance = null;

				for (let i = 0; i < focusedRects.length; i++) {
					const rectCandidate = focusedRects[i];

					const centerY = (rectCandidate.top + rectCandidate.bottom) / 2;
					const verticalDist = Math.abs(e.clientY - centerY);
					const horizontalDist = Math.max(rectCandidate.left - e.clientX, 0) + Math.max(e.clientX - rectCandidate.right, 0);

					const distance = verticalDist + (horizontalDist / 2);

					if (closestIndex !== null) {
						if (distance < closestDistance) {
							closestDistance = distance;
							closestIndex = i;
						}
					}
					else {
						closestDistance = distance;
						closestIndex = i;
					}
				}

				if (closestIndex !== null) {
					textRect = focusedRects[closestIndex];
				}
			}

			// minmize to clamp to bottom right edge. maximize to clamp to top left edge.
			// accounts for the size of the popup so it always stays within view
			// don't ask. i don't know how this works either. im insanely tired

			const screenTop = Math.min(Math.max(textRect.top + textRect.height, 20), window.innerHeight - popupRect.height - 20);
			const screenLeft = Math.min(Math.max(textRect.left + textRect.width / 2 - popupRect.width / 2, 20), window.innerWidth - popupRect.width - 20);
			popup.style.top = `${screenTop + popupScroller.scrollTop}px`;
			popup.style.left = `${screenLeft + popupScroller.scrollLeft}px`;
		});

		// update hold shift, set to not hovering text
		popupText.addEventListener('mouseleave', (e) => {
			holdingShift = e.shiftKey;
			hoveringPopupText = false;
			lastHoveredText = null;
		});
	}

	let lastAnimationTime = 0;
	function animatePopup(time) {
		const elapsed = (time - lastAnimationTime) / 1000;

		// Skip animation if fullscreen element is inside the popup content container
		const fullscreenElement = document.fullscreenElement || document.webkitCurrentFullScreenElement;
		if (fullscreenElement && popupContentContainer.contains(fullscreenElement)) {
			lastAnimationTime = time;
			requestAnimationFrame(animatePopup);
			return;
		}

		// holding shift check
		if (holdingShift) {
			popupFadeTimer -= elapsed * 8;
			popupTimer = Math.max(popupTimer - (elapsed * 4), 0.5);
		}

		// remove if hovering invalid text?
		// think, site link with popup attached, user clicks on it
		// then the link gets switched out for the content it leads to as expected. but its gone

		if (lastHoveredText && (!lastHoveredText.isConnected || (!hoveringPopupText && !hoveringPopup))) {
			lastHoveredText = null;
			hoveringPopup = false;
			hoveringPopupText = false;
			hoveredPopupId = null;
		}

		// add to popup timer if we're hovering over the popup or some content with popup data, and if we're not holding shift
		if ((hoveringPopupText || hoveringPopup) & !holdingShift) {
			popupTimer = Math.min(popupTimer + (elapsed * 1.75), 1);
		}
		else {
			popupTimer = Math.max(popupTimer - elapsed, 0);
		}

		let fadeIn = false; // false = fade out
		// maps popupTimer to actual animation
		if (popupTimer >= 0.5) {
			popupFadeTimer = Math.min(popupFadeTimer + (elapsed * 2), 1);
			fadeIn = true;
		}
		else if (popupTimer <= 0.75) popupFadeTimer = Math.max(popupFadeTimer - (elapsed * 2), 0);

		// easedPopupTimer is the value actually animating the element
		const easedPopupTimer = easeInOutCubic(Math.max(0, Math.min(1, popupFadeTimer)));

		// this deals with videos
		popupContentContainer.querySelectorAll('video').forEach((video) => {
			if (easedPopupTimer >= 1) return;

			const videoElapsed = elapsed * 6000;
			video.volume *= (easedPopupTimer + videoElapsed) / (videoElapsed + 1);
			video.volume = Math.max(video.volume - elapsed, 0);

			if (easedPopupTimer <= 0 && video.volume <= 0.03) {
				video.pause();
				video.volume = 0;

				if (fullscreenElement === video) { // just in case
					if (document.exitFullscreen) document.exitFullscreen();
					else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
				}
			}
			else if (video.paused && fadeIn && video.autoplay && video.readyState >= 2) {
				video.play();
			}
		});

		popup.style.display = easedPopupTimer <= 0 ? 'none' : null;

		popup.style.backgroundColor = `rgba(0,0,0,${easedPopupTimer * 0.5})`;
		popup.style.border = `solid rgba(255,255,255,${easedPopupTimer * 0.07}) 1px`;
		popup.style.backdropFilter = `blur(${easedPopupTimer * 7}px)`;

		popupFade.style.opacity = `${easedPopupTimer * 1}`;

		lastAnimationTime = time;
		requestAnimationFrame(animatePopup);
	}
	requestAnimationFrame(animatePopup);
}
