async function queue(request, value) {
  return new Promise((resolve, reject) => {
    request = String(request).toLowerCase();
    chrome.tabs.query({ url: '*://soundcloud.com/*' }, (results) => {
      if (results.length != 0) {
        var jsonRequest = {}

        jsonRequest['type'] = request;

        if (value) jsonRequest['value'] = value;

        chrome.tabs.sendMessage(results[0].id, jsonRequest, function(res) {
          // console.log(res);
          resolve(res);
        });
      }
    });
  });
}

async function openSCTab2() {
  let [ScTab] = await chrome.tabs.query({ url: '*://soundcloud.com/*' });
  if (!ScTab) {
    await chrome.tabs.create({ url: 'https://soundcloud.com' }, (tab) => {});
    if (!isPopout()) window.close();
  }
  return;
}

async function openSCTab() {
  // Search for SoundCloud Tab (true/false)
  let [ScTab] = await chrome.tabs.query({ url: '*://soundcloud.com/*' });
  let [currentTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  
  // -> If no Sc Tab, Make one
  if (!ScTab) {
    await chrome.tabs.create({ url: 'https://soundcloud.com' });
    return;
  }

  // -> If not same window, focus the window that has sc tab
  if (currentTab.windowId != ScTab.windowId) {
    await chrome.windows.update(ScTab.windowId, { focused : true }, null);
  }

  // -> If current tab is sc tab ->
  //    no  ->  focus the sc tab.
  //    yes ->  queue open (no need to focus)
  if (currentTab.id != ScTab.id) {
    await chrome.tabs.update(ScTab.id, { active : true }, () => {});
  } else {
    await queue('open');
  }

  if (!isPopout()) {
    window.close();
  }
  return;
}

function fixedEncoder(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}

function openURL(link) {
  chrome.tabs.create({ url: link }, (tab) => {});
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
  if (localStorage.getItem('theme')) return localStorage.getItem('theme');
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
}

function updateFontSize(px) {
  if (!px) {
    px = localStorage.getItem('font-size');
  } else if (px != localStorage.getItem('font-size')) {
    localStorage.setItem('font-size', px);
  }

  $(':root').css('--font-size', px);
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

function popup(mylink, windowname) {
  chrome.windows.create({
    url: mylink,
    type: 'popup',
    width: 300,
    height: 440,
    focused: true
  });
}

function isPopout() {
  return location.href.includes('p=1');
}

function initKeyboardBinds() {
  $('input,select,textarea').keydown(function(e) {
    e.stopPropagation();
  });
  $('body').keydown(function (e) {
    if (keyReady == false) return true;
    switch (e.keyCode) {
      case 32: { // Space
        queue('toggle').then((val) => {
          update(val);
        });
        return false;
      }
      case 81: { // Q Key
        openSCTab();
        break;
      }
      case 38: { // Arrow Up
        if (e.shiftKey) {
          queue('up').then((val) => {
            update(val);
          });
        }
        break;
      }
      case 40: { // Arrow Down
        if (e.shiftKey) { 
          queue('down').then((val) => {
            update(val);
          });
        }
        break;
      }
      case 77: { // M Key
        queue('mute').then((val) => {
          update(val);
        });
        break;
      }
      case 76: { // L Key
        queue(e.shiftKey ? 'repeat' : 'fav').then((val) => {
          update(val);
        });
        break;
      }
      case 83: { // S Key
        if (!e.shiftKey) return;
        queue('shuffle').then((val) => {
          update(val);
        });
        break;
      }
      case 37: { // Arrow Left
        queue(e.shiftKey ? 'prev' : 'seekb').then((val) => {
            update(val);
        });
        break;
      }
      case 39: { // Arrow Righnt
        queue(e.shiftKey ? 'next' : 'seekf').then((val) => {
            update(val);
        });
        break;
      }
    }
  });
}

function startMarquees() {
  if (!$().marquee) return;
  $('.marquee').bind('finished', () => {
    if (isDuplicationEnabled() == true) {
      $('.marquee').marquee('pause');
      setTimeout(() => {
        $('.marquee').marquee('resume');
      }, getPauseTime());
    } else {
      setTimeout(() => {
        $('.marquee').marquee('pause');
      }, getTextVisibleDuration());
      setTimeout(() => {
        $('.marquee').marquee('resume');
      }, getTextVisibleDuration() + getPauseTime());
    }
  }).marquee({
    direction: 'left', 
    duration: getTextVisibleDuration(),
    pauseOnHover: true,
    startVisible: true,
    pauseOnCycle: true,
    duplicated: isDuplicationEnabled()
  });
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

function areWeInSettingsPage() {
  return location.href.includes('settings.html');
}

function checkDisplayArtwork() {
  let available = Bool( localStorage.getItem('display-artwork') );
  toggleArtwork(available);
  if (areWeInSettingsPage() && available) $('#display-artwork').attr('checked', '');
}

function toggleArtwork(val) {
  if (val == null) return;

  let hidden = (val == false), 
    isCompactInSettingsPage = (areWeInSettingsPage() && localStorage.getItem('compact_in_settings') != null && localStorage.getItem('compact_in_settings') == 'true');
  if (getThemeName() == 'compact' || isCompactInSettingsPage) {
    $('#controller').css('width', hidden ? '250px' : '200px');
    $('#controller').css('height', hidden ? (isCompactInSettingsPage ? '75px' : '65px') : '50px');
    $('.children.marquee').css('padding-left', hidden ? '5px' : '10px');
  }

  // if (hidden) {
  //   $('#artwork').attr('hidden', '')
  // } else {
  //   $('#artwork').removeAttr('hidden')
  // }
  $('#artwork').css('display', val ? 'inline-block' : 'none');
}

function replaceText(text, json) {
  if (!json) json = JSON.parse( sessionStorage.getItem('data') );
  text = text.replace('%title%', json['title']).replace('%artist%', json['artist']).replace('%url%', json['link']);
  return text;
}

var keyReady = false, duplicated = false;
