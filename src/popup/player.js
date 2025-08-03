// update() function is for visual things.
// it recieves json data and changes neccessary elements
async function update(val) {
  // if value is null or isn't json, return. 
  if (val == null || typeof val !== 'object') return;

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
  const arr = [
    { key: "artwork", selector: "#artwork", handler: (link) => { 
      if (toggleArtwork) toggleArtwork(settings['display-artwork']);
      document.querySelector("#artwork").style.backgroundImage = link; 
    }},
    { key: "title", selector: ".title", handler: () => {
      const el = document.querySelector(".title");
      el.innerText = replaceText(localStorage.getItem('trackdisplay'), val);
      startMarquees();
      el.attr('href', val['link']);
    }},
    { key: "time", selector: "#current", handler: (time) => {
      if (document.querySelector("#current").innerText != time['current']) {
        document.querySelector("#current").innerText = time['current'];
        if (loc("popup.html")) document.querySelector("#share_current_time").value = time['current'];
      }
      if (document.querySelector("#end").innerText != time['end']) {
        document.querySelector("#end").innerText = time['end'];
      }
    }},
    { key: "playing", selector: "#toggle", attr: "playing" },
    { key: "favorite", selector: "#fav", attr: "favorite" },
    { key: "shuffle", selector: "#shuffle", attr: "shuffle" },
    { key: "repeat", selector: "#repeat", attr: "mode" },
    { key: "volume", selector: "#current-volume", handler: (vol) => {
      if (!loc("popup.html")) return;
      document.querySelector("#current-volume").innerText = `${Math.floor(vol)} %` 
    }}, 
    { key: "mute", selector: "#volume-icon", handler: (muted) => { 
      if (!loc("popup.html")) return;
      const cList = document.querySelector("#volume-icon").classList; 
      muted ? cList.add("muted") : cList.remove("muted");
    }},
    { key: "following", selector: "#follow", handler: (following) => {
      if (following != null && following != 'self') {
        document.querySelector("#follow").style.display = "";
        document.querySelector("#follow").attr("followed", following);
      } else if (following == 'self') {
        document.querySelector("#follow").style.display = "none";
      }
    }}
  ];

  arr.forEach(({ key, selector, attr, handler }) => {
    if (val[key] != null) {
      const element = document.querySelector(selector);
      handler ? handler(val[key]) : element.attr(attr, val[key]);
    }
  });

  if (loc("popup.html")) {
    setShareLink(val);
  }
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
    window.onresize = function() {
      localStorage["window-width"] = window.innerWidth;
      localStorage["window-height"] = window.innerHeight;
    }
  }
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
    }
    resolve();
  });
}

function setDefaultTheme() {
  document.querySelector("#controller-body").innerHTML = defaultController;
  document.querySelector("#controller-body").attr("mode", "default");
}

function setCompactTheme() {
  if (document.querySelector('#time')) document.querySelector('#time').remove();
  document.querySelector("#controller-body").innerHTML = compactController;
  document.querySelector("#controller-body").attr("mode", "compact");
}

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
      <div class='marquee'>
        <a class='title clickable' title='Open SoundCloud Tab' href=''></a>
      </div>
    </div>
    <hr/>`,
  compactController = `<div class='floating'>
    <div class='left'>
      <div id='artwork' title='Open SoundCloud Tab' class='clickable'></div>
    </div>
    <div id='controller' class='right'>
      <div class='body marquee'>
        <a class='title clickable' title='' href=''></a>
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
  </div>`;