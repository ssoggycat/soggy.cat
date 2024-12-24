let index = 0;

var MusicLengthInSeconds = 61.967; // length of the music goes here
var images = [];
function preload() {
    for (var i = 0; i < arguments.length; i++) {
        images[i] = new Image();
        images[i].src = preload.arguments[i];
    }
}

preload("/assets/images/boom.awebp")
var explode = new Audio("assets/audio/boom.mp3");

// credit to https://stackoverflow.com/a/25938297

var current_player = "a";
var player_a = document.createElement("audio");
var player_b = document.createElement("audio");

player_a.src = "assets/audio/cats.ogg";
player_b.src = player_a.src;

function playMusic(){
    var player = null;

    if(current_player == "a"){
        player = player_b;
        current_player = "b";
    }
    else{
        player = player_a;
        current_player = "a";
    }

    player.play();

    setTimeout(playMusic, MusicLengthInSeconds*1000);
}


function showContainer(){
    const overlay = document.querySelector(".overlay");
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
    explode.play();
    animateTitle();
    playMusic();
    displayImages();
  
    let explosion = document.getElementById('explode');
    explosion.style.display = 'block';
    setTimeout(function(){explosion.style.display = 'none';}, 750)
    // setTimeout(function(){document.write()}, 62000)
}

function animateTitle() {
      i >= message.length - 1 ? (i = 0) : i++,
        (document.title = message[i]),
        setTimeout("animateTitle()", 483.8709676);
}

var message = [
  "|ssoggycat enterprise ",
  "|soggycat enterprise s",
  "|oggycat enterprise ss",
  "|ggycat enterprise sso",
  "|gycat enterprise ssog",
  "|ycat enterprise ssogg",
  "|cat enterprise ssoggy",
  "|at enterprise ssoggyc",
  "|t enterprise ssoggyca",
  "| enterprise ssoggycat",
  "|enterprise ssoggycat",
  "|nterprise ssoggycat e",
  "|terprise ssoggycat en",
  "|erprise ssoggycat ent",
  "|rprise ssoggycat ente",
  "|prise ssoggycat enter",
  "|rise ssoggycat enterp",
  "|ise ssoggycat enterpr",
  "|se ssoggycat enterpri",
  "|e ssoggycat enterpris",
  "| ssoggycat enterpris",
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
  setTimeout(displayImages, 1935.48387); 
}
