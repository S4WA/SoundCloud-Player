async function queue(request, value) {
  if (!request) return null;

  request = String(request).toLowerCase();
  const results = await chrome.tabs.query({ url: '*://soundcloud.com/*' });

  if (results.length === 0 || results[0].status !== 'complete') {
    return null;
  }

  let jsonRequest = { type: request };
  if (value) jsonRequest.value = value;

  const val = await chrome.tabs.sendMessage(results[0].id, jsonRequest);

  if (val) {
    // Use function update() in other windows/popups to apply and show same data simultaneously.
    syncAcrossViews("update", val['response'] ?? val);
    // same thing to toggleElements().
    syncAcrossViews("toggleElements", true);
    return val;
  }

  return null;
}

async function checkMultipleWindow() {
  if (typeof requestData != 'function') return;

  let views = chrome.extension.getViews(), l = views.length; 
  if (l == 1 || (l > 1 && views[0] == this)) {
    console.log('this is the parent window.');
    setInterval(requestData, 1000); // loop
    if (or) {
      clearInterval(checkTimer);
    }
  } else if (or == false) {
    console.log('initializing...');
    checkTimer = setInterval(checkMultipleWindow, 1000);
    or = true;
  }
}

async function requestData() {
  queue('smart-request-data').then((val) => {
    if (val != null && val != {}) {
      keyReady = true;
      return val;
    }
    return {};
  }).then((val) => {
    for (let key in val) {
      json[key] = val[key];
    }
    if (val['title'] != null) {
      sessionStorage.setItem('data', JSON.stringify(json));
    }
  });

  let [ScTab] = await chrome.tabs.query({ url: '*://soundcloud.com/*' });

  // If sc tab is closed
  if (keyReady && ScTab == null) {
    keyReady = false;
    syncAcrossViews("toggleElements", false);
  }
}

function getStartPage() {
  return settings['startpage'] != null ? settings['startpage'] : 'https://soundcloud.com';
}

async function openSCTab2() {
  let [ScTab] = await chrome.tabs.query({ url: '*://soundcloud.com/*' });
  if (!ScTab) {
    await chrome.tabs.create({ url: getStartPage() });
    if (!isPopout()) window.close();
  }
  return;
}

