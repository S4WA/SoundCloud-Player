window.onload = () => {
	setInterval(() => {
		try {
			chrome.runtime.sendMessage({ text: "isfirst" }, isFirst => {
				if (isFirst) update();
			});
		} catch (err) {
			location.reload();
			reload = true;
		}
	}, 100);
}

function update() {
	var playing = isPlaying(), track = getTrack(), artwork = getArtwork(), link = getLink(),
		fav = isLiked(), current = getCurrentTime(), end = getEndTime(), volume = getVolume(), mute = isMuted();

	if (artwork != null && artwork.includes("50x50.")) artwork = artwork.replace("50x50.", "500x500.");

	json["track"] = track;
	json["artwork"] = artwork;
	json["link"] = link;
	json["playing"] = playing;
	json["favorite"] = fav;
	json["time"]["current"] = current;
	json["time"]["end"] = end;
	json["volume"] = volume;
	json["mute"] = mute;

	post();
}

function post() {
	if (reload) return;

	try {
		var requestJson = {};
		requestJson["type"] = "update";
		requestJson["value"] = json;
		chrome.runtime.sendMessage(requestJson);
	} catch (err) {
		location.reload();
		reload = true;
		// 拡張機能がリロードされた時 contents.jsも合わせてリロードする
	}
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
		// 
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
		case "mute":
		case "unmute": {
			$(".volume button[type='button']")[0].click();
			json["mute"] = $(".volume")[0].className.includes("muted");
			post();
			break;
		}
		case "open": {
			$(".playbackSoundBadge__titleLink.sc-truncate")[0].click();
			break;
		}
		// case "playlist": {
		// 	$(".playbackSoundBadge__queueCircle")[0].click();
		// 	var array = [], list = $(".queueItemView.m-active");
		// 	for (var i in list) {
		// 		data = {};
		// 		data["artist"] = $(list[i]).find(".queueItemView__meta .queueItemView__username").text();
		// 		data["track"] = $(list[i]).find(".queueItemView__title .sc-link-dark").text();
		// 		data["artwork"] = $(list[i]).find(".sc-artwork.image__full").css("background-image");
		// 		if (data["artist"] != "" && data["track"] != "") {
		// 			array.push(data);
		// 		}
		// 	}
		// 	if (json["playlist"] != array) {
		// 		json["playlist"] = array;
		// 		post();
		// 	}
		// 	break;
		// }
		default: {
			break;
		}
	}
});

var json = {
	"playing": false,
	"track": null,
	"artwork": null,
	"link": null,
	"favorite": false,
	"shuffle": false,
	"repeat": "none",
	"time": {
		"current": null,
		"end": null
	},
	"volume": 0,
	"mute": false
	// , "playlist": []
}, reload = false;