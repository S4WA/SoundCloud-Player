function registerOnClicks() {
	$("#volume-icon").on("click", () => { queue("mute"); });
	$("#playlist_btn").on("click", () => { queue("playlist"); });

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
	var socials = ["twitter", "facebook", "tumblr", "email"];
	for (var i in socials) with ({i:i}) {
		var elem = $( "#social ." + socials[i] );
		elem.on("click", () => {
			openURL( shareLink(socials[i]) );
		});
		elem.attr("title", "Click to Share this on " + socials[i])
	}

	$("#social .clipboard").on("click", () => {
		copyToClipboard($("#track").text() + " " + $("#copy").val());
	})

	/*$(".marquee").hover(
		() => {
			$(".marquee").children().toggleClass("marquee-inner");
		},
		() => {
			$(".marquee").children().toggleClass("marquee-inner");
		}
	);*/
}