function registerOnClicks() {
	$("#volume-icon").on("click", () => { queue("mute"); });
	$("#playlist_btn").on("click", () => { queue("playlist"); });

	// Link buttons
	$("#store").on("click", () => {
		openURL("https://chrome.google.com/webstore/detail/soundcloud-player/oackhlcggjandamnkggpfhfjbnecefej");
	});
	$("#discord").on("click", () => {
		openURL("https://discord.gg/R9R6fdm");
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
	var socials = ["Twitter", "Facebook", "Tumblr", "Email"];
	for (var i in socials) with ({i:i}) {
		var elem = $( "#social ." + socials[i].toLowerCase() );
		elem.on("click", () => {
			openURL( shareLink(socials[i]) );
		});
		elem.attr("title", "Share on " + socials[i])
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