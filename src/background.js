chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch(msg.text.toLowerCase()) {
    	case "isfirst": {
    		result = sender.tab.id == last.id
			sendResponse(result);
	        break;
		}
	}
});

setInterval(() => {
	chrome.tabs.query({ url: "*://soundcloud.com/*" }, (results) => {
		if (results.length != 0) {
			last = results[0];
		}
	});
}, 500)
last = { "id": -1 };