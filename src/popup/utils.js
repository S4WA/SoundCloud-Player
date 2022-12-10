function isChrome() {
  return browser.runtime.getURL('').includes('chrome-extension');
}

async function queue(request, value) {
  if (!request) return null;

  let r = new Promise(async(resolve, reject) => {
    request = String(request).toLowerCase();
    let results = await browser.tabs.query({ url: '*://soundcloud.com/*' });

    if (results.length != 0 && results[0].status == 'complete') {
      var jsonRequest = { 'type': request };
      if (value) jsonRequest['value'] = value;
      resolve(browser.tabs.sendMessage(results[0].id, jsonRequest));
    }
  });

  return r.then((val) => {
    if (val['response'] != null) {
      val = val['response'];
    }

    let views = browser.extension.getViews();
    for (let n in views) {
      if (typeof views[n].update != 'function') continue;
      views[n].update(val);
    }
    return val;
  });
}

async function checkMultipleWindow() {
  if (typeof loopRequestData != 'function') return;

  let views = browser.extension.getViews(), l = views.length;
  // console.log('hello');
  if (l == 1 || (l > 1 && views[0] == this)) {
    console.log('main channel');
    setInterval(loopRequestData, 1000);
    if (or) {
      clearInterval(checkTimer);
    }
  } else if (or == false) {
    console.log('initializing');
    checkTimer = setInterval(checkMultipleWindow, 1000)
    or = true;
  }
}

