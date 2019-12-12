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
				console.log(results[0].id == tab[0].id);
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

function toggleFav() {
	if (favElem == null) return;
	var string = favElem.value == "Fav" ? "unFav" : "Fav";
	queue(favElem.value = string);
}

function repeat() {
	if (json["repeat"] == null || repeatElem == null) return;
	queue("repeat");
	repeatElem.value = "Repeat (" + json["repeat"] + ")";
}

function toggle() {
	if (toggleElem == null) return;
	var string = toggleElem.value == "Pause" ? "Play" : "Pause";
	queue(toggleElem.value = string);
}

function copyToClipboard(text) {
	var input = $("<input>"), style = {
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

// Share link
function shareLink(social) {
	switch(social.toLowerCase()) {
		case "twitter": {
			return toShareLink(
				"twitter",
				$("#track").text() + " " + $("#copy").val()
			);
		}
		case "facebook": {
			return toShareLink(
				"facebook",
				$("#copy").val()
			);
		}
		case "tumblr": {
			return toShareLink(
				"tumblr",
				$("#track").text(),
				$("#copy").val()
			);
		}
		case "email": {
			return toShareLink(
				"email",
				$("#track").text(),
				$("#copy").val()
			);
		}
		default: {
			return null;
		}
	}
}

function toShareLink(social, text, url) {
	text = fixedEncoder(text);
	url = fixedEncoder(url);
	switch(social.toLowerCase()) {
		case "twitter": {
			return "https://twitter.com/intent/tweet?text=" + text + "&hashtags=NowPlaying";
		}
		case "facebook": {
			return "https://www.facebook.com/sharer/sharer.php?u=" + (!text ? url : text);
		}
		case "tumblr": {
			return "https://www.tumblr.com/widgets/share/tool?canonicalUrl=" + url + 
				"&posttype=audio" + 
				"&tags=SoundCloud%2Cmusic%2CNowPlaying" + 
				"&caption=" + text;
		}
		case "email": {
			return "mailto:?subject=" + text + "&body=" + url;
		}
		default: {
			return null;
		}
	}
}