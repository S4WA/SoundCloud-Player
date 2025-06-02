window.onload = (async() => {
  console.log(prefix, "Hi.");

  // Check if extension is reloaded
  setInterval(async() => {
    try {
      let shit = await chrome.runtime.getManifest();
    } catch {
      // if so -> reload content.js but it can only reload in once
      if (reloading == false) {
        location.reload();
        reloading = true;
        console.info(prefix, 'reloading...');
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
}

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
  // Debug:
  // if (request.type != 'request-data') console.log('received:', request);

  let response = {};

  $(document).click();

  switch (request.type) {
    case 'get-element': {
      response['value'] = $(`${request.value}`).length;
      break;
    }
    case 'request-data': {
      if (getTitle() == null) return;
      await update();
      sendResponse(json);
      break;
    }
    case 'smart-request-data': {
      if (getTitle() == null) return;
      response = {};

      if (getTitle() != json['title']) {
        await update();
        response = json;
      }
      if (isPlaying() != json['playing']) {
        response['playing'] = isPlaying();
      }
      if (isLiked() != json['favorite']) {
        response['favorite'] = isLiked();
      }
      if (getVolume() != json['volume']) {
        response['volume'] = getVolume();
        response['mute'] = isMuted();
      }
      if (getCurrentTime() != json['time']['current']) {
        response['time'] = {
          'current': getCurrentTime(),
          'end': getEndTime()
        };
      }
      if (isMuted() != json['mute']) {
        response['mute'] = isMuted();
      }
      if (getRepeatMode() != json['repeat']) {
        response['repeat'] = getRepeatMode();
      }
      if (isShuffling() != json['shuffle']) {
        response['shuffle'] = isShuffling();
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
      let elem = $('.playControls__elements > .playControl');
      if (!elem || !elem.attr('title')) return;
      elem.click();
      json['playing'] = elem.attr('title').includes('Pause');

      response = { 'response': { 'playing': json['playing'] } };
      sendResponse(response);
      break;
    }
    case 'prev': {
      $('.playControls__prev').click();
      await update();
      response = json;
      sendResponse(response);
      break;
    }
    case 'next': {
      $('.playControls__next').click();
      await update();
      response = json;
      sendResponse(response);
      break;
    }
    case 'unfav':
    case 'fav': {
      let btn = $('.playbackSoundBadge__like');
      if (!btn) return;
      btn.click();
      json['favorite'] = btn.attr('title') == "Unlike";

      response = { 'response': {'favorite': json['favorite']} };
      sendResponse(response);
      break;
    }
    case 'repeat': {
      let btn = $('.repeatControl');
      if (!btn) return;
      btn.click();
      json['repeat'] = getRepeatMode(); // none -> one -> all

      response = { 'response': {'repeat': json['repeat']} };
      sendResponse(response);
      break;
    }
    case 'shuffle': {
      let btn = $('.shuffleControl');
      if (!btn) return;
      btn.click();
      json['shuffle'] = isShuffling();

      response = { 'response': {'shuffle': json['shuffle']} };
      sendResponse(response);
      break;
    }
    case 'mute':
    case 'unmute': {
      $('.volume button[type="button"]').click();
      json['mute'] = $('.volume').attr('class').includes('muted');

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

      response = { 'response': { 'time': json['time'], 'volume': json['volume'] } };
      sendResponse(response);
      break;
    }
    case 'seekb':
    case 'seekf': { // seek backward/forward
      if (request.type == 'seekb') {
        seekBack();
      } else if (request.type == 'seekf') {
        seekForward();
      }
      json['time']['current'] = getCurrentTime();
      json['time']['end'] = getEndTime();

      response = { 'response': { 'time': json['time'] } };
      sendResponse(response);
      break;
    }
    case 'follow': {
      $('.playbackSoundBadge .sc-button-follow').click();
      json['following'] = isFollowing();
      response = { 'response' : { 'following': json['following'] } }
      sendResponse(response);
      break;
    }
  }
  // console.log(response);
});

var prefix = '[SoundCloud Player] ', 
  reloading = false,
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
    // , "playlist": []
  };