document.addEventListener("DOMContentLoaded", function() {

    setTimeout(function() {
        document.querySelector(".loading").style.opacity = 0
        setTimeout(function() {
            document.querySelector(".loading").remove()
        }, 500)
    }, 10)
    
    const text = document.querySelector(".markdown"); if (!text) return; // failsafe
    const btn = document.querySelector(".dysl");
    const btn2 = document.querySelector(".listb");
    const list = document.querySelector(".list");

    const popupc = document.querySelector(".popupc");
    let timeout

    window.load = function load(filename) {
        fetch(`./pages/${filename}`) // use ../ to override this! incredible tech
          .then(response => {
              if (!response.ok) {return fetch('./404.html').then(response => response.text())}
              return response.text();
          })
          .then(data => {
              document.querySelector('.markdown').innerHTML = data.trim();
              processMarkdown();
          }) 
          .catch(error => {console.error(error)});
    }
    
    // sogdown(tm)

    // i was originally gonna make this for my own website, but it felt like a wasted opportunity to not start here
    // lots of cases are either completely broken or have incorrect priority to work properly, so yeahh it's not the best thing in the world

    function processMarkdown() {
        let input = text.innerHTML.trim();

        input = input
            .replace(/\\([*_~^|`])/g, (_, symbol) => `ESCAPED_${symbol}`) // Escape special symbols

            .replace(/\{(.*?)\}\{([^{}]*?)\}/g, (_, text, popup) => {
                return `<span data-popup="${popup.replace(/"/g, '&quot;')}" class='popup'>${text}</span>`; // hidden text
            })
            .replace(/^(-{3,10})$/gm, "<hr>")                                                              // separator
            
            .replace(/\*\*\_(.*?)\_\*\*/g, '<b><i>$1</i></b>')                                             // bold & italic
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')                                                        // bold
            .replace(/(?<!\]\()_(.*?)_(?!\))/g, '<i>$1</i>')                                               // italic
            .replace(/(^|[^:])\/\/(.*?)\/\//g, "$1<span class='shaking'>$2</span>")                        // shake
            .replace(/\:\:\:\s?(.*?)\s?\:\:\:/g, "<span class='anxious'>$1</span>")                        // anxious
            .replace(/\:\s?([a-z0-9_-]+)\s?\:/g, "<img src='/info/assets/emojis/$1.webp' width='20px'>")   // emojis
            .replace(/\[#([0-9a-fA-F]{6}) (.*?)\]/g, "<span style='color:#$1;'>$2</span>")                 // colored

            .replace(/^-# (.+)$/gm, "<span class='small'>$1</span>")                                       // small
            .replace(/^-## (.+)$/gm, "<span class='tiny'>$1</span>")                                       // tiny

            .replace(/^# (.+)$/gm, "<h1>$1</h1>")                                                          // title
            .replace(/^## (.+)$/gm, "<h2>$1</h2>")                                                         // section
            .replace(/^### (.+)$/gm, "<h3>$1</h3>")                                                        // large text
            .replace(/^#### (.+)$/gm, "<h4>$1</h4>")                                                       // big text

            .replace(/^-(?!-)\s*(.+)$/gm, "<ul><li>$1</li></ul>")                                          // bulleted
            .replace(/^--\s*(.+)$/gm, "<ol><li>$1</li></ol>")                                              // numbered

            .replace(/\^\s?(.*?)\s?\^/g, "<sup>$1</sup>")                                                  // superscript
            .replace(/~\s?(.*?)\s?~/g, "<sub>$1</sub>")                                                    // subscript
            .replace(/\(\((.*?)\)\)/g, "<span class='glow'>$1</span>")                                     // glowing

            .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g, 
                "<a href='$2' target='_blank'>$1<span>↗</span></a>")                                       // link
            .replace(/\#(.*?)\#\((.*?)\)/g, "<a onclick=\"load('$2.html')\" class='slink'>$1</a>")         // site-wide link
            .replace(/\|\|(.*?)\|\|/g, "<span class='spoiler'>$1</span>")                                  // spoiler

            .replace(/^= (.+)$/gm, "<blockquote>> $1</blockquote>")                                        // title

            // -< Let's run the mechanism! )
            // -< Splendid )
            .replace(/!\((.*?)\)\((https?:\/\/\S+\.(?:png|jpe?g|gif|webp|bmp|avif|svg|jfif)|\.?\/[a-zA-Z0-9-_\/]+\.(?:png|jpe?g|gif|webp|bmp|avif|svg|jfif))\)\s*\[(\d+[a-zA-Z%]*)?,\s*(\d+[a-zA-Z%]*)?,\s*(left|center|right)\]/gi, (match, alt, url, width, height, align) => {width = width || 'auto'; height = height || 'auto'; align = align || 'center';
            return `<div style="display: flex; justify-content: ${align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'}; align-items: center;"><img class="image" src="${url}" alt="${alt}" style="width:${width}; height:${height};"></div>`})                                                                           // image

            .replace(/(?<!\])((https?:\/\/\S+\.mp4(\?\S*)?)|(?:\/[a-zA-Z0-9-_\/]+\.mp4))(?=\s|}|$)/gi, 
            (m, url) => `<video width='auto' height='auto' controls autoplay><source src='${url}' type='video/mp4'></video>`)                                                                                       // video

            .replace(/```(\w+)?\n([\s\S]*?\n)```/g, (_, lang, code) => {                                     
                return `<pre><code class="language-${lang || 'plaintext'}">${code}</code></pre>`;          // code block
            })
            .replace(/``\n*([\s\S]*?)\n*``/g, '<code>$1</code>');                                          // monospace text

        // Restore escaped symbols
        input = input.replace(/ESCAPED_([*_~^|`])/g, (_, symbol) => `\\${symbol}`);

        // line breaks
        let linebroken = input.split("\n").map(line => {
            if (/^<h[1-4]>|^<blockquote>|^<hr>|^<pre>/.test(line)) return line;
            return `<p>${line}</p>`;
        }).join("\n");

        text.innerHTML = linebroken;
    }
    
    const shortcut = new URLSearchParams(window.location.search);
    const page = shortcut.get('page');
    if (page) {load(`${page}.html`);}
    else {load("../main.html")} 

    btn.addEventListener("click", () => {
        if (text.style.fontFamily === "dyslexic") {
            text.style.fontFamily = ""; // why does this work
            text.style.letterSpacing = "";
            document.querySelectorAll("h1, h2, h3, h4").forEach(e => e.style.letterSpacing = "");
            btn.style.fontFamily = "";
        } else {
            text.style.fontFamily = "dyslexic";
            text.style.letterSpacing = "-0.15em";
            document.querySelectorAll("pre, .anxious").forEach(e => e.style.letterSpacing = "0em");
            document.querySelectorAll("h1, h2, h3, h4").forEach(e => e.style.letterSpacing = "-0.21em");
            btn.style.fontFamily = "default";
        }
    });

    btn2.addEventListener("click", () => {
        if (list.style.display === "none") {
            list.style.display = "block";
        } else {
            list.style.display = "none";
        }
    });

    document.querySelectorAll(".list .option").forEach(option => {
        option.addEventListener("click", () => {
            document.querySelector(".menutitle").style.textAlign = "center";
            document.querySelectorAll(".list .option a").forEach(link => {
                link.classList.add("small");
                link.classList.remove("normal");
            });
            const link = option.querySelector("a");
            link.classList.remove("small");
            link.classList.add("normal");
        });
    });

    // i tried bringing back the popup from the dead for 2 hours straight idfk rest in piece
    document.querySelectorAll(".popup").forEach(el => { // fade in
        el.addEventListener("mouseenter", (e) => {
            clearTimeout(timeout);
            const popupContent = el.dataset.popup;
            if (popupContent) {
                popupc.innerHTML = popupContent;
                popupc.style.display = "block";
                popupc.style.top = `${e.clientY - 30}px`;
                popupc.style.left = `${e.clientX}px`;
                popupc.classList.add("visible");
            }
        });
    });
    popupc.addEventListener('mouseleave', () => { // fade out
        clearTimeout(timeout); 
        timeout = setTimeout(() => {
            popupc.classList.remove('visible');
            popupc.style.display = "none"; 
        }, 400);
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".firstvisit").remove();
        new Audio("../info/assets/FUCK.mp3").play();
    });

    // THIS STEALS ALL OF YOUR DATA. ALL OF IT. YUP
    function getCookie(name) {return document.cookie.split("; ").find(row => row.startsWith(name + "="))?.split("=")[1]}
    const visits = parseInt(getCookie("visited") || "0", 10) + 1;
    document.cookie = `visited=${visits}; path=/; max-age=34560000`;
    if (visits > 1) {document.querySelector(".firstvisit").style.display = "none"}

    // this doesn't steal your data.
    document.querySelector('.choice .one').addEventListener('click', () => {
        async function sendlog(message) {document.querySelector(".log").innerHTML += message + "<br>"}
        async function stealyourdata() {
            async function checkp(request, name) {
                try {
                    await request();
                    sendlog(`${name} sold`);
                } catch (error) {console.error(`error: ${error.message}`)}
            }
            await checkp(() => navigator.mediaDevices.getUserMedia({video: true}), 'facecam');
            await checkp(() => navigator.permissions.query({name: 'clipboard-write'}), 'clipboard access');
            await checkp(() => navigator.permissions.query({name: 'clipboard-read'}), 'clipboard data');
            await checkp(() => Notification.requestPermission(), 'notification access');
            await checkp(() => navigator.permissions.query({name: 'file-system'}), 'files at c:\\users\\admin\\downloads');
            await checkp(() => navigator.permissions.query({name: 'device-use'}), 'device analytics');
            // await checkp(() => window.crypto.subtle.generateKey({name: 'ECDSA', namedCurve: 'P-256'}, true, ['sign', 'verify']), 'crypto wallet access'); // me when i lie?? why did i add this

            if (typeof DeviceMotionEvent.requestPermission === 'function') {await checkp(() => DeviceMotionEvent.requestPermission(), 'motion sensor access')}
            // if (navigator.usb && navigator.usb.requestDevice) {await checkp(() => navigator.usb.requestDevice({filters: []}), 'connected device access')}
            
            navigator.credentials.create({"goob": "i am goob"}).then(() => {sendlog('credentials api')})
            document.addEventListener('wheel', () => sendlog('wheel events'));
            window.addEventListener('scroll', () => sendlog('scroll events'));
            window.addEventListener('resize', () => sendlog('zoom events'));
        } 
        stealyourdata();
        document.querySelector('.goobspeech').innerHTML = "<a>aw, thank you!</a>"
        document.querySelector('.firstvisit').style.transition = "opacity 1s ease-out";
        document.querySelector('.firstvisit').style.opacity = '0'; 
        setTimeout(function(){document.querySelector(".log").remove()}, 5000)
    });

    document.querySelector('.choice .two').addEventListener('mouseenter', () => {
        document.querySelector('.eviltint').style.transition = "opacity 5s ease-out";
        document.querySelector('.eviltint').style.opacity = '0.9';
    });
    document.querySelector('.choice .two').addEventListener('mouseleave', () => {
        document.querySelector('.eviltint').style.transition = "opacity 0.5s ease-out";
        document.querySelector('.eviltint').style.opacity = '0'; 
    });
    document.querySelector('.choice .two').addEventListener('click', () => {
        document.querySelector('.eviltint').remove();
        window.close(); window.close('','_parent',''); window.open('','_self').close();
        document.getElementsByTagName('html')[0].remove();
    });
});
