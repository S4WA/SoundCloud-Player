document.addEventListener("DOMContentLoaded", () => {
	init();
	ready = true;
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

	chrome.tabs.query({ url: "*://soundcloud.com/*" }, (results) => {
		if (results["length"] >= 2) {
			$("body").append( 
				$("<hr></hr>"),
				$("<b>").text("*WARNING* "),
				$("<span>").text("Don't open tab for soundcloud more than 2."),
				$("<br>"),
				$("<span>").text("Track is never show except first tab!")
			)
		}
	});
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
	$("#title").on("click", () => { return false; });

	registerOnClicks();
}

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

	if (items["playlist"] != null && items["playlist"] != json["playlist"]) {
		// console.log(items["playlist"])
	}


	$("#copy").val(items["link"] + (shareSettings["share_with_time"] ? "#t=" + items["time"]["current"] : "") );

	if (shareSettings["share_with_time"] && 
		items["time"]["current"] != json["time"]["current"] && 
		$("#copy")[0].selectionStart != null && 
		$(document.activeElement)[0] == $("#copy")[0]) {
			$("#copy").select();
	}


	$("#title")[0].href = items["link"];


	// Update local json data
	json = items;
	
	// Controller
	if ($("#controller").is(":not(:visible)")) {
		for (var i in hideList) {
			$(hideList[i]).show();
		}
	}
});

var ready = false, json = {}, 
	artworkElem, trackElem, toggleElem, prevElem, nextElem, favElem, repeatElem, shuffleElem,
	hideList = ["#close", "#second br:last-child", "#controller", "hr:first", "#share_btn"],
	shareSettings = {
		"share_with_time": false
	};
