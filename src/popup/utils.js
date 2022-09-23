function queue(request, value) {
  if (!ready) return;
  request = String(request).toLowerCase();
  chrome.tabs.query({ url: "*://soundcloud.com/*" }, (results) => {
    if (results.length != 0) {
      var jsonRequest = {}
      jsonRequest["type"] = request;
      if (value) jsonRequest["value"] = value;
      return chrome.tabs.sendMessage(results[0].id, jsonRequest, null);
    }
  });
}


function openSCTab() {
  chrome.tabs.query({ url: "*://soundcloud.com/*" }, (results) => {
    if (results.length !== 0) {
    // Check SoundCloud Tab
      chrome.tabs.query({ active: true }, (tab) => {        
        if (results[0].id == tab[0].id) {
          // If SoundCloud Tab is focused already then click to the current song
          queue("open");
        } else {
          // If not, focus to the tab
          chrome.tabs.update(results[0].id, { active : true }, () => {
            if (results[0].windowId != tab[0].windowId) {
              chrome.windows.update(results[0].windowId, { focused : true }, () => {
                // window.close();
              });
            }
          });
        }
      })
    } else {
      // If there was no SoundCloud tab, Create one
      chrome.tabs.create({ url: "https://soundcloud.com" }, (tab) => {});
      // window.close();
    }
  });
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
  var input = $("<input>"), 
    style = {
      "position": "fixed",
      "opacity": 0
    };

  input.css(style);
  input.val(text);

  $("body").append(input);

  input.select();
  document.execCommand("Copy");

  input.remove();
};

function Bool(string) {
  return string.toLowerCase() == "true";
}

function isJson(string) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

// Settings
function updateThemeColor(color) {
  if (!color) {
    color = localStorage.getItem("themecolor");
  }
  if (color != localStorage.getItem("themecolor")){
    localStorage.setItem("themecolor", color);
  }
  $(':root').css("--theme-color", color);
}

function updateBGcolor(color) {
  if (!color) {
    color = localStorage.getItem("bgcolor");
  }
  if (color != localStorage.getItem("bgcolor")){
    localStorage.setItem("bgcolor", color);
  }
  $(':root').css("--bg-color", color);
}

function updateFont(font) {
  if (!font) {
    font = localStorage.getItem("font");
  } else if (font != localStorage.getItem("font")){
    localStorage.setItem("font", font);
  }
  // $("*").css("font-family", font);
  $(":root").css("--custom-font", font);
}

function toggleDarkmode() {
  darkmode(dark =! dark);
}

function darkmode(val) {
  if (val == null) return;
  $("body").attr("dark", val);
  $("#toggle_darkmode").attr("dark", val); // this attr is for the icons 
  localStorage.setItem("darkmode", val);
  return val;
}

function popup(mylink, windowname) {
  chrome.windows.create({
    url: mylink,
    type: "popup",
    width: 300,
    height: 440,
    focused: true
  });
}

function isPopout() {
  return location.href.includes("p=1");
}

function initKeyboardBinds() {
  $('input,select,textarea').keydown(function(e) {
    e.stopPropagation();
  });
  $('body').keydown(function (e) {
    if (keyReady == false) return true;
    switch (e.keyCode) {
      case 32: { // space
        queue('toggle');
        return false;
      }
      case 38: { // up arrow
        if (e.shiftKey) queue('up');
        break;
      }
      case 40: { // down arrow
        if (e.shiftKey) queue('down');
        break;
      }
      case 77: { // m key
        queue('mute');
        break;
      }
      case 37: {
        queue(e.shiftKey ? 'prev' : 'seekb');
        break;
      }
      case 39: {
        queue(e.shiftKey ? 'next' : 'seekf');
        break;
      }
    }
  });
}

function startMarquees() {
  if (!$().marquee) return;
  $('.marquee').bind('finished', () => {
    $('.marquee').marquee('pause');
    setTimeout(() => {
      $('.marquee').marquee('resume');
    }, getPauseTime());
  }).marquee({
    direction: 'left', 
    duration: getTextVisibleDuration(),
    pauseOnHover: true,
    startVisible: true,
    duplicated: true
  });
}

function getTextVisibleDuration() {
  if (localStorage.getItem('duration')) return localStorage.getItem('duration');
  return 5000;
}

function getPauseTime() {
  if (localStorage.getItem('pause')) return localStorage.getItem('pause');
  return 5000;
}

var keyReady = false;
var marqueeTimer;
