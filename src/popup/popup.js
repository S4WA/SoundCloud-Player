var ready = false, json, artworkElem, trackElem, toggleElem, prevElem, nextElem, favElem, repeatElem, shuffleElem;

document.addEventListener("DOMContentLoaded", () => {
	init();

	toggleElem.addEventListener("click", () => { toggle(); });
	prevElem.addEventListener("click", () => { queue("prev"); });
	nextElem.addEventListener("click", () => { queue("next"); });
	favElem.addEventListener("click", () => { toggleFav(); });
	trackElem.addEventListener("click", () => { openSCTab(); });
	repeatElem.addEventListener("click", () => { repeat(); });
	shuffleElem.addEventListener("click", () => { queue("shuffle"); });
});

window.onload = () => {
	setInterval(() => {
		chrome.storage.sync.get(null, (items) => {
			if (items["artwork"] != null && items["artwork"] != artworkElem.src) artworkElem.src = items["artwork"];
			if (items["track"] != null && items["track"] != trackElem.innerText) trackElem.innerText = items["track"];
			if (items["playing"] != null) toggleElem.value = !items["playing"] ? "Play" : "Pause";
			if (items["favorite"] != null) favElem.value = !items["favorite"] ? "Fav" : "unFav";
			if (items["shuffle"] != null) shuffleElem.value = items["shuffle"] ? "Shuffled" : "Shuffle";
			if (items["repeat"] != null) repeatElem.value = items["repeat"] == "none" ? "Repeat" : "Repeat (" + items["repeat"] + ")";
			json = items;
		});
	}, 500);
	ready = true;
}

function init() {
	chrome.storage.sync.get(null, (items) => {
		json = items;
	});
	chrome.tabs.query({ url: "*://soundcloud.com/*" }, (results) => {
		if (results.length == 0) {
			json["artwork"] = "";
			json["track"] = "* none *";
			chrome.storage.sync.set(json, null);
		}
	});

	document.getElementById("version").innerText = "v" + chrome.runtime.getManifest().version;
	artworkElem = document.getElementById("artwork");
	trackElem = document.getElementById("track");
	toggleElem = document.getElementById("toggle");
	prevElem = document.getElementById("prev");
	nextElem = document.getElementById("next");
	favElem = document.getElementById("fav");
	repeatElem = document.getElementById("repeat");
	shuffleElem = document.getElementById("shuffle");
}

function queue(request) {
	if (!ready) return;
	request = request.toLowerCase();
	// console.log("q: " + request);
	chrome.tabs.query({ url: "*://soundcloud.com/*" }, (results) => {
		if (results.length != 0) chrome.tabs.sendMessage(results[0].id, request.toLowerCase(), null);
	});
}

function openSCTab() {
	chrome.tabs.query({ url: "*://soundcloud.com/*" }, (results) => {
		if (results.length !== 0) {
			chrome.tabs.update(results[0].id, { active : true }, (tab) => {});
		} else {
			chrome.tabs.create({ url: "https://soundcloud.com" }, (tab) => {});
		}
	});
}

function toggleFav() {
	if (favElem == null) return;
	var rString = favElem.value == "Fav" ? "unFav" : "Fav";
	queue(favElem.value = rString);
}

function repeat() {
	if (repeatElem == null) return;
	repeatElem.value = (json["repeat"] == null && json["repeat"] != "none" ? "Repeat" : "Repeat (" + json["repeat"] + ")");
	queue("repeat");
}

function toggle() {
	if (toggleElem == null) return;
	var rString = toggleElem.value == "Pause" ? "Play" : "Pause";
	queue(toggleElem.value = rString);
}
