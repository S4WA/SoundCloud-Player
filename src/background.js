chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.text == null) return false;
  switch(msg.text.toLowerCase()) {
    case "isfirst": {
      sendResponse(sender.tab.id == last.id);
      break;
    }
  }
  return true;
});

setInterval(() => {
  chrome.tabs.query({ url: "*://soundcloud.com/*" }, (results) => {
    if (results.length != 0) {
      last = results[0];
    }
  });
}, 500)
last = { "id": -1 };