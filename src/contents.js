var json = {
	"playing": false,
	"track": null,
	"artwork": null,
	"favorite": false,
	"shuffle": false,
	"repeat": "none"
};

window.onload = () => {
	var ready = false;
	setInterval(()=> {
		ready = (document.getElementsByClassName("playControls__wrapper l-container l-fullwidth").length != 0);
		var playing = document.getElementsByClassName("playControl sc-ir playControls__control playControls__play")[0].title == "Pause current" /* document.getElementsByClassName("playControl sc-ir playControls__control playControls__play").length != 0 */,
			track = document.getElementsByClassName("playbackSoundBadge__title")[0].children[0].title + " By " + document.getElementsByClassName("playbackSoundBadge__lightLink sc-link-light sc-truncate")[0].title,
			artwork = document.getElementsByClassName("playbackSoundBadge")[0].children[0].children[0].children[0].style.backgroundImage.replace("url(\"", "").replace("\")", "").replace("50x50.", "500x500."),
			fav = document.getElementsByClassName("sc-button-like playbackSoundBadge__like sc-button sc-button-small sc-button-icon sc-button-responsive")[0].title == "Unlike";
		if (ready && json["track"] != track) {
			json["track"] = track;
			json["artwork"] = artwork;
			post();
		}
		if (json["playing"] != playing) {
			json["playing"] = playing;
			post();
		}
		if (json["favorite"] != fav) {
			json["favorite"] = fav;
			post();
		}
	}, 500);
}

function post() {
	chrome.storage.sync.set(json, null);
}

chrome.runtime.onMessage.addListener((request, sender, callback) => {
	// console.log(request);
	switch(request.toLowerCase()) {
		case "play":
		case "pause": {
			// console.log("toggle("+request+")");
			document.getElementsByClassName("playControl sc-ir playControls__control playControls__play")[0].click();
			json["playing"] = !json["playing"];
			post();
			break;
		}
		case "prev": {
			// console.log("prev");
			document.getElementsByClassName("skipControl sc-ir playControls__control playControls__prev skipControl__previous")[0].click();
			break;
		}
		case "next": {
			// console.log("next");
			document.getElementsByClassName("skipControl sc-ir playControls__control playControls__next skipControl__next")[0].click();
			break;
		}
		case "unfav":
		case "fav": {
			// console.log("fav");
			document.getElementsByClassName("sc-button-like playbackSoundBadge__like sc-button sc-button-small sc-button-icon sc-button-responsive")[0].click();
			json["favorite"] = document.getElementsByClassName("sc-button-like playbackSoundBadge__like sc-button sc-button-small sc-button-icon sc-button-responsive")[0].title == "Unlike";
			post();
			break;
		}
		case "repeat": {
			var btn = document.getElementsByClassName("repeatControl")[0];
			btn.click();
			json["repeat"] = btn.className.replace("repeatControl sc-ir m-", "").toLowerCase(); // none -> one -> all
			post();
			break;
		}
		case "shuffle": {
			var btn = document.getElementsByClassName("shuffleControl")[0];
			btn.click();
			json["shuffle"] = btn.className.includes("m-shuffling");
			post();
			break;
		}
		default: {
			// console.log("defall");
			break;
		}
	}
});