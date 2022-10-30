document.addEventListener('DOMContentLoaded', () => {
  init();
});

function toggleElements(arg) {
  for (var i in hideList) {
    if (arg) { // Show? If Yes ->  
      $(hideList[i]).show();
    } else {
      $(hideList[i]).hide();
    }
  }
}

// Initialize:
async function init() {
  for (key in templates) {
    let item = localStorage.getItem(key);
    templates[key] = item;
  }

  // No Duplicate Popout
  if (isPopout()) {
    $('#P').hide();
    $('#settings').attr('href', 'settings.html?p=1')
  }

  chrome.tabs.query({ url: '*://soundcloud.com/*' }, (results) => {
    let arg = results.length != 0 && results[0].status == 'complete';
    keyReady = arg;
    toggleElements(arg);
  });

  new Promise((resolve, reject) => {
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
    resolve();
  }).then(() => {
    registerEvents();
    checkDisplayArtwork();
  });

  queue('request-data').then((val) => {
    update(val);
    json = val;
    sessionStorage.setItem('data', JSON.stringify(json));
  });

  setInterval(async() => {
    queue('smart-request-data').then((val) => {
      if (val != null && val != {}) {
        update(val);
        // console.log(val);
        
        // Controller
        toggleElements(true);
        keyReady = true;
        return val;
      }
      return {};
    }).then((val) => {
      for (let key in json) {
        if (json[key] == val[key] || val[key] == null) continue;
        let value = val[key];
        json[key] = value;
        // console.log(key, ': ', value)
      }
      sessionStorage.setItem('data', JSON.stringify(json));
    });

    let [ScTab] = await chrome.tabs.query({ url: '*://soundcloud.com/*' });

    // If sc tab is closed -> reload the popup.html (itself)
    if (keyReady && ScTab == null) {
      location.reload(); // RESET EVERYTHING!
    }
  }, 500);
}

async function update(val) {
  // if value is null or isn't json, return. 
  if (val == null || typeof val !== 'object') return;

  // set artwork (text)
  if (val['artwork'] != null && val['artwork'] != json['artwork']) {
    $('#artwork').css('background-image', val['artwork']);
  }

  // set title (text)
  if (val['artwork'] != null && val['title'] != json['title']) {
    $('.title').text( replaceText( localStorage.getItem('trackdisplay'), val) );

    if (marqueeReady == false) {
      marqueeReady = true;
      startMarquees();
    }
    $('.title').attr('href', val['link']);
  }

  // set current time & duration
  if (val['time'] != null) {
    let timeJson = val['time'];

    if ($('#current').text() != timeJson['current']) {
      $('#current').text(timeJson['current']);
      $('#share_current_time').val(timeJson['current']);
    }
    if ($('#end').text() != timeJson['end']) {
      $('#end').text(timeJson['end']);
    }
  }

  // set playing status (true/false)
  if (val['playing'] != null && val['playing'] != json['playing']) {
    $('#toggle').attr( 'playing', val['playing'] );
  }

  // set favorite status (true/false)
  if (val['favorite'] != null && val['favorite'] != json['favorite']) {
    $('#fav').attr( 'favorite', val['favorite'] );
  }
  
  // set shuffle status (true/false)
  if (val['shuffle'] != null && val['shuffle'] != json['shuffle']) {
    $('#shuffle').attr( 'shuffle', val['shuffle'] );
  }
  
  // set repeat status (one/all/none)
  if (val['repeat'] != null && val['repeat'] != json['repeat']) {
    $('#repeat').attr( 'mode', val['repeat'] );
  }

  // set current volume (X%)
  if (val['volume'] != null && val['volume'] != json['volume']) {
    $('#current-volume').text( Math.floor(val['volume']) + ' %' );
  }

  // set mute (true/false)
  if (val['mute'] != json['mute']) {
    val['mute'] ? $('#volume-icon').addClass('muted') : $('#volume-icon').removeClass('muted');
  }

  // set share link
  if (val['time'] != json['time']) {
    $('#copy').val(json['link'] + (shareSettings['share_with_time'] ? '#t=' + val['time']['current'] : '') );

    let selectable = shareSettings['share_with_time']
                    && $('#copy')[0].selectionStart != null
                    && $(document.activeElement)[0] == $('#copy')[0];
    if (selectable) $('#copy').select();
  }
}

function setDefaultTheme() {
  $('#controller-body')[0].innerHTML = defaultController;
  $('#controller-body').attr('mode', 'default');
}

function setCompactTheme() {
  $('#time').remove();
  $('#controller-body')[0].innerHTML = compactController;
  $('#controller-body').attr('mode', 'compact');
}

function registerAudioButtons() {
  $('#toggle').on('click', () => {
    queue('toggle').then((val) => {
      update(val.response);
    });
    openSCTab2();
  });
  $('#prev').on('click', () => { queue('prev'); openSCTab2(); });
  $('#next').on('click', () => { queue('next'); openSCTab2(); });
  $('#fav').on('click', () => { queue('fav'); openSCTab2(); });
  $('.title').on('click', () => { openSCTab(); });
  $('#artwork').on('click', () => { openSCTab(); });
  $('#repeat').on('click', () => {
    queue('repeat').then((val) => {
      update(val.response);
    });
    openSCTab2();
  });
  $('#shuffle').on('click', () => {
    queue('shuffle').then((val) => {
      update(val.response);
    });
    openSCTab2();
  });
  $('.title').on('click', () => { return false; });

  $('#volume-icon').on('click', () => {
    queue('mute').then((val) => {
      update(val.response);
    });
  });

  $('#up').on('click', () => {
    queue('up').then((val) => {
      update(val.response);
    });
  });
  $('#down').on('click', () => {
    queue('down').then((val) => {
      update(val.response);
    });
  });
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
  var socials = ['Twitter'];
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
}


// Share link
function shareLink(social) {
  social = social.toLowerCase();
  let data = JSON.parse( sessionStorage.getItem('data') ); 
  // console.log(data);
  let text = replaceText( templates[social] );
  if (shareSettings['share_with_time']) {
    text = text.replace( data['link'], data['link'] + '#t=' + data['time']['current'] );
  }
  return links[social].replace( '%text%', fixedEncoder(text) );
}

// Variables
var dark = false, 
  marqueeReady = false, 
  hideList = ['#close', '#second', 'hr:last-child', '#controller-body[mode="compact"] #hyphen', '.marquee .title'],
  links = {
    'twitter': 'https://twitter.com/intent/tweet?text=%text%&hashtags=NowPlaying',
  },
  templates = {
    'twitter': '%title% By %artist% %url%',
    'copy': '%title% By %artist% %url%'
  },
  shareSettings = {
    'share_with_time': false
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
      <a class='title clickable' title='Open SoundCloud Tab' href=''>
      </a>
    </div>
    <hr/>`,
  compactController = `<div class='floating'>
    <div class='left'>
      <div id='artwork' title='Open SoundCloud Tab' class='clickable'></div>
    </div>
    <div id='controller' class='right'>
      <div class='children marquee'>
        <a class='title clickable' title='' href=''>
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