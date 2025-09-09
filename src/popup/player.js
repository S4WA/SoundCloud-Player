// update() function is for visual things.
// it recieves json data and changes neccessary elements
async function update(val) {
  // if value is null or isn't json, return. 
  if (val == null || typeof val !== 'object') return;

  // update json and save it to sessionStorage(???).
  for (const key in val) {
    json[key] = val[key];
  }
  sessionStorage.setItem('data', JSON.stringify(json));

  // check if the page is settings.html or popup.html
  if (loc("settings.html")) {
    let compact_enabled = localStorage.getItem('compact_in_settings') != null && localStorage.getItem('compact_in_settings') == 'true';
    if (!compact_enabled) return;

    document.querySelector('#controller-body').style['display'] = 'inline-block';
    keyReady = true;
  }

  // set artwork, title, current time & duration, current vol (text)
  // set playing, favorite, shuffle, mute status (true/false)
  // set repeat status (one/all/none)
  // set % to progress bar
  const arr = [
    { 
      key: "artwork", selector: "#artwork", handler: (link) => { 
        if (toggleArtwork) toggleArtwork(settings['display-artwork']);
        document.querySelector("#artwork").style['backgroundImage'] = link; 
      }
    },
    { 
      key: "title", selector: ".title", handler: () => {
        document.querySelectorAll(".title").forEach(function(el) {
          el.innerText = replaceText(localStorage.getItem('trackdisplay'), val);
          el.attr('href', val['link']);
        });
        startMarquees();
        setShareLink(val);
      }
    },
    { 
      key: "time", selector: "#current", handler: (time) => {
        const endTime = document.querySelector("#end"), currentTime = document.querySelector("#current");
        const oldTime = json["time"] ?? time;

        if (!endTime || !currentTime) return;

        endTime.innerText = time['end'];
        currentTime.innerText = time['current'];

        if (loc("popup.html")) {
          setShareLink(val);
        }
      }
    },
    { key: "playing", selector: "#toggle", attr: "playing" },
    { key: "favorite", selector: "#fav", attr: "favorite" },
    { key: "shuffle", selector: "#shuffle", attr: "shuffle" },
    { key: "repeat", selector: "#repeat", attr: "mode" },
    { 
      key: "volume", selector: "#current-volume", handler: (vol) => {
        if (!loc("popup.html")) return; // volume slider or curent volume text is only available in popup.html
        if (sliderEditing) return; // not to interfere with volume change. 

        const volume = Math.floor(vol);

        document.querySelector("#current-volume").innerText = `${volume} %`;
        const range = document.querySelector("#volume-slider");
        range.value = volume;
        range.oldNum = volume;
        // console.log(document.querySelector("#volume-slider").value);
      }
    }, 
    { 
      key: "mute", selector: "#volume-icon", handler: (muted) => { 
        if (!loc("popup.html")) return;
        const cList = document.querySelector("#volume-icon").classList; 
        muted ? cList.add("muted") : cList.remove("muted");
      }
    },
    { 
      key: "following", selector: "#follow", handler: (following) => {
        if (following != null && following != 'self') {
          document.querySelector("#follow").style.display = "";
          document.querySelector("#follow").attr("followed", following);
        } else if (following == 'self') {
          document.querySelector("#follow").style.display = "none";
        }
      }
    },
    {
      key: "progress", selector: "#progressbar-bar", handler: (percentage) => { // why didn't i include this to json['time']????????????
        const el = document.querySelector("#progressbar-bar");
        // Ignore and don't change progress bar if progress-bar doesn't exist, meaning if the theme is not modern nor the current page is in popup.html, then ignore.
        if (!el) return;
        el.style["width"] = percentage;
        setShareLink(val);
      }
    }
  ];

  arr.forEach(({ key, selector, attr, handler }) => {
    if (val[key] != null) {
      const element = document.querySelector(selector);
      handler ? handler(val[key]) : element.attr(attr, val[key]);
    }
  });
}

