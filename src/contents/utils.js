function isPlaying() {
  var cls = ".playControl";
  return $(cls).length != 0 ? $(cls)[0].title == "Pause current" : false;
}

function getTitle() {
  return $("a.playbackSoundBadge__titleLink")[0].title;
}

function getArtist() {
  return $("a.playbackSoundBadge__lightLink")[0].title;
}

function getArtwork() {
  return $(".playbackSoundBadge span.sc-artwork").css("background-image");
}

function getLink() {
  var cls = ".playbackSoundBadge__titleLink.sc-truncate";
  return $(cls).length != 0 ? $(cls)[0].href : null;
}

function isLiked() {
  var cls = ".playControls__soundBadge .sc-button-like";
  return $(cls).length != 0 ? $(cls)[0].title == "Unlike" : false;
}

function getCurrentTime() {
  return $(".playbackTimeline__timePassed span[aria-hidden]").text();
}

function getEndTime() {
  return $(".playbackTimeline__duration span[aria-hidden]").text();
}

function getVolume() {
  return Number($(".volume__sliderWrapper").attr("aria-valuenow"))*100;
}

function isMuted() {
  var cls = ".volume";
  return $(cls).length != 0 ? $(cls)[0].className.includes("muted") : false;
}

function getRepeatMode() {
  return $(".repeatControl")[0].className.replace("repeatControl sc-ir m-", "").toLowerCase();
}

function isShuffling() {
  return $(".shuffleControl")[0].className.includes("m-shuffling");
}

function volumeDown() {
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "ArrowDown",
      keyCode: 40, 
      code: "ArrowDown",
      which: 40,
      shiftKey: true
    })
  );
}

function volumeUp() {
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "ArrowUp",
      keyCode: 38, 
      code: "ArrowUp",
      which: 38,
      shiftKey: true
    })
  );
}

function seekBack() {
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "ArrowLeft",
      keyCode: 37, 
      code: "ArrowLeft",
      which: 37
    })
  );
}

function seekForward() {
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "ArrowRight",
      keyCode: 39, 
      code: "ArrowRight",
      which: 39
    })
  );
}