async function loopRequestData() {
  queue('smart-request-data').then((val) => {
    if (val != null && val != {}) {
      // console.log(val);
        
      // Controller
      if (typeof toggleElements === 'function') {
        toggleElements(true);
      }
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

  let [ScTab] = await browser.tabs.query({ url: '*://soundcloud.com/*' });

  // If sc tab is closed -> reload the popup.html (itself)
  if (keyReady && ScTab == null) {
    location.reload(); // RESET EVERYTHING!
  }
}

function getStartPage() {
  return settings['startpage'] != null ? settings['startpage'] : 'https://soundcloud.com';
}

async function openSCTab2() {
  let [ScTab] = await browser.tabs.query({ url: '*://soundcloud.com/*' });
  if (!ScTab) {
    await browser.tabs.create({ url: getStartPage() });
    if (!isPopout()) window.close();
  }
  return;
}

async function openSCTab() {
  // Search for SoundCloud Tab (true/false)
  let [ScTab] = await browser.tabs.query({ url: '*://soundcloud.com/*' });
  let [currentTab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });

  if (!currentTab) {
    return false;
  }
  
  // -> If no Sc Tab, Make one
  if (!ScTab) {
    await browser.tabs.create({ url: getStartPage() });
    return false;
  }

  // -> If not same window, focus the window that has sc tab
  if (currentTab.windowId != ScTab.windowId) {
    await browser.windows.update(ScTab.windowId, { focused: true });
  }

  // -> If current tab is sc tab ->
  //    no  ->  focus the sc tab.
  //    yes ->  queue open (no need to focus)
  if (currentTab.id != ScTab.id) {
    await browser.tabs.update(ScTab.id, { active: true });
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
  browser.tabs.create({ url: link });
}

function copyToClipboard(text) {
  var input = $('<input>'), 
    style = {
      'position': 'fixed',
      'opacity': 0
    };

  input.css(style);
  input.val(text);

  $('body').append(input);

  input.select();
  document.execCommand('Copy');

  input.remove();
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
  $(':root').css('--theme-color', color);
}

function updateBGcolor(color) {
  if (!color) {
    color = localStorage.getItem('bgcolor');
  }
  if (color != localStorage.getItem('bgcolor')){
    localStorage.setItem('bgcolor', color);
  }
  $(':root').css('--bg-color', color);
}

function updateFont(font) {
  if (!font) {
    font = localStorage.getItem('font');
  } else if (font != localStorage.getItem('font')){
    localStorage.setItem('font', font);
  }
  $(':root').css('--custom-font', font);
  settings['font'] = font;
}

function updateFontSize(px) {
  if (!px) {
    px = localStorage.getItem('font-size');
  } else if (px != localStorage.getItem('font-size')) {
    localStorage.setItem('font-size', px);
  }

  $(':root').css('--font-size', px);
  settings['font-size'] = px;
}

function toggleDarkmode() {
  darkmode(dark =! dark);
}

function darkmode(val) {
  if (val == null) return;
  $('body').attr('dark', val);
  $('#toggle_darkmode').attr('dark', val); // this attr is for the icons 
  localStorage.setItem('darkmode', val);
  return val;
}

async function popup(mylink, windowname) {
  await browser.windows.create({
    url: mylink,
    type: 'popup',
    width: 290,
    height: 400,
    focused: true
  });
}

function isPopout() {
  return loc('p=1');
}

function loc(val) {
  return location.href.includes(val);
}

function initKeyboardBinds() {
  $('input,select,textarea').keydown(function(e) {
    e.stopPropagation();
  });
  const list = {
    // keycode, queue cmd, shift? 
    32: { 'false':  'toggle' },
    38: { 'true' :      'up' },
    40: { 'true' :    'down' },
    77: { 'false':    'mute' },
    76: { 'true' :  'repeat', 'false':   'fav' },
    83: { 'true' : 'shuffle' },
    37: { 'true' :    'prev', 'false': 'seekb' },
    39: { 'true' :    'next', 'false': 'seekf' },
  };

  $('body').keydown(function (e) {
    if (keyReady == false) return true;
    switch (e.keyCode) {
      case 81: { // Q Key
        openSCTab();
        break;
      }
      default: { // Arrow Right
        if (list[e.keyCode] == null) return true;

        let cmd = list[e.keyCode][e.shiftKey ? 'true' : 'false'];

        if (cmd == null) return true;

        queue(cmd).then(update);
        return false;
      }
    }
  });
}

function startMarquees() {
  if (!$().marquee || ( (!settings['apply_marquee_to_default'] && getThemeName() == 'default') && loc('popup.html') )) return;
  if (!settings['back-and-forth']) {
    $('.marquee').marquee('destroy').bind('finished', () => {
      setTimeout(() => {
        $('.marquee').marquee('pause');
      }, isDuplicationEnabled() ? 0 : getPauseTime());
      setTimeout(() => {
        $('.marquee').marquee('resume');
      }, isDuplicationEnabled() ? getPauseTime() : getTextVisibleDuration() + getPauseTime());
    }).marquee({
      direction: 'left', 
      duration: getTextVisibleDuration(),
      pauseOnHover: loc('embed') ? false : true,
      startVisible: true,
      pauseOnCycle: true,
      duplicated: isDuplicationEnabled()
    });
  } else {
    $('.title').wrap('<div class="title-mask"></div>').addClass('breathing').removeClass('title');
    $('.breathing').each((i,el) => {
      let width = el.clientWidth,
        containerWidth = el.parentElement.clientWidth,
        offset = width - containerWidth;

      $(el.parentElement).css('-webkit-mask-image', width < containerWidth ? 'none' : 'linear-gradient(90deg,transparent 0,#000 6px,#000 calc(100% - 12px),transparent)');

      if (offset > 0) {
        el.style.setProperty('--max-offset', offset + 'px');
        el.style.setProperty('--anime-duration', minmax(offset * 100, 2000, 10000) + 'ms');
        el.classList.add('c-marquee');
      } else {
        el.style.removeProperty('--max-offset', offset + 'px');
        el.classList.remove('c-marquee');
      }
    });
  }
}

function getTextVisibleDuration() {
  if (localStorage.getItem('duration')) return Number( localStorage.getItem('duration') );
  return 5000;
}

function getPauseTime() {
  if (localStorage.getItem('pause')) return Number( localStorage.getItem('pause') );
  return 5000;
}

function isDuplicationEnabled() {
  return Bool(localStorage.getItem('duplication'));
}

async function checkDisplayArtwork() {
  let available = Bool( localStorage.getItem('display-artwork') );
  toggleArtwork(available);
  if (loc('settings.html') && available) $('#display-artwork').attr('checked', '');
}

function toggleArtwork(val) {
  if (val == null) return;

  let hidden = (val == false), 
    isCompactInSettingsPage = (loc('settings.html') && localStorage.getItem('compact_in_settings') != null && localStorage.getItem('compact_in_settings') == 'true');
  if (getThemeName() == 'compact' || isCompactInSettingsPage) {
    $('#controller').css('width', hidden ? '250px' : '200px');
    $('#controller').css('height', hidden ? (isCompactInSettingsPage ? '75px' : '65px') : '50px');
    $('.children.marquee').css('padding-left', hidden ? '5px' : '10px');
  }

  $('.title,.breathing').css('padding-left', hidden ? '0' : '1em').css('padding-right', hidden ? '0' : '1em');
  $('#artwork').css('display', val ? 'inline-block' : 'none');
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

function nightTime(hour, minute) {
  let auto = settings['darkmode_automation'];
  if (auto == null || auto['enabled'] == null || auto['enabled'] == false) {
    return -1;
  }

  let valSH = auto['range-start'][0], valSM = auto['range-start'][1], valEH = auto['range-end'][0], valEM = auto['range-end'][1];
  let date = new Date(), hrs = hour ? hour : date.getHours(), mins = minute ? minute : date.getMinutes();

  return (hrs > valSH || (hrs == valSH && mins >= valSM)) || (hrs < valEH || (hrs == valEH && mins <= valEM));
}

var marqueeReady = false, keyReady = false, duplicated = false;
let minmax = (v, min = v, max = v) => v < min ? min : v > max ? max : v;
