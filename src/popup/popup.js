document.addEventListener('DOMContentLoaded', () => {
  init();
  ready = true;
});

// Initialize:
function init() {
  chrome.tabs.query({ url: '*://soundcloud.com/*' }, (results) => {
    if (results.length == 0) {
      ready = false;
      json = {};

      for (var i in hideList) {
        $(hideList[i]).hide();
      }
    } else {
      for (var i in hideList) {
        $(hideList[i]).show();
      }
    }
  });

  $('#version').text('v' + chrome.runtime.getManifest().version);
  registerElements();
  registerEvents();

  chrome.tabs.query({ url: '*://soundcloud.com/*' }, (results) => {
    if (results['length'] >= 2) {
      $('body').append( 
        $('<hr></hr>'),
        $('<span>').text('We can\'t show multiple tracks. Sorry:(')
      )
    }
  });

  for (key in templates) {
    let item = localStorage.getItem(key);
    templates[key] = key != 'email' ? item : JSON.parse(item);
  }

  initKeyboardBinds();
}

function registerElements() {
  artworkElem = $('#artwork')[0];
  trackElem = $('#track')[0];
  toggleElem = $('#toggle')[0];
  prevElem = $('#prev')[0];
  nextElem = $('#next')[0];
  favElem = $('#fav')[0];
  repeatElem = $('#repeat')[0];
  shuffleElem = $('#shuffle')[0];
}

function registerEvents() {
  // Dark Mode
  if (localStorage.getItem('darkmode') != null) {
    dark = (localStorage.getItem('darkmode') === 'true');
  }
  darkmode(dark);
  $('#toggle_darkmode').on('click', () => { toggleDarkmode(); });

  // Audio
  $(toggleElem).on('click', () => { toggle(); });
  $(prevElem).on('click', () => { queue('prev'); });
  $(nextElem).on('click', () => { queue('next'); });
  $(favElem).on('click', () => { toggleFav(); });
  $(trackElem).on('click', () => { openSCTab(); });
  $(artworkElem).on('click', () => { openSCTab(); });
  $(repeatElem).on('click', () => { repeat(); });
  $(shuffleElem).on('click', () => { queue('shuffle'); });
  $('#title').on('click', () => { return false; });

  $('#volume-icon').on('click', () => { queue('mute'); });
  $('#playlist_btn').on('click', () => { queue('playlist'); });

  $('#up').on('click', () => { queue('up'); });
  $('#down').on('click', () => { queue('down'); });


  $('#P').on('click', () => {
    popup('popup/popup.html?p=1', 'a');
    // $('#P').css('display', 'none');
    window.close();
  });

  // Link buttons
  $('#store').on('click', () => {
    openURL('https://chrome.google.com/webstore/detail/soundcloud-player/oackhlcggjandamnkggpfhfjbnecefej');
  });
  $('#close').on('click', () => {
    chrome.tabs.query({ url: '*://soundcloud.com/*' }, (results) => {
      if (results.length != 0) {
         chrome.tabs.remove(results[0].id, () => {});
         window.close();
      }
    });
  });

  // Share
  $('#share_btn').on('click', () => {
    var share = $('#share');
    // share.is(':visible') ? share.slideUp() : share.slideDown();
    share.is(':visible') ? share.hide() : share.show();
  });

  $('#share_with_time').on('input', () => {
    shareSettings['share_with_time'] = $('#share_with_time').prop('checked');
  });

  // Social
  var socials = ['Twitter', 'Facebook', 'Tumblr', 'Email'];
  for (var i in socials) with ({i:i}) {
    var elem = $( '#social .' + socials[i].toLowerCase() );
    elem.on('click', () => {
      openURL( shareLink(socials[i]) );
    });
    elem.attr('title', 'Share on ' + socials[i])
  }

  $('#social .clipboard').on('click', () => {
    copyToClipboard( replaceText(templates['copy']) );
  })

  $('#copy').focus(() => {
    $('#copy').select();
  })

  
  // No Duplicate Popout
  if (isPopout()) {
    $('#settings').attr('href', 'settings.html?p=1')
  }

  /*$('.marquee').hover(
    () => {
      $('.marquee').children().toggleClass('marquee-inner');
    },
    () => {
      $('.marquee').children().toggleClass('marquee-inner');
    }
  );*/
}

function toggleFav() {
  if (favElem == null) return;
  let value = Bool( $(favElem).attr('favorite') );
  queue( value ? 'unFav' : 'Fav' );
}

function repeat() {
  if (json['repeat'] == null || repeatElem == null) return;
  queue('repeat');
  $(repeatElem).attr( 'mode', json['repeat'] );
}

