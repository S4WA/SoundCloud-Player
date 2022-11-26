window.onload = (async() => {
  console.log(prefix, "Hi.");

  // Check if extension is reloaded
  setInterval(async() => {
    try {
      let shit = await browser.runtime.getManifest();
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
}

browser.runtime.onMessage.addListener(async function(request) {
  // Debug:
  // if (request.type != 'request-data') console.log('received:', request);

  let response = {};

  switch (request.type) {
    case 'request-data': {
      update();
      response = json;
      break;
    }
    case 'smart-request-data': {
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
      if (getVolume() != json['volume'] || getCurrentTime() != json['time']['current']) {
        response['volume'] = getVolume();
        response['time'] = {};
        response['time']['current'] = getCurrentTime();
        response['time']['end'] = getEndTime();
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
      break;
    }
    case 'open': {
      focus();
      break;
    }
    case 'play':
    case 'pause':
    case 'toggle': {
      let elem = $('.playControl.sc-ir.playControls__control.playControls__play')[0];
      elem.click();
      json['playing'] = elem.title.includes('Pause');

      response = {'response': { 'playing': json['playing'], 'volume': json['volume'] } };
      break;
    }
    case 'prev': { // MEMO: 'prev', 'next' 共にcallbackのコードを付けるとカクつく = 曲が始まった時音が ダブって聞こえる/プツっとなる
      $('.playControls__prev')[0].click();
      // callback( {'response': {'code': 'song-changed'} } );
      break;
    }
    case 'next': {
      $('.playControls__next')[0].click();
      // callback( {'response': {'code': 'song-changed'} } );
      break;
    }
    case 'unfav':
    case 'fav': {
      let btn = $('.playbackSoundBadge__like')[0];
      btn.click();
      json['favorite'] = btn.title == "Unlike";

      response = {'response': {'favorite': json['favorite']} };
      break;
    }
    case 'repeat': {
      let btn = $('.repeatControl')[0];
      btn.click();
      json['repeat'] = getRepeatMode(); // none -> one -> all

      response = {'response': {'repeat': json['repeat']} };
      break;
    }
    case 'shuffle': {
      let btn = $('.shuffleControl')[0];
      btn.click();
      json['shuffle'] = isShuffling();

      response = {'response': {'shuffle': json['shuffle']} };
      break;
    }
    case 'mute':
    case 'unmute': {
      $('.volume button[type="button"]')[0].click();
      json['mute'] = $('.volume')[0].className.includes('muted');

      response = {'response': {'mute': json['mute']} };
      break;
    }
    case 'up':
    case 'down': { // volume up/down
      if (request.type == 'up') {
        volumeUp();
      } else if (request.type == 'down') {
        volumeDown();
      }
      json['volume'] = getVolume();
      json['time']['current'] = getCurrentTime();
      json['time']['end'] = getEndTime();

      response = {'response': { 'time': json['time'], 'volume': json['volume'] } };
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

      response = {'response': { 'time': json['time'] } };
      break;
    }
    case 'ap': { // add to playlist
      focus();
      new Promise((resolve) => {
        $('.sc-button-more.sc-button-secondary.sc-button.sc-button-medium.sc-button-responsive')[0].click();
        console.log('1');
        resolve();
      }).then(() => {
        console.log('2');
        $('.sc-button-addtoset.sc-button.moreActions__button.sc-button-medium.sc-button-tertiary')[0].click();
      });
      break;
    }
    default: {
      // console.log('default:', request);
      break;
    };
  }

  return response;
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
    'mute': false
    // , "playlist": []
  };