// this is the function inside. Universal as in settings.htmll & popup.html
async function registerUniversalEvents() {
  const obj = ['toggle', 'prev', 'next', 'fav', 'repeat', 'shuffle', 'follow', 'up', 'down'];
  for (let i = 0; i < obj.length; i++) {
    const el = document.getElementById(obj[i]);
    if (el) {
      el.addEventListener("click", () => {
        queue(obj[i]);
        openSCTab2();
      });
    }
  }

  const arr = [
    {
      selector: "#artwork,.title",
      event: "click",
      handler: (event) => { 
        openSCTab(); 
        event.preventDefault(); // avoid redirecting to track's link when user clicks "a.title"
      }
    },
    {
      selector: "#volume-icon",
      event: "click",
      handler: () => {
        queue('mute'); 
      }
    },
    {
      selector: ".copynp",
      event: "click",
      handler: () => {
        copyToClipboard( replaceText(localStorage.getItem('copy')) );
      }
    },
  ];

  arr.forEach(({ selector, event, handler }) => {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener(event, handler);
    });
  });

  if (settings['remember-window-size']) { // should this guy be here or somewhere else lol
    chrome.tabs.getCurrent(tab => { // if it's not popout, ignore.
      if (!tab) return;
      window.onresize = function () { // if it's popout then detect resized events
        chrome.windows.getCurrent({}, (winner) => {
          const width = winner.width, height = winner.height;
          localStorage["window-width"] = width;
          localStorage["window-height"] = height;
          // settings['window-width'] = width;
          // settings['window-height'] = height;
          // console.log(width, height);
        });
      };
    });
  }
}

// Share link (only with player.js-popup.js)
function setShareLink(val) {
  if (!loc("popup.html")) return;

  let data = {
    'time': val['time'] ?? json['time'],
    'link': val['link'] ?? json['link'],
  };
  let copyLink = share_with_time ? `${data['link']}#t=${data['time']['current']}` : data['link'];
  const copyEl = document.querySelector("#copy"); // wasn't there another element that uses same id?
  copyEl.value = copyLink;
  document.querySelector("#share_current_time").value = data['time']['current'];

  let selectable = share_with_time
                && copyEl.selectionStart != null
                && document.activeElement == copyEl;
  if (selectable) copyEl.select();
}

function setTheme() {
  return new Promise((resolve, reject) => {
    switch (getThemeName()) {
      case 'default': {
        setDefaultTheme();
        break;
      }
      case 'compact': {
        setCompactTheme();
        break;
      }
      case 'modern': {
        setModernTheme();
        break;
      }
    }
    resolve();
  });
}

function setDefaultTheme() {
  const ctrlBody = document.querySelector("#controller-body");
  ctrlBody.innerHTML = defaultController;
  ctrlBody.attr("mode", "default");
}

function setCompactTheme() {
  if (document.querySelector('#time')) document.querySelector('#time').remove();
  const ctrlBody = document.querySelector("#controller-body");
  ctrlBody.innerHTML = compactController;
  ctrlBody.attr("mode", "compact");
}

function setModernTheme() { // the problem is that player.js is supposed to be shared in both popup/settings.html, but this function is only relevant for popup.html. so writing them here is kinda nonsense, but at the same time, if i write them in different file (popup.js) and the rest of functions that shares similarities as this function remains in this file (player.js) is also a clutter.
  if (document.querySelector('#time')) document.querySelector('#time').remove();
  const ctrlBody = document.querySelector("#controller-body");
  ctrlBody.innerHTML = modernController;
  ctrlBody.attr("mode", "modern");

  // CHANGE STYLES
  document.body.style['padding'] = 0;
  document.body.style['margin'] = 0;

  const selectors = ['.container', '#time', 'hr','#second', '#share', 'body > div:nth-child(4)' ];

  selectors.forEach(sel => {;
    document.querySelector(sel).style['marginLeft'] = '8px';
    document.querySelector(sel).style['marginRight'] = '8px';
  });

  // Changing styles via JS because these elements are outside #controller-body's scope.
  // - vol-slider
  document.querySelector("#volume-slider").style['width'] = '160px';
  // - vol-icon
  document.querySelector("#volume-icon").style["width"] = "18px";
  document.querySelector("#volume-icon").style["height"] = "18px";
  // - share-icon
  document.querySelector("#share_icon").style["width"] = "16.5px";
  document.querySelector("#share_icon").style["height"] = "16.5px";
  // - removing clutters
  document.querySelectorAll('#controller-body > hr, #second > hr, #share > hr').forEach(el => el.remove());
  removeNodes();
  // - add padding-bottom to body to balance the whole page, as clutter removal occurs
  document.body.style["paddingBottom"] = "6.5px";

  // PROGRESS BAR
  // - wholebody (invisible): it exists to make the hitbox of progressbar bigger than it looks
  // - bg (visible): shows background (darkmode off: dark color / on: reverse the color)
  // - bar (visible): shows current progress with theme-color
  const wholebody = document.querySelector("#progressbar"), bg = document.querySelector('#progressbar'), bar = document.querySelector("#progressbar-bar");

  // returns the percentage of the horizontal axis of the progress bar the user hovered/clicked & function per se also edits with the percentage given.
  const editProgressBar = function(e) { // event = click / mousemove
    const rect = bg.getBoundingClientRect();
    const clickX = e.clientX - rect.left; // position relative to progress bar
    const width = rect.width;             // total width of progress bar
    let percent = (clickX / width) * 100;

    // clamp between 0 and 100
    percent = Math.max(0, Math.min(100, percent));

    bar.style['width'] = `${percent}%`;
    // I had to put this here instead of  because when it live previews during the mouse drag and when mouse ups it only sends the older number 
    // (e.g. even if you drag from 80% to 1%, then it sends 7% or something)
    // This is the best i can do here. 
    // Finger crossing that SoundCloud won't see this and think that it's a robot doing it. 
    // If such happens, then I need to put a delay to send queue/find an alternative way.
    queue('settime', percent);
    return percent;
  }

  // CLICK EVENT HANDLER FOR #PROGRESSBAR
  wholebody.addEventListener("click", (e) => {
    editProgressBar(e);
  });

  // known issue: https://www.sam.today/blog/html5-dnd-globe-icon
  let dragging = false;
  bg.addEventListener("mousedown", (e) => {
    dragging = true;
    editProgressBar(e); // initial update
  });
  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    editProgressBar(e);
  });
  document.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
  });
}

