var artworkElem, trackElem, toggleElem, prevElem, nextElem;
window.onload = () => {
	artworkElem = document.getElementById("artwork");
	trackElem = document.getElementById("track");
	toggleElem = document.getElementById("toggle");
	prevElem = document.getElementById("prev");
	nextElem = document.getElementById("next");

	toggleElem.addEventListener("click", toggle());
	prevElem.addEventListener("click", queue("prev"));
	nextElem.addEventListener("click", queue("next"));

	setInterval(()=> {
		chrome.storage.sync.get(null, (items) => {
			if (items["artwork"] != null && items["artwork"] != artworkElem.src) artworkElem.src = items["artwork"];
			if (items["track"] != null && items["track"] != trackElem.innerText) trackElem.innerText = items["track"];
			if (items["playing"] != null) toggleElem.value = !items["playing"] ? "Play" : "Pause";
		});
	}, 500);
}

function queue(request) {
	chrome.tabs.query({active: true, url: "*://soundcloud.com"}, (tab) => {
		chrome.tabs.sendMessage(tab[0].id, request.toLowerCase(), null);
	});
}

function toggle() {
	if (toggleElem == null) return;
	var rString = toggleElem.value == "Pause" ? "Play" : "Pause";
	queue(toggleElem.value);
	toggleElem.value = rString;
}
