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

// neko
!function e(){let t=document.createElement("div"),l=32,n=32,a=0,r=0,c=!0===window.matchMedia("(prefers-reduced-motion: reduce)")||!0===window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(c)return;let i=0,s=0,o=null,$=0,h={idle:[[-3,-3]],alert:[[-7,-3]],scratchSelf:[[-5,0],[-6,0],[-7,0],],scratchWallN:[[0,0],[0,-1],],scratchWallS:[[-7,-1],[-6,-2],],scratchWallE:[[-2,-2],[-2,-3],],scratchWallW:[[-4,0],[-4,-1],],tired:[[-3,-2]],sleeping:[[-2,0],[-2,-1],],N:[[-1,-2],[-1,-3],],NE:[[0,-2],[0,-3],],E:[[-3,0],[-3,-1],],SE:[[-5,-1],[-5,-2],],S:[[-6,-3],[-7,-2],],SW:[[-5,-3],[-6,-1],],W:[[-4,-2],[-4,-3],],NW:[[-1,0],[-1,-1],]};function _(e,l){let n=h[e][l%h[e].length];t.style.backgroundPosition=`${32*n[0]}px ${32*n[1]}px`}function d(){o=null,$=0}t.id="oneko",t.style.width="32px",t.style.height="32px",t.style.position="fixed",t.style.pointerEvents="none",t.style.backgroundImage="url('https://raw.githubusercontent.com/adryd325/oneko.js/main/oneko.gif')",t.style.imageRendering="pixelated",t.style.left=`${l-16}px`,t.style.top=`${n-16}px`,t.style.zIndex="999999",document.body.appendChild(t),document.onmousemove=e=>{a=e.clientX,r=e.clientY},window.onekoInterval=setInterval(function e(){i+=1;let c=l-a,h=n-r,u=Math.sqrt(c**2+h**2);if(u<10||u<48){!function e(){if((s+=1)>10&&0==Math.floor(200*Math.random())&&null==o){let t=["sleeping","scratchSelf"];l<32&&t.push("scratchWallW"),n<32&&t.push("scratchWallN"),l>window.innerWidth-32&&t.push("scratchWallE"),n>window.innerHeight-32&&t.push("scratchWallS"),o=t[Math.floor(Math.random()*t.length)]}switch(o){case"sleeping":if($<8){_("tired",0);break}_("sleeping",Math.floor($/4)),$>192&&d();break;case"scratchWallN":case"scratchWallS":case"scratchWallE":case"scratchWallW":case"scratchSelf":_(o,$),$>9&&d();break;default:_("idle",0);return}$+=1}();return}if(o=null,$=0,s>1){_("alert",0),s=Math.min(s,7),s-=1;return}direction=h/u>.5?"N":"",direction+=h/u<-.5?"S":"",direction+=c/u>.5?"W":"",_(direction+=c/u<-.5?"E":"",i),l-=c/u*10,n-=h/u*10,l=Math.min(Math.max(16,l),window.innerWidth-16),n=Math.min(Math.max(16,n),window.innerHeight-16),t.style.left=`${l-16}px`,t.style.top=`${n-16}px`},100)}();