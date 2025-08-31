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
      document.querySelector("#artwork").style['backgroundImage'] = link; 
    }},
    { key: "title", selector: ".title", handler: () => {
      document.querySelectorAll(".title").forEach(function(el) {
        el.innerText = replaceText(localStorage.getItem('trackdisplay'), val);
        el.attr('href', val['link']);
      });
      startMarquees();
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
      if (!loc("popup.html")) return; // volume slider or curent volume text is only available in popup.html
      if (sliderEditing) return; // not to interfere with volume change. 

      const volume = Math.floor(vol);

      document.querySelector("#current-volume").innerText = `${volume} %`;
      const range = document.querySelector("#volume-slider");
      range.value = volume;
      range.oldNum = volume;
      // console.log(document.querySelector("#volume-slider").value);
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
        if (document.querySelector('#time')) document.querySelector('#time').remove();
        const ctrlBody = document.querySelector("#controller-body");
        ctrlBody.innerHTML = modernController;
        ctrlBody.attr("mode", "modern");

        document.body.style['padding'] = 0;
        document.body.style['margin'] = 0;

        const selectors = ['.container', '#time', 'hr','#second', '#share', 'body > div:nth-child(4)'];

        selectors.forEach(sel => {;
          document.querySelector(sel).style['marginLeft'] = '8px';
          document.querySelector(sel).style['marginRight'] = '8px';
        });

        document.querySelector("#controller").style['marginRight'] = '8px';
        document.querySelector("#artwork").style['width'] = '100%';
        document.querySelector(".container").style['width'] = 'calc(250px - 8px - 8px)';
        document.querySelector('.container').style['paddingTop'] = '0.5em';

        document.querySelector("#volume-slider").style['width'] = '160px';

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
  modernController = `<div style='padding-bottom: 6.5px;'>
      <div id='artwork' title='Open SoundCloud Tab' class='clickable'></div>
      <div class='container'>
        <div class='contents'>
          <a class='title clickable' title='Open SoundCloud Tab' href=''></a>
        </div>
      </div>
    </div>
    <div id='time'>
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