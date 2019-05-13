var json = {
	"playing": false,
	"track": null,
	"artwork": null
};

window.onload = () => {
	var ready = false;
	setInterval(()=> {
		ready = (document.getElementsByClassName("playControls__wrapper l-container l-fullwidth").length != 0);
		if (ready) {
			// send
			json["playing"] = document.getElementsByClassName("playControl sc-ir playControls__control playControls__play").length != 0;
			json["track"] = document.title.replace("▶ ", "").replace(" | Free Listening on SoundCloud", "");
			json["artwork"] = document.getElementsByClassName("playbackSoundBadge")[0].children[0].children[0].children[0].style.backgroundImage.replace("url(\"", "").replace("\")", "").replace("50x50.", "500x500.");

			chrome.storage.sync.set(json, null);
		}
	}, 500);
}

chrome.runtime.onMessage.addListener((request, sender, callback) => {
	console.log(request);
	switch(request.toLowerCase()) {
		case "play":
		case "pause": {
			document.getElementsByClassName("playControl sc-ir playControls__control playControls__play")[0].click();
			break;
		}
		case "prev": {
			document.getElementsByClassName("skipControl sc-ir playControls__control playControls__prev skipControl__previous")[0].click();
			break;
		}
		case "next": {
			document.getElementsByClassName("skipControl sc-ir playControls__control playControls__next skipControl__next")[0].click();
			break;
		}
		default: {
			break;
		}
	}
	sendResponse(true);
});