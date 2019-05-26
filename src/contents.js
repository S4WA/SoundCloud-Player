window.onload = () => {
	setInterval(() => { update(); }, 100);
}

function update() {
	var playing = $(".playControl")[0].title == "Pause current",
		track = $("a.playbackSoundBadge__titleLink")[0].title + " By " + $("a.playbackSoundBadge__lightLink")[0].title,
		artwork = $(".playbackSoundBadge span.sc-artwork").css("background-image").replace("url(\"", "").replace("\")", "").replace("50x50.", "500x500."),
		fav = $(".playControls__soundBadge .sc-button-like")[0].title == "Unlike",
		current = $(".playbackTimeline__timePassed span[aria-hidden]").text(),
		end = $(".playbackTimeline__duration span[aria-hidden]").text(),
		volume = Number($(".volume__sliderWrapper").attr("aria-valuenow"))*100;

	json["track"] = track;
	json["artwork"] = artwork;
	json["playing"] = playing;
	json["favorite"] = fav;
	json["time"]["current"] = current;
	json["time"]["end"] = end;
	json["volume"] = volume;
	post();
}

function post() {
	var requestJson = {};
	requestJson["type"] = "update";
	requestJson["value"] = json;
	chrome.runtime.sendMessage(requestJson);
}

chrome.runtime.onMessage.addListener((request, sender, callback) => {
	// console.log(request);
	switch(request["type"].toLowerCase()) {
		case "play":
		case "pause": {
			$(".playControl.sc-ir.playControls__control.playControls__play")[0].click();
			json["playing"] = !json["playing"];
			post();
			break;
		}
		case "prev": {
			$(".playControls__prev")[0].click();
			break;
		}
		case "next": {
			$(".playControls__next")[0].click();
			break;
		}
		case "unfav":
		case "fav": {
			$(".playbackSoundBadge__like")[0].click();
			json["favorite"] = $(".playbackSoundBadge__like")[0].title == "Unlike";
			post();
			break;
		}
		case "repeat": {
			var btn = $(".repeatControl")[0];
			btn.click();
			json["repeat"] = btn.className.replace("repeatControl sc-ir m-", "").toLowerCase(); // none -> one -> all
			post();
			break;
		}
		case "shuffle": {
			var btn = $(".shuffleControl")[0];
			btn.click();
			json["shuffle"] = btn.className.includes("m-shuffling");
			post();
			break;
		}
		default: {
			break;
		}
	}
});

var json = {
	"playing": false,
	"track": null,
	"artwork": null,
	"favorite": false,
	"shuffle": false,
	"repeat": "none",
	"time": {
		"current": null,
		"end": null
	},
	"volume": 0
};