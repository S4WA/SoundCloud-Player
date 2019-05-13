var json = {
	"playing": false,
	"track": null,
	"artwork": null,
	"queue": null
};

window.onload = () => {
	var ready = false;
	setInterval(()=> {
		ready = (document.getElementsByClassName("playControls__wrapper l-container l-fullwidth").length != 0);
		if (ready) {
			chrome.storage.sync.set(json, () => {});
		}
	}, 100);
}

/*
	format: json
	value: default

	{
		"playing": false,
		"track": null, // or "track-name by someone"
		"artwork": null, // or "img url"
		"queue": null // or "next / prev"
	}
*/