let index = 0;

var images = [];
function preload() {
    for (var i = 0; i < arguments.length; i++) {
        images[i] = new Image();
        images[i].src = preload.arguments[i];
    }
}

preload(
    "https://files.catbox.moe/450xp1.gif",
    "https://soggy.cat/img/pfp/ktg5.png",
    "https://soggy.cat/img/pfp/friendlypaths.png",
    "https://soggy.cat/img/pfp/cv.png",
    "https://soggy.cat/img/pfp/mat.jpg",
    "https://soggy.cat/img/pfp/fancycoach.jpg",
    "https://soggy.cat/img/pfp/louis.jpg",
)

var audio = new Audio("https://soggy.cat/audio/cats.mp3");
var explode = new Audio("https://files.catbox.moe/plkbq4.mp3");

function showContainer(){
    const overlay = document.querySelector(".overlay");
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
    audio.play();
    explode.play();
    animateTitle();
    displayImages();
  
    let explosion = document.getElementById('explode');
    explosion.style.display = 'block';
    setTimeout(function(){explosion.style.display = 'none';}, 750)
    setTimeout(function(){document.write()}, 62000)
}

function animateTitle() {
      i >= message.length - 1 ? (i = 0) : i++,
        (document.title = message[i]),
        setTimeout("animateTitle()", 200);
}

var message = [
  "ssoggycat enterprise ",
  "soggycat enterprise s",
  "oggycat enterprise ss",
  "ggycat enterprise sso",
  "gycat enterprise ssog",
  "ycat enterprise ssogg",
  "cat enterprise ssoggy",
  "at enterprise ssoggyc",
  "t enterprise ssoggyca",
  " enterprise ssoggycat",
  "enterprise ssoggycat ",
  "nterprise ssoggycat e",
  "terprise ssoggycat en",
  "erprise ssoggycat ent",
  "rprise ssoggycat ente",
  "prise ssoggycat enter",
  "rise ssoggycat enterp",
  "ise ssoggycat enterpr",
  "se ssoggycat enterpri",
  "e ssoggycat enterpris",
], i = 0;

function displayImages() {
  let i;
  const images = document.getElementsByClassName("image");
  for (i = 0; i < images.length; i++) {
    images[i].style.display = "none";
  }
  index++;
  if (index > images.length) {
    index = 1;
  }
  images[index-1].style.display = "block";
  setTimeout(displayImages, 2000); 
}
