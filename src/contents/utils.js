function focus() {
  document.querySelector(".playbackSoundBadge__titleLink.sc-truncate").click();
}

function isPlaying() {
  let cls = '.playControl';
  return $(cls).length != 0 ? $(cls).attr('title') == 'Pause current' : false;
}

function getTitle() {
  return $('a.playbackSoundBadge__titleLink').attr('title');
}

function getArtist() {
  return $('a.playbackSoundBadge__lightLink').attr('title');
}

function getArtwork() {
  let a = $('.playbackSoundBadge span.sc-artwork').css('background-image');
  if (a != null && a.includes('120x120')) {
    a = a.replace('120x120', '500x500')
  }
  if (a != null && a.includes('50x50.')) {
    a = a.replace('50x50.', '500x500.');
  }
  return a;
}

function getLink() {
  let cls = '.playbackSoundBadge__titleLink.sc-truncate';

  if ($(cls).length == 0) return null;

  let url = new URL(location.origin + $(cls).attr('href')), params = url.searchParams, in_system_playlist = params.get('in_system_playlist') != null;

  if (in_system_playlist) {
    params.delete('in_system_playlist');
  }

  url.searchParams = params;

  return url.href;
}

function isLiked() {
  let cls = '.playControls__soundBadge .sc-button-like';
  return $(cls).length != 0 ? $(cls).attr('title') == 'Unlike' : false;
}

function getCurrentTime() {
  return $('.playbackTimeline__timePassed span[aria-hidden]').text();
}

function getEndTime() {
  return $('.playbackTimeline__duration span[aria-hidden]').text();
}

function getVolume() {
  if (document.querySelector('.volume__sliderWrapper') == null) return 0;
  return Number($('.volume__sliderWrapper').attr('aria-valuenow'))*100;
}

function isMuted() {
  let cls = '.volume';
  return $(cls).length != 0 ? $(cls).attr('class').includes('muted') : false;
}

function getRepeatMode() {
  if ($('.repeatControl').length == 0) {
    return 'none';
  }
  // atp I wanna rewrite everytihng with jqeury
  return Array.from(document.querySelector("button.repeatControl").classList).filter(className => className.startsWith('m-')).join(' ').replace("m-", "");
}

function isShuffling() {
  if ($('.shuffleControl').length == 0) {
    return false;
  }
  return $('.shuffleControl').attr('class').includes('m-shuffling');
}

function volumeDown() {
  input(40, 'ArrowDown', true);
}

function volumeUp() {
  input(38, 'ArrowUp', true);
}

function seekBack() {
  input(37, 'ArrowLeft');
}

function seekForward() {
  input(39, 'ArrowRight');
}

function isFollowing() {
  // why not TRUE OR FALSE? 
  // if it's null then popup.html can tell that it's myself. 
  // SoundCloud hides the follow button if it's a track from oneself. makes sense right?
  if (document.querySelector('.playbackSoundBadge .sc-button-follow') == null) return 'self';
  return $('.playbackSoundBadge .sc-button-follow').attr('aria-label').includes('Unfollow');
}

function input(keyCode, name, shiftKey) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: name,
      keyCode: keyCode, 
      code: name,
      which: keyCode,
      shiftKey: !shiftKey ? false : shiftKey,
    })
  );
}