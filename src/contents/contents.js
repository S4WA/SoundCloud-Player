window.onload = () => {
  setInterval(() => {
    try {
      chrome.runtime.sendMessage({ text: "isfirst" }, isFirst => {
        if (isFirst) update();
      });
    } catch (err) {
      // 拡張機能がリロードされた時 contents.jsも合わせてリロードする
      if (!reload) {
        location.reload();
        reload = true;
      }
    }
  }, 100);
}

function update() {
  let artwork = getArtwork();
  if (artwork != null && artwork.includes("50x50.")) artwork = artwork.replace("50x50.", "500x500.");

  json["title"] = getTitle();
  json["artist"] = getArtist();
  json["artwork"] = artwork;
  json["link"] = getLink();
  json["playing"] = isPlaying();
  json["favorite"] = isLiked();
  json["time"]["current"] = getCurrentTime();
  json["time"]["end"] = getEndTime();
  json["volume"] = getVolume();
  json["mute"] = isMuted();
  json["repeat"] = getRepeatMode();
  json["shuffle"] = isShuffling();

  post();
}

function post() {
  if (reload) return;

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
    // 
    case "unfav":
    case "fav": {
      let btn = $(".playbackSoundBadge__like")[0];
      btn.click();
      json["favorite"] = btn.title == "Unlike";
      post();
      break;
    }
    case "repeat": {
      let btn = $(".repeatControl")[0];
      btn.click();
      json["repeat"] = getRepeatMode(); // none -> one -> all
      post();
      break;
    }
    case "shuffle": {
      let btn = $(".shuffleControl")[0];
      btn.click();
      json["shuffle"] = isShuffling();
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
    //   $(".playbackSoundBadge__queueCircle")[0].click();
    //   var array = [], list = $(".queueItemView.m-active");
    //   for (var i in list) {
    //     data = {};
    //     data["artist"] = $(list[i]).find(".queueItemView__meta .queueItemView__username").text();
    //     data["track"] = $(list[i]).find(".queueItemView__title .sc-link-dark").text();
    //     data["artwork"] = $(list[i]).find(".sc-artwork.image__full").css("background-image");
    //     if (data["artist"] != "" && data["track"] != "") {
    //       array.push(data);
    //     }
    //   }
    //   if (json["playlist"] != array) {
    //     json["playlist"] = array;
    //     post();
    //   }
    //   break;
    // }
    default: {
      break;
    }
  }
});

var json = {
  "playing": false,
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