window.onload = (async() => {
  (function() {
    const prefix = "[SoundCloud Player]";
    for (const m of ["log", "warn", "error", "info", "debug"]) {
      const orig = console[m];
      console[m] = orig.bind(console, prefix);
    }
  })();

  console.log("Hi.");

  // Check if extension is reloaded
  setInterval(async() => {
    try {
      let shit = await chrome.runtime.getManifest();
    } catch {
      // if so -> reload content.js but it can only reload in once
      if (reloading == false) {
        location.reload();
        reloading = true;
        console.info('reloading...');
      }
    }
  }, 10000);
});

async function update() {
  json['title'] = getTitle();
  json['artist'] = getArtist();
  json['artwork'] = getArtwork();
  json['link'] = getLink();
  json['playing'] = isPlaying();
  json['favorite'] = isLiked();
  json['time']['current'] = getCurrentTime();
  json['time']['end'] = getEndTime();
  json['volume'] = getVolume();
  json['mute'] = isMuted();
  json['repeat'] = getRepeatMode();
  json['shuffle'] = isShuffling();
  json['following'] = isFollowing();
  json['progress'] = getProgress();
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // Debug:
  // if (request.type != 'request-data') console.log('received:', request);

  let response = {};

  switch (request.type) {
    case 'request-data': { // transfer the whole data
      if (getTitle() == null) return; // track null = return.
      update().then(() => {
        sendResponse(json);
      });
      break;
    }
    case 'smart-request-data': { // minimal data transfer
      if (getTitle() == null) return;
      response = {};

      const current = {
        title: getTitle(),
        playing: isPlaying(),
        favorite: isLiked(),
        volume: getVolume(),
        mute: isMuted(),
        repeat: getRepeatMode(),
        shuffle: isShuffling(),
        progress: getProgress(),
        time: {
          current: getCurrentTime(),
          end: getEndTime()
        }
      };

      if (current.title !== json.title) {
        update().then(() => {
          sendResponse(json);
        });
        break;
      }

      for (const [key, value] of Object.entries(current)) {
        if (JSON.stringify(value) !== JSON.stringify(json[key])) {
          response[key] = value;
        }
      }
      sendResponse(response);
      break;
    }
    case 'open': {
      focus();
      break;
    }
    case 'play':
    case 'pause':
    case 'toggle': {
      let elem = document.querySelector(".playControls__elements > button.playControl");
      if (!elem || !elem.attr('title')) return;
      elem.click();
      json['playing'] = elem.attr('title').includes('Pause');

      response = { 'response': { 'playing': json['playing'] } };
      sendResponse(response);
      break;
    }
    case 'prev': {
      document.querySelector(".playControls__prev").click();
      update().then(() => {
        response = json;
        sendResponse(response);
      });
      break;
    }
    case 'next': {
      document.querySelector(".playControls__next").click();
      update().then(() => {
        response = json;
        sendResponse(response);
      });
      break;
    }
    case 'unfav':
    case 'fav': {
      let btn = document.querySelector(".playbackSoundBadge__like");
      if (!btn) return;
      btn.click();
      json['favorite'] = btn.attr('title') == "Unlike";

      response = { 'response': {'favorite': json['favorite']} };
      sendResponse(response);
      break;
    }
    case 'repeat': {
      let btn = document.querySelector(".repeatControl");
      if (!btn) return;
      btn.click();
      json['repeat'] = getRepeatMode(); // none -> one -> all

      response = { 'response': {'repeat': json['repeat']} };
      sendResponse(response);
      break;
    }
    case 'shuffle': {
      let btn = document.querySelector(".shuffleControl");
      if (!btn) return;
      btn.click();
      json['shuffle'] = isShuffling();

      response = { 'response': {'shuffle': json['shuffle']} };
      sendResponse(response);
      break;
    }
    case 'mute':
    case 'unmute': {
      document.querySelector('.volume button[type="button"]').click();
      json['mute'] = isMuted();

      response = { 'response': {'mute': json['mute'], 'volume': json['volume'] } };
      sendResponse(response);
      break;
    }
    case 'up':
    case 'down': { // volume up/down
      request.type == 'up' ? volumeUp() : volumeDown();
      json['volume'] = getVolume();
      json['time']['current'] = getCurrentTime();
      json['time']['end'] = getEndTime();
      json['progress'] = getProgress();
      json['mute'] = isMuted();

      response = { 'response': { 'time': json['time'], 'progress': json['progress'], 'volume': json['volume'], 'mute': json['mute'] } }; // i forgot why it also needs to update time.
      sendResponse(response);
      break;
    }
    case 'seekb':
    case 'seekf': { // seek backward/forward , but also needs to update progressbar.
      if (request.type == 'seekb') {
        seekBack();
      } else if (request.type == 'seekf') {
        seekForward();
      }
      json['time']['current'] = getCurrentTime();
      json['time']['end'] = getEndTime();
      json['progress'] = getProgress();

      response = { 'response': { 'time': json['time'], 'progress': json['progress'] } };
      sendResponse(response);
      break;
    }
    case 'follow': {
      document.querySelector('.playbackSoundBadge .sc-button-follow').click();
      json['following'] = isFollowing();
      response = { 'response' : { 'following': json['following'] } }
      sendResponse(response);
      break;
    }
    case 'settime': {
      let percent = request.value;
      if (!percent) break; // .value has to be 0-100% of the progress bar.
      setTime(percent);

      // update value & respond
      json['progress'] = getProgress();
      json['time']['current'] = getCurrentTime();
      json['time']['end'] = getEndTime();

      // send
      response = { 'response': { 'progress': json['progress'], 'time': json['time'] } };
      sendResponse(response);
      break;
    }
  }
  return true; // magic spell
  // Return true to indicate that sendResponse will be called asynchronously ... cuz of update().
});

var reloading = false,
  json = {
    'playing': false,
    'artwork': null,
    'link': null,
    'favorite': false,
    'shuffle': false,
    'repeat': 'none',
    'time': {
      'current': null,
      'end': null
    },
    'volume': 0,
    'mute': false,
    'following': false,
    'progress': 0,
    // , "playlist": []
  };