document.addEventListener('DOMContentLoaded', () => {
  init();
  ready = true;
});

// Themes
function setDefaultTheme() {
  $('#controller-body')[0].innerHTML = defaultController;
  $('#controller-body').attr('mode', 'default');
}

function setCompactTheme() {
  $('#time').remove();
  $('#controller-body')[0].innerHTML = compactController;
  $('#controller-body').attr('mode', 'compact');
}

// Initialize:
function init() {
  switch (getThemeName()) {
    case 'default': {
      setDefaultTheme();
      break;
    }
    case 'compact': {
      setCompactTheme();
      break;
    }
  }

  chrome.tabs.query({ url: '*://soundcloud.com/*' }, (results) => {
    if (results.length == 0) {
      ready = false;
      json = {};

      for (var i in hideList) {
        $(hideList[i]).hide();
      }
      keyReady = false;
    } else {
      for (var i in hideList) {
        $(hideList[i]).show();
      }
      keyReady = true;
    }
  });

  $('#version').text('v' + chrome.runtime.getManifest().version);
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

  $('.title').css('display', 'inline');

  checkDisplayArtwork();
}

function registerAudioButtons() {
  $('#toggle').on('click', () => { toggle(); openSCTab2(); });
  $('#prev').on('click', () => { queue('prev'); openSCTab2(); });
  $('#next').on('click', () => { queue('next'); openSCTab2(); });
  $('#fav').on('click', () => { queue('fav'); openSCTab2(); });
  $('#track,.title').on('click', () => { openSCTab(); });
  $('#artwork').on('click', () => { openSCTab(); });
  $('#repeat').on('click', () => { repeat(); openSCTab2(); });
  $('#shuffle').on('click', () => { queue('shuffle'); openSCTab2(); });
  $('#title,.title').on('click', () => { return false; });

  $('#volume-icon').on('click', () => { queue('mute'); });
  $('#playlist_btn').on('click', () => { queue('playlist'); });

  $('#up').on('click', () => { queue('up'); });
  $('#down').on('click', () => { queue('down'); });
}

function registerEvents() { 
  // Dark Mode
  if (localStorage.getItem('darkmode') != null) {
    dark = (localStorage.getItem('darkmode') === 'true');
  }
  darkmode(dark);
  $('#toggle_darkmode').on('click', () => { toggleDarkmode(); });

  // Audio
  registerAudioButtons();

  // Popout
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
    let text = replaceText(templates['copy']);
    if (text.includes(json['link']) && shareSettings['share_with_time']) {
      text = text.replace(json['link'], json['link'] + '#t=' + json['time']['current']);
    }
    copyToClipboard( text );
  });

  $('.copynp').on('click', () => {
    copyToClipboard( replaceText(templates['copy']) );
  });

  $('#copy').focus(() => {
    $('#copy').select();
  });

  
  // No Duplicate Popout
  if (isPopout()) {
    $('#settings').attr('href', 'settings.html?p=1')
  }
}

function toggle() {
  if ($('#toggle') == null) return;
  let value = Bool( $('#toggle').attr('playing') );
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

var ready = false, json = {}, dark = false, marqueeReady = false,
  hideList = ['#close', '#second', 'hr:last-child', '#controller-body[mode="compact"] #hyphen'],
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
  },
  defaultController = `<div id='controller' class='floating'>
      <div class='left'>
        <button id='prev' class='clickable' title='Prev'></button>
        <button id='toggle' class='clickable' title='Play/Pause' playing=''></button>
        <button id='next' class='clickable' title='Next'></button>
      </div>
      <div class='right'>
        <button id='fav' class='clickable' title='Like/Unlike' favorite=''></button>
        <button id='shuffle' class='clickable' title='Shuffle' shuffle=''></button>
        <button id='repeat' class='clickable' title='Repeat' mode=''></button>
      </div>
    </div>
    <hr/>

    <div style='padding-bottom: 6.5px;'>
      <div id='artwork' title='Open SoundCloud Tab' class='clickable'></div>
      <a id='title' title='Open SoundCloud Tab' href=''>
        <span id='track'></span>
      </a>
    </div>
    <hr/>`,
  compactController = `<div class='floating'>
    <div class='left'>
      <div id='artwork' title='Open SoundCloud Tab' class='clickable'></div>
    </div>
    <div id='controller' class='right'>
      <div class='children marquee'>
        <a class='title' title='' href='' style='display: none;'>
        </a>
      </div>
      <div class='children'>
        <button id='shuffle' class='clickable' title='Shuffle' shuffle=''></button>
        <div>
          <span id='current' style='float: left;'></span>
          <span id='hyphen' class='icon'></span>
          <span id='end' style='float: right;'></span>
        </div>
        <button id='repeat' class='clickable' title='Repeat' mode=''></button>
      </div>
      <div class='children'>
        <button id='fav' class='clickable' title='Like/Unlike' favorite=''></button>
        <button id='prev' class='clickable' title='Prev'></button>
        <button id='toggle' class='clickable' title='Play/Pause' playing=''></button>
        <button id='next' class='clickable' title='Next'></button>
        <button class='copynp clickable' title='Copy Title & URL'></button>
      </div>
    </div>
    <hr style='margin-top: 5px;'>
  </div>`;


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message['type'] != 'update' || message['value'] == null) return false;

  var items = message['value'];
  if (json == items) return false;

  // Update element texts
  /* if (!ready) return; */

  // artwork
  if (items['artwork'] != json['artwork']) {
    $('#artwork').css('background-image', items['artwork']);
  }
  
  // track
  if (items['title'] != json['title']) {
    // console.log('aaa');
    // trackElem.innerText = replaceText( localStorage.getItem('trackdisplay'), items);
    $('#track,.title').text( replaceText( localStorage.getItem('trackdisplay'), items) );

    if (marqueeReady == false) {
      marqueeReady = true;
      setTimeout(startMarquees, 50);
    }
  }
  
  // play/pause
  if (items['playing'] != json['playing']) {
    $('#toggle').attr( 'playing', items['playing'] );
  }
  
  // fav/unfav
  if (items['favorite'] != json['favorite']) {
    $('#fav').attr( 'favorite', items['favorite'] );
  }
  
  // shuffle
  if (items['shuffle'] != json['shuffle']) {
    $('#shuffle').attr( 'shuffle', items['shuffle'] );
  }
  
  // repeat
  if (items['repeat'] != json['repeat']) {
    $('#repeat').attr( 'mode', items['repeat'] );
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
  $('#title,.title')[0].href = items['link'];


  // Update local json data
  json = items;
  sessionStorage.setItem('data', JSON.stringify(json));
  
  // Controller
  for (var i in hideList) {
    if ($(hideList[i]).css('display') != 'none') continue;
    $(hideList[i]).show();
  }

  return true;
});