let json = {};
const defaultController = `<div id='controller' class='floating'>
      <div class='left'>
        <button id='prev' class='clickable' title='Prev'></button>
        <button id='toggle' class='clickable' title='Play/Pause' playing=''></button>
        <button id='next' class='clickable' title='Next'></button>
      </div>
      <div class='right'>
        <button id='follow' class='clickable' title='Follow/Unfollow' followed=''></button>
        <button id='fav' class='clickable' title='Like/Unlike' favorite=''></button>
        <button id='shuffle' class='clickable' title='Shuffle' shuffle=''></button>
        <button id='repeat' class='clickable' title='Repeat' mode=''></button>
      </div>
    </div>
    <hr/>

    <div style='padding-bottom: 6.5px;'>
      <div id='artwork' title='Open SoundCloud Tab' class='clickable'></div>
      <div class='container'>
        <div class='contents'>
          <a class='title clickable' title='Open SoundCloud Tab' href=''></a>
        </div>
      </div>
    </div>
    <hr/>`,
  compactController = `<div class='floating'>
    <div class='left'>
      <div id='artwork' title='Open SoundCloud Tab' class='clickable'></div>
    </div>
    <div id='controller' class='right'>
      <div class='body container'>
        <div class='contents'>
          <a class='title clickable' title='' href=''></a>
        </div>
      </div>
      <div class='body'>
        <button id='shuffle' class='clickable' title='Shuffle' shuffle=''></button>
        <div id='time'>
          <span id='current' style='float: left;'></span>
          <span id='hyphen' class='icon'></span>
          <span id='end' style='float: right;'></span>
        </div>
        <button id='repeat' class='clickable' title='Repeat' mode=''></button>
      </div>
      <div class='body'>
        <button id='fav' class='clickable' title='Like/Unlike' favorite=''></button>
        <button id='prev' class='clickable' title='Prev'></button>
        <button id='toggle' class='clickable' title='Play/Pause' playing=''></button>
        <button id='next' class='clickable' title='Next'></button>
        <button class='copynp clickable' title='Copy Title & URL'></button>
        <button id='follow' class='clickable' title='Follow/Unfollow' followed=''></button>
      </div>
    </div>
    <hr style='margin-top: 5px;'>
  </div>`,
  modernController = `<div>
      <div id='artwork' title='Open SoundCloud Tab' class='clickable'></div>
      <div class='container'>
        <div class='contents'>
          <a class='title clickable' title='Open SoundCloud Tab' href=''></a>
        </div>
      </div>
    </div>
    <div id='time'>
      <div id='progressbar' class='clickable'>
        <div id='progressbar-background' class='clickable'>
          <div id='progressbar-bar'>
          </div>
        </div>
      </div>
      <span id='current' style='float: left;'></span>
      <span id='end' style='float: right;'></span>
    </div>
    <div id='controller'>
        <button id='follow' class='clickable' title='Follow/Unfollow' followed=''></button>
        <button id='shuffle' class='clickable' title='Shuffle' shuffle=''></button>
        <div id='center'>
          <button id='prev' class='clickable' title='Prev'></button>
          <button id='toggle' class='clickable' title='Play/Pause' playing=''></button>
          <button id='next' class='clickable' title='Next'></button>
        </div>
        <button id='repeat' class='clickable' title='Repeat' mode=''></button>
        <button id='fav' class='clickable' title='Like/Unlike' favorite=''></button>
    </div>
    <hr/>`;