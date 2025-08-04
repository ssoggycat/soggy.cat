document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

const sog = document.querySelector(".smallsog");
const flash = document.querySelector(".flash");
const slider = document.querySelector(".slider");
const discord = document.querySelector(".discord");

let muted = false;
let introactivated = false;
let audioload = false;
let pendingintro = false;

var context = new (window.AudioContext || window.webkitAudioContext)();
var volume = context.createGain();
volume.gain.value = 0.5;
volume.connect(context.destination);

var buffer = null;
var song = null;

for (let i = 0; i < 9; i++) {
    const clone = document.querySelector(".snowflake").cloneNode(true);
    document.querySelector(".snowflakes").appendChild(clone);
}

function songfix() {
  const audioRequest = new XMLHttpRequest();
  audioRequest.open("GET", "assets/audio/butt3rfli3s.mp3", true);
  audioRequest.responseType = "arraybuffer";
  audioRequest.onload = function () {
    context.decodeAudioData(audioRequest.response, function (decodedBuffer) {
      buffer = decodedBuffer;
      audioload = true;
      if (pendingintro) {
        pendingintro = false;
        introactivated = true;
        WEEE();
        intro();
      }
    });
  };
  audioRequest.send();
}

function WEEE() {
  if (!buffer || !audioload) return;
  if (song) {
    song.stop(0);
    song.disconnect();
  }
  song = context.createBufferSource();
  song.buffer = buffer;
  song.connect(volume);
  song.loop = true;
  song.loopStart = 1.415;
  song.loopEnd = buffer.duration;
  document.title = "♪ BUTT3RFLI3S >w< - milkypossum";
  song.start(0);
}

function intro() {
  sogdvd();
  sog.style.animation = "slide 2s cubic-bezier(0.550, 0.085, 0.680, 0.530) forwards";
  sog.style.pointerEvents = "none";
  flash.style.transition = "opacity 1.5s ease-in";
  flash.style.opacity = "1";
  document.querySelector(".bg").load();
  document.querySelector(".song").style.display = "block";
  document.querySelector(".smallsogt").style.opacity = "0";

  setTimeout(function() {
    document.querySelector(".overlay").style.display = "none";
    document.querySelector(".smallsogt").style.display = "none";
    document.querySelector(".skipintro").style.display = "none";
    document.querySelector(".bg").play();
    flash.style.transition = "opacity 2s ease-in-out";
    flash.style.opacity = "0";
  }, 1500);
}

document.addEventListener("DOMContentLoaded", function () {
  songfix();
  setTimeout(function () {
    if (!introactivated && !pendingintro) {
      document.querySelector(".smallsogt").style.opacity = "0.5";
    }
  }, 2000);
});
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("smallsog") && !introactivated && !pendingintro) {
    if (context.state === "suspended") {context.resume()}
    if (audioload) {introactivated = true; WEEE(); intro()}
    else {pendingintro = true}
  }
});

////////////////////////////////////////////////////////////////

// song input
slider.addEventListener("input", function () {
  volume.gain.value = slider.value;
  if (slider.value == 0) {
    document.querySelector(".toggle").src =
      "assets/images/muted.png";
    muted = true;
  } else {
    document.querySelector(".toggle").src =
      "assets/images/unmuted.png";
    muted = false;
  }
});

// song toggle
document.querySelector(".toggle").addEventListener("click", function () {
  if (muted) {
    volume.gain.value = slider.value;
    document.querySelector(".toggle").src =
      "assets/images/unmuted.png";
  } else {
    volume.gain.value = 0;
    document.querySelector(".toggle").src =
      "assets/images/muted.png";
  }
  muted = !muted;
});

////////////////////////////////////////////////////////////////

// bouncy little guys
function sogdvd() {
  const sogImageSrc = "assets/images/cheese.webp";

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
document.querySelector(".b4").addEventListener("click", function (event) {
  const video = document.querySelector(".cocaine");
  if (song) {
    song.stop(0);
    song = null;
  }
  // the song loop function from earlier needs to be run again to resume properly
  video.style.display = "block";
  video.play();
  video.onended = function () {
    video.style.display = "none";
    if (buffer) {
      song = context.createBufferSource();
      song.buffer = buffer;
      song.connect(volume);
      song.loop = true;
      song.loopStart = 1.415;
      song.loopEnd = buffer.duration;
      song.start(0, context.currentTime % buffer.duration);
    }
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
}); */

/* bah bai!
window.addEventListener("beforeunload", function () {
    flash.style.backgroundColor = "black";
    flash.style.transition = "opacity 0.35s ease-in-out";
    flash.style.opacity = "1";
}); */

// skip
document.querySelector(".skipintro").addEventListener("click", function () {
  if (!introactivated) {
    introactivated = true;
    WEEE();
    flash.style.opacity = "1";
    document.querySelector(".bg").load();
    document.querySelector(".song").style.display = "block";
    document.querySelector(".smallsog").style.opacity = "0";
    document.querySelector(".smallsogt").style.opacity = "0";
    document.querySelector(".skipintro").style.display = "none";
    document.querySelector(".overlay").style.display = "none";
    document.querySelector(".smallsogt").style.display = "none";
    if (song) {
      song.stop(0);
      song.disconnect();
    }
    song = context.createBufferSource();
    song.buffer = buffer;
    song.connect(volume);
    song.loop = true;
    song.loopStart = 1.415;
    song.loopEnd = buffer.duration;
    song.start(0, 1.4);
    setTimeout(function () {
      document.querySelector(".bg").play();
      flash.style.transition = "opacity 0.5s ease-in-out";
      flash.style.opacity = "0";
    }, 50);
  }
});