async function queue(request, value) {
  if (!request) return null;

  request = String(request).toLowerCase();
  const results = await chrome.tabs.query({ url: '*://soundcloud.com/*' });

  if (results.length === 0 || results[0].status !== 'complete') {
    return null;
  }

  if (debug) console.log("queued: ", request);

  let jsonRequest = { type: request };
  if (value) jsonRequest.value = value;

  const val = await chrome.tabs.sendMessage(results[0].id, jsonRequest);

  if (val) {
    if (debug) console.log("received:", val);
    // Use function update() in other windows/popups to apply and show same data simultaneously.
    syncAcrossViews("update", val['response'] ?? val);
    // same thing to toggleElements().
    syncAcrossViews("toggleElements", true);
    return val;
  }

  return null;
}

async function checkMultipleWindow() {
  // Exit the function if requestData is not defined or not a function
  if (typeof requestData != 'function') return;

  // Get all open extension windows and store their count in `l`
  let views = chrome.extension.getViews(), l = views.length;

  // If there is only one window, or this window is the first in the array
  if (l == 1 || (l > 1 && views[0] == this)) {
    console.log('this is the parent window.');
    setInterval(requestData, 1000); // loop
    if (or) { // If the flag `or` is true (popup.js, settings.js, embed.js has it individually)
      clearInterval(checkTimer); // Stop the checkMultipleWindow interval to avoid duplicates
    }
  } else if (or == false) { // If this is not the parent window and the flag `or` is false
    console.log('initializing...');
    checkTimer = setInterval(checkMultipleWindow, 1000); // restart the loop
    or = true; // flag
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
  return settings['startpage'] ?? 'https://soundcloud.com';
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
  // THE HANDLER FOR VOLUME CHANGES; SHIFT + UP/DOWN
  let sliderTimeout, lastVol;
  const showSlider = function(val) {;
    const newVol = val['response']['volume'];
    if (newVol) {
      if (!lastVol) lastVol = newVol;
      if (lastVol === newVol) return;
      lastVol = newVol;
    }

    const slider = document.querySelector("#volume-slider");
    if (!slider) return; // ignore if there's no slider === current page is not popup.html || current theme is not 'modern'
    if (settings['always-show-slider']) return;

    slider.classList.add("anim"); // animate slider to show up

    // clear old timeout
    if (sliderTimeout) clearTimeout(sliderTimeout);

    // set new timeout
    sliderTimeout = setTimeout(() => {
      slider.classList.remove("anim");
      sliderTimeout = null;
    }, 500);
  };

  // THE CORE OF initKeyboardBinds();
  const list = {
    /*
      keycode: { 
        shiftPressed: "command name",
        handler: handler(),
        target: "only run commands and handlers when targeted element are selected."
      }
    */
    32: { // SPACE
      'false': {
        command: 'toggle',
      }
    },
    38: { // UP ARROW
      'true': {
        command: 'up', // + SHIFT
        handler: showSlider
      },
      'false': {
        command: 'up',
        handler: showSlider,
        targetID: 'volume-slider' // queue in only when #volume-slider is focused.
      }
    },
    40: { // DOWN ARROW
      'true': {
        command: 'down', // + SHIFT
        handler: showSlider
      },
      'false': {
        command: 'down',
        handler: showSlider,
        targetID: 'volume-slider' // queue in only when #volume-slider is focused.
      }
    },
    77: { // M
      'false': {
        command: 'mute'
      }
    },
    76: { // L
      'true': {
        command: 'repeat' // + SHIFT
      },
      'false': {
        command: 'fav'
      }
    },
    83: { // S
      'true': {
        command: 'shuffle'
      }
    },
    37: { // LEFT ARROW
      'true': {
        command: 'prev' // + SHIFT
      },
      'false': {
        command: 'seekb'
      }
    },
    39: { // RIGHT ARROW
      'true': {
        command: 'next' // + SHIFT
      },
      'false': {
        command: 'seekf'
      }
    },
    81: { // Q
      'false': {
        handler: openSCTab
      }
    }
  };

  document.body.addEventListener('keydown', function(e) {
    // if SC-Player is ready to interact with its main content tab.
    if (keyReady == false) return;
    // ignore any pressed key when it's in settings.html && compact player's not enabled there
    if (loc('settings.html') && localStorage['compact_in_settings'] != null && !Bool(localStorage['compact_in_settings'])) return;

    const keycode     = e.keyCode;
    const shiftkey    = e.shiftKey ? 'true' : 'false';
    const keymap      = list[keycode];
    const keybind     = keymap?.[shiftkey] ?? null;
    const cmd         = keybind?.command   ?? null;
    const handler     = keybind?.handler   ?? null;
    const targetID    = keybind?.targetID  ?? null;

    // no keymap return.
    if (!keymap) return;
    // ignore unexisting keybinds
    if (!keybind) return;

    // replace your current focus/target check with this
    const active = document.activeElement;
    const activeTag = active?.tagName?.toLowerCase() ?? "";
    const formElementIsFocused = ["input", "select", "option", "textarea"].includes(activeTag) || active?.isContentEditable;

    // If this keybind requires a specific element, only run when that element is focused.
    // Otherwise (no targetID) ignore the key when any form control is focused.
    if (targetID) {
      if (active?.id !== targetID) return;
    } else {
      if (formElementIsFocused) return;
    }

    // send commands to content.js
    if (cmd) {
      queue(cmd).then((val) => {
        // then, if there's a handler, then run it.
        if (handler) {
          handler(val);
        }
      }); 
    } else {
      // no command registered but if there's a handler, then run it.
      handler();
    }
    e.preventDefault(); // block default browser actions, like page scrolling, when the spacebar is pressed
  });
}

// startMarquees() will only be called when title has changed. (= track change/new track)
// very error prone. poor coding. easy to break and is hard to maintain.
function startMarquees() {
  if ( loc('popup.html') && getThemeName() == 'legacy' && !settings['apply_marquee_to_legacy'] ) return;
  let marqueeInterval, marqueeAnimation;

  // THE CONTAINER AND ITS CONTENTS
  // .container  = never moves
  // .contents   = moves
  // .contents a = just exists (firstChild and secondChild)
  const container = document.querySelector(".container"), contents = container.querySelector(".contents"), firstChild = contents.querySelector('a');

  if (marqueeInterval) { // reset
    clearInterval(marqueeInterval);
    marqueeInterval = null;
    marqueeAnimation = null;
    container.removeAttribute("animate");
    container.onanimationend = null;
  }

  // values
  const isDefaultMarquee = !settings['back-and-forth'];
  const dupeEnabled = settings['duplication'];
  // numbers, parseInt just in case
  let duration = settings['duration'] ?? 5000; // pixels per ms?
  const pauseTime = settings["pause"] ?? 5000; // pause time in every animation
  const totalTime = duration + pauseTime;

  // modify elements
  container.attr("enabled", "true"); // shouldn't it be contents?
  container.attr("mode", isDefaultMarquee ? "marquee" : "back-and-forth");
  contents.style["display"] = "inline-block"; // ?

  container.style.setProperty("--duration", `${duration}ms`);
  container.style.setProperty("--pause-time", `${pauseTime}ms`);
  container.style.setProperty("--container-width", `calc(${container.offsetWidth}px)`);

  // sizes
  let containerWidth = container.getBoundingClientRect().width;
  let singleTitleWidth = firstChild.getBoundingClientRect().width - parseFloat(getComputedStyle(firstChild).paddingRight);
  const fontSize = parseFloat(getComputedStyle(firstChild).fontSize);

  // applying values & modify elements (gibberish)
  if (isDefaultMarquee) {
    container.style.setProperty("--duration", `${duration/2}ms`); // overwrite
    if (dupeEnabled) {
      container.attr("hasDupe", "true");

      const dupeAlreadyExists = document.querySelectorAll('.title').length > 1;
      const secondChild = dupeAlreadyExists ? document.querySelectorAll('.title')[1] : firstChild.cloneNode(true); // clone the content

      if (!dupeAlreadyExists) {
        contents.appendChild(secondChild);
      }

      // sizes
      containerWidth = container.getBoundingClientRect().width;
      singleTitleWidth = firstChild.getBoundingClientRect().width - parseFloat(getComputedStyle(firstChild).paddingRight);

      // calculate the gap between each child
      const isSmallTitle = containerWidth > singleTitleWidth + (fontSize * 2);
      const gap = isSmallTitle ? `${containerWidth - singleTitleWidth}px` : '2em';

      firstChild.style['paddingRight'] = gap;
      secondChild.style['paddingRight'] = gap;
    }
  } else {    
    if (containerWidth > singleTitleWidth) return; // if it doesn't define properties, it won't animate.
  }

  // animation loop part (gibberish...?)
  if ((isDefaultMarquee && dupeEnabled) || (!isDefaultMarquee)) { // if other than default marquee (= marquee w/ dupe OR breathing)
    marqueeAnimation = function() {
      container.attr('animate', ''); // the reason for this if-statement's condition is because those two just need to hold attribute "animate" without value, therefore I thought such implementation is the best practice for this. Although I don't know putting IFs within function and onanimationend is better or not. In terms of readability, i thought this is better.
    }
    container.onanimationend = () => { // not addeventlistener
      container.removeAttribute('animate');
    };
  } else { // if default
    // KNOWN ISSUE: If text is too short, it won't animate properly; the second animation starts from the middle.
    marqueeAnimation = function() {
      container.attr('animate', "m1");
    }
    container.onanimationend = () => { // not addeventlistener
      // second animation will get interrupted by setInterval below, thus onanimationend won't get triggered in the first place, but i wrote if-statement here nonetheless.
      if (container.attr('animate') === "m1") container.attr('animate', "m2");
    };
  }
  // animation insertion
  marqueeAnimation();
  marqueeInterval = setInterval(marqueeAnimation, totalTime);
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
    document.querySelector(".container").style["marginLeft"] = hidden ? '0' : '1em';
    document.querySelector(".container").style["width"] = `calc(${hidden ? 250 : 200}px - ${hidden ? '0px' : '1em'})`;
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