function toggle() {
  if (toggleElem == null) return;
  let value = Bool( $(toggleElem).attr('playing') );
  queue(value ? 'Pause' : 'Play');
}

// Share link
function shareLink(social) {
  social = social.toLowerCase();
  let data = JSON.parse( sessionStorage.getItem('data') ); 
  // console.log(data);
  if (social == 'email') {
    let subject = replaceText( templates['email']['subject'] ), body = replaceText( templates['email']['body'] );
    return links['email'].replace( '%subject%', fixedEncoder(subject) ).replace( '%body%', fixedEncoder(body) );
  } else {
    let text = replaceText( templates[social] );
    return links[social].replace( '%text%', fixedEncoder(text) ).replace( '%url%', fixedEncoder(data['link']) );
  }
}

function replaceText(text, json) {
  if (!json) json = JSON.parse( sessionStorage.getItem('data') );
  return text.replace('%title%', json['title']).replace('%artist%', json['artist']).replace('%url%', json['link']);
}

var ready = false, json = {}, dark = false,
  artworkElem, trackElem, toggleElem, prevElem, nextElem, favElem, repeatElem, shuffleElem,
  hideList = ['#close', '#second br:last-child', '#controller', 'hr:first', '#share_btn'],
  shareSettings = {
    'share_with_time': false
  },
  links = {
    'twitter': 'https://twitter.com/intent/tweet?text=%text%&hashtags=NowPlaying',
    'facebook': 'https://www.facebook.com/sharer/sharer.php?u=%text%',
    'tumblr': 'https://www.tumblr.com/widgets/share/tool?canonicalUrl=%url%&posttype=audio&tags=SoundCloud%2Cmusic%2CNowPlaying&caption=%text%',
    'email': 'mailto:?subject=%subject%&body=%body%'
  },
  templates = {
    'twitter': '%title% By %artist% %url%',
    'facebook': '%url%',
    'tumblr': '%title% By %artist%',
    'email': {
      'subject': '%title% By %artist%',
      'body': '%url%'
    },
    'copy': '%title% By %artist% %url%'
  };


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message['type'] != 'update' || message['value'] == null) return false;

  var items = message['value'];
  if (json == items) return false;

  // Update element texts
  /* if (!ready) return; */

  // artwork
  if (items['artwork'] != json['artwork']) {
    $(artworkElem).css('background-image', items['artwork']);
  }
  
  // track
  if (items['title'] != json['title']) {
    $(trackElem).text( replaceText( localStorage.getItem('trackdisplay'), items) );
  }
  
  // play/pause
  if (items['playing'] != json['playing']) {
    $(toggleElem).attr( 'playing', items['playing'] );
  }
  
  // fav/unfav
  if (items['favorite'] != json['favorite']) {
    $(favElem).attr( 'favorite', items['favorite'] );
  }
  
  // shuffle
  if (items['shuffle'] != json['shuffle']) {
    $(shuffleElem).attr( 'shuffle', items['shuffle'] );
  }
  
  // repeat
  if (items['repeat'] != json['repeat']) {
    $(repeatElem).attr( 'mode', items['repeat'] );
  }
  
  // volume
  if (items['volume'] != json['volume']) {
    $('#current-volume').text( Math.floor(items['volume']) + ' %' );
  }
  
  // mute/unmute
  if (items['mute'] != json['mute']) {
    items['mute'] ? $('#volume-icon').addClass('muted') : $('#volume-icon').removeClass('muted');
  }
  
  // times
  let timeJson = items['time'];

  if ($('#current').text() != timeJson['current']) {
    $('#current').text(timeJson['current']);
    $('#share_current_time').val(timeJson['current']);
  }
  if ($('#end').text() != timeJson['end']) {
    $('#end').text(timeJson['end']);
  }

  // playlist
  if (items['playlist'] != json['playlist']) {
    // console.log(items['playlist'])
  }

  // share
  $('#copy').val(items['link'] + (shareSettings['share_with_time'] ? '#t=' + items['time']['current'] : '') );

  let selectable = shareSettings['share_with_time'] && 
    items['time']['current'] != json['time']['current'] && 
    $('#copy')[0].selectionStart != null && 
    $(document.activeElement)[0] == $('#copy')[0];
  if (selectable) $('#copy').select();

  // title link
  $('#title')[0].href = items['link'];


  // Update local json data
  json = items;
  sessionStorage.setItem('data', JSON.stringify(json));
  
  // Controller
  if ($('#controller').is(':not(:visible)')) {
    for (var i in hideList) {
      $(hideList[i]).show();
    }
  }

  return true;
});
