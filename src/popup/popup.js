document.addEventListener("DOMContentLoaded", () => {
	init();
	ready = true;
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message["type"] != "update" || message["value"] == null) return;
    
    var items = message["value"];
    if (json == items) return;

    // Update element texts
	/* if (!ready) return; */

	if ((items["artwork"] != null && items["artwork"] != "") && items["artwork"] != $(artworkElem).css("background-image")) {
		$(artworkElem).css("background-image", items["artwork"]);
	}
	if (items["track"] != null &&
		items["track"] != $(trackElem).text()) {

		$(trackElem).text(items["track"]);
	}
	if (items["playing"] != null &&
		items["playing"] != json["playing"]) {

		toggleElem.value = !items["playing"] ? "Play" : "Pause";
	}
	if (items["favorite"] != null &&
		items["favorite"] != json["favorite"]) {

		favElem.value = !items["favorite"] ? "Fav" : "unFav";
	}
	if (items["shuffle"] != null &&
		items["shuffle"] != json["shuffle"]) {

		shuffleElem.value = items["shuffle"] ? "Shuffled" : "Shuffle";
	}
	if (items["repeat"] != null &&
		items["repeat"] != json["repeat"]) {

		repeatElem.value = "Repeat (" + items["repeat"] + ")";
	}


	if (items["volume"] != null &&
		items["volume"] != json["volume"]) {

		$("#volume").text(Math.floor(items["volume"]) + " %");
	}
	if (items["mute"] != null &&
		items["mute"] != json["mute"]) {

		items["mute"] ? $("#volume-icon").addClass("muted") : $("#volume-icon").removeClass("muted");
	}

	if (items["time"] != null &&
		items["time"] != json["time"]) {

		var timeJson = items["time"];
		if ($("#current").text() != timeJson["current"]) {
			$("#current").text(timeJson["current"]);
			$("#share_current_time").val(timeJson["current"]);
		}
		if ($("#end").text() != timeJson["end"]) {
			$("#end").text(timeJson["end"]);
		}
	}


	$("#copy").val(items["link"] + (shareSettings["share_with_time"] ? "#t=" + items["time"]["current"] : "") );

	// Update local json data
	json = items;
	
	// Controller
	if ($("#controller").is(":not(:visible)")) {
		for (var i in hideList) {
			$(hideList[i]).show();
		}
	}
});

// Initialize:
function init() {
	chrome.tabs.query({ url: "*://soundcloud.com/*" }, (results) => {
		if (results.length == 0) {
			ready = false;
			json = {};

			for (var i in hideList) {
				$(hideList[i]).hide();
			}
		} else {
			for (var i in hideList) {
				$(hideList[i]).show();
			}
		}
	});

	$("#version").text("v" + chrome.runtime.getManifest().version);
	registerElements();
	registerEvents();
}

function registerElements() {
	artworkElem = $("#artwork")[0];
	trackElem = $("#track")[0];
	toggleElem = $("#toggle")[0];
	prevElem = $("#prev")[0];
	nextElem = $("#next")[0];
	favElem = $("#fav")[0];
	repeatElem = $("#repeat")[0];
	shuffleElem = $("#shuffle")[0];
}

function registerEvents() {
	// controller
	$(toggleElem).on("click", () => { toggle(); });
	$(prevElem).on("click", () => { queue("prev"); });
	$(nextElem).on("click", () => { queue("next"); });
	$(favElem).on("click", () => { toggleFav(); });
	$(trackElem).on("click", () => { openSCTab(); });
	$(artworkElem).on("click", () => { openSCTab(); });
	$(repeatElem).on("click", () => { repeat(); });
	$(shuffleElem).on("click", () => { queue("shuffle"); });

	$("#volume-icon").on("click", () => { queue("mute"); });

	/*$(".marquee").hover(
		() => {
			$(".marquee").children().toggleClass("marquee-inner");
		},
		() => {
			$(".marquee").children().toggleClass("marquee-inner");
		}
	);*/

	// Link buttons
	$("#store").on("click", () => {
		openURL("https://chrome.google.com/webstore/detail/soundcloud-player/oackhlcggjandamnkggpfhfjbnecefej");
	});
	$("#drip").on("click", () => {
		openURL("https://twitter.com/AkibaKaede");
	});
	$("#close").on("click", () => {
		chrome.tabs.query({ url: "*://soundcloud.com/*" }, (results) => {
			if (results.length != 0) {
				 chrome.tabs.remove(results[0].id, () => {});
				 window.close();
			}
		});
	});

	// Share
	$("#share_btn").on("click", () => {
		var share = $("#share");
		// share.is(":visible") ? share.slideUp() : share.slideDown();
		share.is(":visible") ? share.hide() : share.show();
	});

	$("#share_with_time").on("input", () => {
		shareSettings["share_with_time"] = $("#share_with_time").prop("checked");
	});

	// Social
	var socials = ["Twitter", "Facebook", "Tumblr", "Email"];
	for (var i in socials) with({i:i}) {
		var elem = $("#social ." + socials[i].toLowerCase());
		elem.on("click", () => {
			openURL(shareLink(socials[i]));
		});
		elem.attr("title", "Click to Share this on " + socials[i])
	}
	$("#social .clipboard").on("click", () => {
		copyToClipboard($("#track").text() + " " + $("#copy").val());
	})
}

// Utils:
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
			chrome.tabs.update(results[0].id, { active : true }, (tab) => {});
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
	chrome.tabs.create({ url: link}, (tab) => {});
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
	var input = document.createElement("input");
	input.style.position = "fixed";
	input.style.opacity = 0;
	input.value = text;
	document.body.appendChild(input);
	input.select();
	document.execCommand("Copy");
	document.body.removeChild(input);
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

var ready = false, json = {}, 
	artworkElem, trackElem, toggleElem, prevElem, nextElem, favElem, repeatElem, shuffleElem,
	hideList = ["#close", "#second br:last-child", "#controller", "hr:first", "#share_btn"],
	shareSettings = {
		"share_with_time": false
	};
