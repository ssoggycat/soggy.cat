const circlebutton = document.getElementById('circlebtn');
if (circlebutton) circlebutton.addEventListener('click', toggleMenu);

const sidemenu = document.getElementById('sidemenu');
let menuOut = false;

function updateMenu() {
	if (menuOut) {
		sidemenu.classList.remove("sm-closed");
		sidemenu.inert = false;
	}
	else {
		sidemenu.classList.add("sm-closed");
		sidemenu.inert = true;
	}
}

function toggleMenu() {
	menuOut = !menuOut;
	updateMenu();
}