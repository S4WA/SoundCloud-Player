window.onload = () => {
  console.log("[SoundCloud Player] Hi.")
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
  // if (chrome.extension.getViews().length == 0) return;

  let requestJson = {};
  requestJson["type"] = "update";
  requestJson["value"] = json;
  chrome.runtime.sendMessage(requestJson);

  // delete json; // Do you think it's wrong?
}

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  // console.log(request);
  switch(request["type"].toLowerCase()) {
    case "play":
    case "pause": // TODO pause toggle
    case "toggle": {
      let elem = $(".playControl.sc-ir.playControls__control.playControls__play")[0];
      elem.click();
      json['playing'] = elem.title.includes('Pause');
      post
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
    case "down": {
      volumeDown();
      break;
    }
    case "up": {
      volumeUp();
      break;
    }
    case 'seekb': {
      seekBack();
      break;
    }
    case 'seekf': {
      seekForward();
      break;
    }

    // case "playlist": {
    //   var array = [];
    //   $(".queue__itemsContainer .queueItemView__username").each(function( index ) {
    //     array[index] = {};
    //     array[index]["artist"] = $(this).text();
    //     array[index]["track"] = $(this).find(".queueItemView__title").text();
    //     array[index]["artwork"] = $(this).find(".image__full").css("background-image");
    //   });
    //   $(".queue__itemsContainer .queueItemView__title").each(function( index ) {
    //     array[index]["track"] = $(this).text();
    //     array[index]["artwork"] = $(this).find(".image__full").css("background-image");
    //   });
    //   $(".queue__itemsContainer .image__full").each(function( index ) {
    //     array[index]["artwork"] = $(this).css("background-image");
    //   });
    //   chrome.runtime.sendMessage(array);
    //   break;
    // }

    // case "playlist-old": {
      // $(".queue__itemsContainer").each(function( index ) {
      //     array[index] = {};
      //     array[index]["artist"] = $(this).find(".queueItemView__username").text();
      //     array[index]["track"] = $(this).find(".queueItemView__title").text();
      //     array[index]["artwork"] = $(this).find(".image__full").css("background-image");
      //     console.log(array[index]);
      // });
    // }
    default: {
      break;
    }
  }
  // if you put 'return true;' here, it bugs out. artwork, title and other data wont show up on popup.
  // return true;
});

// function strDel(str, index, chr) {
//   if (index > str.length - 1) return str;
//   return str.substr(0, index) + chr + str.substr(index + 1);
// }

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