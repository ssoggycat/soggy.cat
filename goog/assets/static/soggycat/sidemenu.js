const circlebutton = document.getElementById('circlebtn');

const sidemenu = document.getElementById('sidemenu');
let menuOut = false;

function updateMenu() {
	if (menuOut) {
		sidemenu.classList.remove('sm-closed');
		sidemenu.inert = false;
	}
	else {
		sidemenu.classList.add('sm-closed');
		sidemenu.inert = true;
	}
}

function toggleMenu() {
	menuOut = !menuOut;
	updateMenu();
}

if (circlebutton) circlebutton.addEventListener('click', toggleMenu);

setTimeout(() => {
	sidemenu.style.transition = null;
}, 1);
