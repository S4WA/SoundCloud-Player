function queue(request, value) {
  if (!ready) return;
  request = request.toLowerCase();
  chrome.tabs.query({ url: "*://soundcloud.com/*" }, (results) => {
    if (results.length != 0) {
      var jsonRequest = {}
      jsonRequest["type"] = request;
      if (!value) jsonRequest["value"] = value;
      return chrome.tabs.sendMessage(results[0].id, jsonRequest, null);
    }
  });
}

function openSCTab() {
  chrome.tabs.query({ url: "*://soundcloud.com/*" }, (results) => {
    if (results.length !== 0) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
        if (results[0].id == tab[0].id) {
          queue("open");
        } else {
          chrome.tabs.update(results[0].id, { active : true }, () => {});
        }
      })
    } else {
      chrome.tabs.create({ url: "https://soundcloud.com" }, (tab) => {});
      window.close();
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
function changeColor(color) {
  settings["themecolor"] = color;
  localStorage.setItem("themecolor", color);
  $(':root').css("--theme-color", "#" + color);
}
