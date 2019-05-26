document.addEventListener("DOMContentLoaded", () => {
	init();
	ready = true;
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message["type"] != "update" || message["value"] == null) return;
    var items = message["value"];
    if (json == items) return;
	// if (!ready) return;
	if ((items["artwork"] != null && items["artwork"] != "") && items["artwork"] != artworkElem.src) {
		artworkElem.src = items["artwork"];
	}
	if (items["track"] != null && items["track"] != trackElem.innerText) {
		trackElem.innerText = items["track"];
	}
	if (items["playing"] != null) {
		toggleElem.value = !items["playing"] ? "Play" : "Pause";
	}
	if (items["favorite"] != null) {
		favElem.value = !items["favorite"] ? "Fav" : "unFav";
	}
	if (items["shuffle"] != null) {
		shuffleElem.value = items["shuffle"] ? "Shuffled" : "Shuffle";
	}
	if (items["repeat"] != null) {
		repeatElem.value = "Repeat (" + items["repeat"] + ")";
	}
	if (items["time"] != null) {
		var timeJson = items["time"];
		if ($("#current").text() != timeJson["current"]) {
			$("#current").text(timeJson["current"]);
		}
		if ($("#end").text() != timeJson["end"]) {
			$("#end").text(timeJson["end"]);
		}
	}
	if (items["volume"] != null) {
		$("#volume").text(items["volume"] + " %");
	}
	json = items;
});

// Initialize:
function init() {
	chrome.tabs.query({ url: "*://soundcloud.com/*" }, (results) => {
		if (results.length == 0) {
			ready = false;
			json = {};
			json["artwork"] = "";
			json["track"] = "* Click to Open SoundCloud *";
			json["time"] = null;
			json["volume"] = 0;

			$("#close").remove();
			$("#second br:last-child").remove();
			$("#controller").remove();
			$("hr:first-child").remove();
		}
	});

	$("#version").text("v" + chrome.runtime.getManifest().version);
	registerElements();
	registerEvents();
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

	// 
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
			}
		});
	});
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
			chrome.tabs.sendMessage(results[0].id, jsonRequest, null);
		}
	});
}

function openSCTab() {
	chrome.tabs.query({ url: "*://soundcloud.com/*" }, (results) => {
		if (results.length !== 0) {
			chrome.tabs.update(results[0].id, { active : true }, (tab) => {});
		} else {
			chrome.tabs.create({ url: "https://soundcloud.com" }, (tab) => {});
		}
		// window.close();
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

var ready = false, json = {}, artworkElem, trackElem, toggleElem, prevElem, nextElem, favElem, repeatElem, shuffleElem;
