function focus() {
  document.querySelector(".playbackSoundBadge__titleLink.sc-truncate").click();
}

function isPlaying() {
  let cls = '.playControl';
  return document.querySelector(cls) ? document.querySelector(cls).attr('title') == 'Pause current' : false;
}

function getTitle() {
  return document.querySelector('a.playbackSoundBadge__titleLink').attr('title');
}

function getArtist() {
  return document.querySelector('a.playbackSoundBadge__lightLink').attr('title');
}

function getArtwork() {
  let a = document.querySelector('.playbackSoundBadge span.sc-artwork').style['backgroundImage'];
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

  if (!document.querySelector(cls)) return null;

  let url = new URL(location.origin + document.querySelector(cls).attr('href')), params = url.searchParams, in_system_playlist = params.get('in_system_playlist') != null;

  if (in_system_playlist) {
    params.delete('in_system_playlist');
  }

  url.searchParams = params;

  return url.href;
}

function isLiked() {
  let cls = '.playControls__soundBadge .sc-button-like';
  return document.querySelector(cls) ? document.querySelector(cls).attr('title') == 'Unlike' : false;
}

function getCurrentTime() {
  return document.querySelector('.playbackTimeline__timePassed span[aria-hidden]').innerText;
}

function getEndTime() {
  return document.querySelector('.playbackTimeline__duration span[aria-hidden]').innerText;
}

function getVolume() {
  if (document.querySelector('.volume__sliderWrapper') == null) return 0;
  return Math.floor(Number(document.querySelector('.volume__sliderWrapper').getAttribute('aria-valuenow'))*100);
}

function isMuted() {
  let cls = '.volume';
  return document.querySelector(cls) ? document.querySelector(cls).attr('class').includes('muted') : false;
}

function getRepeatMode() {
  if (!document.querySelector('.repeatControl')) {
    return 'none';
  }
  // atp I wanna rewrite everytihng with jqeury
  return Array.from(document.querySelector("button.repeatControl").classList).filter(className => className.startsWith('m-')).join(' ').replace("m-", "");
}

function isShuffling() {
  if (!document.querySelector('.shuffleControl')) {
    return false;
  }
  return document.querySelector('.shuffleControl').attr('class').includes('m-shuffling');
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
  // if it's returning 'self' then popup.js can tell that the current track is uploaded by the user themself.
  // This is because SoundCloud hides the follow button in such case, so SC-Player tries to imitate it.
  if (document.querySelector('.playbackSoundBadge .sc-button-follow') == null) return 'self';
  return document.querySelector('.playbackSoundBadge .sc-button-follow').attr('aria-label').includes('Unfollow');
}

function getProgress() {
  const el = document.querySelector(`[role="progressbar"] .playbackTimeline__progressHandle`);
  if (!el) return 0;
  return el.style['left'];
}

function setTime(percentage) {
  // calculate distance.
  let el = document.querySelector('.playbackTimeline__progressWrapper');
  let rect = el.getBoundingClientRect();

  let duration = parseFloat(el.getAttribute('aria-valuemax'));
  let targetTime = (percentage/100)*duration;
  let offset = (targetTime / duration) * rect.width;
  let x = rect.left + offset;

  // dispatch events
  el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: x, clientY: rect.top+5 }));
  el.dispatchEvent(new MouseEvent('mouseup',   { bubbles: true, clientX: x, clientY: rect.top+5 }));
}

function input(keyCode, name, shiftKey) {
  document.body.focus();
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: name,
      keyCode: keyCode, 
      code: name,
      which: keyCode,
      shiftKey: shiftKey ?? false,
    })
  );
}

// added attr() in order to avoid replacing every attr function from jquery to vanilla js's setAttribute().
Element.prototype.attr = function(name, value) {
  if (value === undefined) {
    return this.getAttribute(name);
  } else {
    this.setAttribute(name, value);
    return this;
  }
};