async function openSCTab() {
  // Search for SoundCloud Tab (true/false)
  let [ScTab] = await chrome.tabs.query({ url: '*://soundcloud.com/*' });
  let [currentTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

  if (!currentTab) {
    return false;
  }
  
  // -> If no Sc Tab, Make one
  if (!ScTab) {
    await chrome.tabs.create({ url: getStartPage() });
    return false;
  }

  // -> If not same window, focus the window that has sc tab
  if (currentTab.windowId != ScTab.windowId) {
    await chrome.windows.update(ScTab.windowId, { focused: true });
  }

  // -> If current tab is sc tab ->
  //    no  ->  focus the sc tab.
  //    yes ->  queue open (no need to focus)
  if (currentTab.id != ScTab.id) {
    await chrome.tabs.update(ScTab.id, { active: true });
  } else {
    await queue('open');
  }

  if (!isPopout()) {
    window.close();
  }
  return true;
}

function fixedEncoder(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}

function openURL(link) {
  chrome.tabs.create({ url: link });
}

function copyToClipboard(text) {
  var input = document.createElement('input');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  input.value = text;

  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
};

function Bool(string) {
  return string.toLowerCase() == 'true';
}

// Settings
function getThemeName() {
  if (localStorage.getItem('theme')) return localStorage.getItem('theme').toLowerCase();
  return 'default';
}

function updateThemeColor(color) {
  if (!color) {
    color = localStorage.getItem('themecolor');
  }
  if (color != localStorage.getItem('themecolor')){
    localStorage.setItem('themecolor', color);
  }
  document.documentElement.style.setProperty('--theme-color', color);
}

function updateBGcolor(color) {
  if (!color) {
    color = localStorage.getItem('bgcolor');
  }
  if (color != localStorage.getItem('bgcolor')){
    localStorage.setItem('bgcolor', color);
  }
  document.documentElement.style.setProperty('--bg-color', color);
}

function updateFont(font) {
  if (!font) {
    font = localStorage.getItem('font');
  } else if (font != localStorage.getItem('font')){
    localStorage.setItem('font', font);
  }
  document.documentElement.style.setProperty('--custom-font', font);
  settings['font'] = font;
}

function updateFontSize(px) {
  if (!px) {
    px = localStorage.getItem('font-size');
  } else if (px != localStorage.getItem('font-size')) {
    localStorage.setItem('font-size', px);
  }

  document.documentElement.style.setProperty('--font-size', px);
  settings['font-size'] = px;
}

function toggleDarkmode() {
  darkmode(dark =! dark);
}

function darkmode(val) {
  if (val == null) return;
  document.body.attr('dark', val);
  document.getElementById('toggle_darkmode').attr('dark', val); // this attr is for the icons 
  localStorage.setItem('darkmode', val);
  return val;
}

async function initDarkmode() {
  if (!(loc("popup.html") || loc("settings.html"))) return; // if it's embed.html
  if (localStorage.getItem('darkmode') != null) {
    dark = (localStorage.getItem('darkmode') === 'true');
  }
  darkmode(dark);
  document.querySelector("#toggle_darkmode").addEventListener('click', () => { toggleDarkmode(); });
}

async function popup(mylink, windowname) {
  await chrome.windows.create({
    url: mylink,
    type: 'popup',
    width: settings['remember-window-size'] ? settings['window-width'] : 290,
    height: settings['remember-window-size'] ? settings['window-height'] : 400,
    focused: true
  });
}

function isChrome() {
  return chrome.runtime.getURL('').includes('chrome-extension');
}

function isPopout() {
  return loc('p=1');
}

function loc(val) {
  return location.href.includes(val);
}

function initKeyboardBinds() {
  const list = {
    /*
      keycode: { withShiftKey: "command name" }

      What's withShiftKey?:
        It enables the user to do max 2 diff things with the same keycode.
        e.g.) using the key "L" alone (without pressing shift key), would act as liking/unliking the current track. Whereas "L" + shift will cycle the repeat modes.
    */
    32: { 'false': 'toggle'  },
    38: { 'true' : 'up'      },
    40: { 'true' : 'down'    },
    77: { 'false': 'mute'    },
    76: { 'true' : 'repeat', 'false':   'fav' },
    83: { 'true' : 'shuffle' },
    37: { 'true' : 'prev',   'false': 'seekb' },
    39: { 'true' : 'next',   'false': 'seekf' },
  };

  document.body.addEventListener('keydown', function(e) {
    if (keyReady == false) return;
    if ([ "input", "select", "option", "textarea" ].includes(e.target.tagName.toLowerCase())) return;
    if (loc('settings.html') && localStorage['compact_in_settings'] != null && !Bool(localStorage['compact_in_settings'])) return;
    switch (e.keyCode) {
      case 81: { // Q Key
        openSCTab();
        break;
      }
      default: { // Other than Q key
        if (list[e.keyCode] == null) return;

        let cmd = list[e.keyCode][e.shiftKey ? 'true' : 'false'];

        if (cmd == null) return;

        queue(cmd);
        e.preventDefault(); // block default browser actions, like page scrolling, when the spacebar is pressed
      }
    }
  });
}

// startMarquees() will only be called when a new track is played.
function startMarquees() {
  if ( (!settings['apply_marquee_to_default'] && getThemeName() == 'default') && loc('popup.html') ) return;

  const marquee = document.querySelector(".marquee"), content = marquee.querySelector(".title");

  const isDefault = !settings['back-and-forth'];

  let duration = settings["duration"] ? Number(settings["duration"]) : 5000;
  const pauseTime = settings["pause"] ? Number(settings["pause"]) : 5000;
  const totalTime = duration + pauseTime;

  marquee.attr("enabled", "true");
  marquee.attr("mode", isDefault ? "marquee" : "back-and-forth");

  content.style["display"] = "inline-block";

  const insertNewAnimation = function(el, an) {
    el.style["animation"] = 'none'; // resetting
    el.offsetHeight; // forcing a reflow
    el.style["animation"] = an;
  }

  const paddingLeft = parseFloat(content.style.paddingLeft) || 0, paddingRight = parseFloat(content.style.paddingRight) || 0;
  if (content.offsetWidth - paddingLeft - paddingRight < marquee.offsetWidth) return;

  let cssAnimation;
  if (isDefault) {
    if (settings['duplication']) {
    }

    // only default marquee uses this.
    content.style.setProperty('--title-offset-x', `${content.offsetWidth}px`);

    // Normal marquee: Placeholder 1 = animation's duration // 2 = animation-delay // 3 = animation's duration // 4 = duration of 1 + 2
    // - Each part alone is incomplete.
    // - It divides by two cuz the duration value represents the total duration of the entire animation sequence, and the sequence is split into two equal parts.
    cssAnimation = `normal-marquee-first ${duration/2}ms ${pauseTime}ms linear forwards, normal-marquee-second ${duration/2}ms ${duration/2 + pauseTime}ms linear forwards`; 
  } else {
    // The property "--container-width" will be used only for the breathing mode.
    content.style.setProperty('--container-width', `calc(${marquee.offsetWidth}px)`);

    // tbh, idk what to do about pauseTime for this
    cssAnimation = `back-and-forth ${duration + pauseTime}ms ${pauseTime}ms linear forwards`;
  }

  content.style["animation"] = cssAnimation;
  content.addEventListener('animationend', () => {
    setTimeout(() => {
      insertNewAnimation(content, cssAnimation);
    }, totalTime);
  });
}

async function checkDisplayArtwork() {
  let available = Bool( localStorage.getItem('display-artwork') );
  toggleArtwork(available);
  if (loc('settings.html') && available) document.querySelector("#display-artwork").attr('checked', '');
}

function toggleArtwork(val) {
  if (val == null) return;

  const hidden = (val == false), isCompactInSettingsPage = loc('settings.html') && localStorage['compact_in_settings'] != null && Bool(localStorage['compact_in_settings']);
  if (getThemeName() == 'compact' || isCompactInSettingsPage) {
    const con = document.querySelector("#controller");
    con.style["width"] = `${hidden ? 250 : 200}px`;
    con.style["height"] = `${hidden ? (isCompactInSettingsPage ? 75 : 65) : 50}px`;

    // adding 1em should be only applied to marquee-container, instead of applying it to #controller as a whole.
    document.querySelector(".marquee").style["marginLeft"] = hidden ? '0' : '1em';
    document.querySelector(".marquee").style["width"] = `calc(${hidden ? 250 : 200}px - ${hidden ? '0px' : '1em'})`;
  }

  document.querySelector("#artwork").style.display = val ? 'inline-block' : 'none';
}

function replaceText(text, json) {
  if (!json) json = JSON.parse( sessionStorage.getItem('data') );
  text = text.replace('%title%', json['title']).replace('%artist%', json['artist']).replace('%url%', json['link']);
  return text;
}

function isJsonString(str) {
  let o;
  try {
    o = JSON.parse(str);
  } catch (e) {
    return null;
  }
  return o;
}


function slideUp(element) {
  element.style.overflow = 'hidden';
  element.style.height = element.offsetHeight + 'px';
  element.style.transition = 'height 0.3s ease-out';
    
    // Force reflow
  element.offsetHeight;
    
  element.style.height = '0px';
    
  setTimeout(() => {
      element.style.display = 'none';
      element.style.height = '';
      element.style.overflow = '';
      element.style.transition = '';
  }, 300);
}

function slideDown(element) {
  element.style.display = 'block';
  element.style.overflow = 'hidden';
  element.style.height = '0px';
  element.style.transition = 'height 0.3s ease-out';
    
  // Get the natural height
  const height = element.scrollHeight + 'px';
    
  // Force reflow
  element.offsetHeight;
    
  element.style.height = height;
    
  setTimeout(() => {
      element.style.height = '';
      element.style.overflow = '';
      element.style.transition = '';
  }, 300);
}

// added attr() in order to avoid replacing every attr function from jquery to vanilla js's setAttribute().
Element.prototype.attr = function(name, value) {
  if (value === undefined) {
    return this.getAttribute(name);
  } else {
    this.setAttribute(name, value);
    return this;
  }
};

function syncAcrossViews(fnName, args) {
  const views = chrome.extension.getViews();

  for (const view of views) {
    if (typeof view[fnName] === 'function') {
      args ? view[fnName](args) : view[fnName]();
    }
  }
}

// keyReady: if SC-Player is ready to interact with its main content tab.
var keyReady = false;