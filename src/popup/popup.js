var enabled = false, novid = false;
var input, input2, saveBtn;
window.onload = () => {
	chrome.storage.sync.get(null, (items) => {
		if (items["enabled"] != null) enabled = items["enabled"];
		if (items["novid"] != null) novid = items["novid"];
	});
	input = document.getElementById("enabled");
	input2 = document.getElementById("novid");
	saveBtn = document.getElementById("saveBtn");

	saveBtn.addEventListener("click", save);
	setTimeout(() => {
		input.checked = enabled;
		input2.checked = novid;
	}, 10);
}

function save() {
	enabled = input.checked;
	novid = input2.checked;
	var json = {"enabled": enabled, "novid": novid};
	chrome.storage.sync.set(json, () => {});
}