var ready = false, artworkElem, trackElem, toggleElem, prevElem, nextElem, favElem;

document.addEventListener("DOMContentLoaded", () => {
	init();

	toggleElem.addEventListener("click", () => { toggle(); });
	prevElem.addEventListener("click", () => { queue("prev"); });
	nextElem.addEventListener("click", () => { queue("next"); });
	favElem.addEventListener("click", () => { toggleFav(); });
});

window.onload = () => {
	setInterval(()=> {
		chrome.storage.sync.get(null, (items) => {
			if (items["artwork"] != null && items["artwork"] != artworkElem.src) artworkElem.src = items["artwork"];
			if (items["track"] != null && items["track"] != trackElem.innerText) trackElem.innerText = items["track"];
			if (items["playing"] != null) toggleElem.value = !items["playing"] ? "Play" : "Pause";
			if (items["favorite"] != null) favElem.value = !items["favorite"] ? "Fav" : "unFav";
		});
	}, 500);
	ready = true;
}

function init() {
	artworkElem = document.getElementById("artwork");
	trackElem = document.getElementById("track");
	toggleElem = document.getElementById("toggle");
	prevElem = document.getElementById("prev");
	nextElem = document.getElementById("next");
	favElem = document.getElementById("fav");
}

function queue(request) {
	if (!ready) return;
	request = request.toLowerCase();
	console.log("q: " + request);
	chrome.tabs.query({ active: true, url: "*://soundcloud.com/*" }, (tab) => {
		if (tab.length != 0) chrome.tabs.sendMessage(tab[0].id, request.toLowerCase(), null);
	});
}

function toggleFav() {
	if (favElem == null) return;
	var rString = favElem.value == "Fav" ? "unFav" : "Fav";
	queue(favElem.value = rString);
}

function toggle() {
	if (toggleElem == null) return;
	var rString = toggleElem.value == "Pause" ? "Play" : "Pause";
	queue(toggleElem.value = rString);
}
