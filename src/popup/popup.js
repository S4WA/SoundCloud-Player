document.addEventListener('DOMContentLoaded', () => {
  Promise.all([
    init(),
    checkElements(),
    setTheme(),
    registerEvents(),
    checkDisplayArtwork(),
    queue('request-data').then((val) => {
      for (key in val) {
        json[key] = val[key];
      }
      update(val);
      sessionStorage.setItem('data', JSON.stringify(json));
    }),
    checkMultipleWindow(),
  ]);
});

// Initialize:
async function init() {
  for (key in templates) {
    let item = localStorage.getItem(key);
    templates[key] = item;
  }
  // No Duplicate Popout
  if (isPopout()) {
    $('#P').hide();
    $('#settings').attr('href', 'settings.html?p=1');
  }
}

async function checkElements() {
  let results = await browser.tabs.query({ url: '*://soundcloud.com/*' });

  let arg = results.length != 0 && results[0].status == 'complete';
  keyReady = arg;
  toggleElements(arg);

  if (settings['simple-label']) {
    $('#store').text('SC PLYR');
    $('#share_btn,#settings').contents().each(function() { if (this.nodeType === Node.TEXT_NODE) this.remove(); });
  }
}

function setTheme() {
  return new Promise((resolve, reject) => {
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
  });
}

async function toggleElements(arg) {
  for (var i of hideList) {
    if (arg) { // Show? If Yes ->
      $(i).show();
    } else {
      $(i).hide();
    }
  }
}

async function update(val) {
  // if value is null or isn't json, return. 
  if (val == null || typeof val !== 'object') return;

  // set artwork (text)
  if (val['artwork'] != null) {
    $('#artwork').css('background-image', val['artwork']);
  }

  // set title (text)
  if (val['title'] != null) {
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
  if (val['playing'] != null) {
    $('#toggle').attr( 'playing', val['playing'] );
  }

  // set favorite status (true/false)
  if (val['favorite'] != null) {
    $('#fav').attr( 'favorite', val['favorite'] );
  }
  
  // set shuffle status (true/false)
  if (val['shuffle'] != null) {
    $('#shuffle').attr( 'shuffle', val['shuffle'] );
  }
  
  // set repeat status (one/all/none)
  if (val['repeat'] != null) {
    $('#repeat').attr( 'mode', val['repeat'] );
  }

  // set current volume (X%)
  if (val['volume'] != null) {
    $('#current-volume').text( Math.floor(val['volume']) + ' %' );
  }

  // set mute (true/false)
  if (val['mute'] != null) {
    val['mute'] ? $('#volume-icon').addClass('muted') : $('#volume-icon').removeClass('muted');
  }

  // set share link
  if (val['time'] != null) {
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
    queue('toggle').then(update);
    openSCTab2();
  });
  $('#prev').on('click', () => { queue('prev'); openSCTab2(); });
  $('#next').on('click', () => { queue('next'); openSCTab2(); });
  $('#fav').on('click', () => {
    queue('fav').then(update);
    openSCTab2();
  });
  $('.title').on('click', () => { openSCTab(); });
  $('#artwork').on('click', () => { openSCTab(); });
  $('#repeat').on('click', () => {
    queue('repeat').then(update);
    openSCTab2();
  });
  $('#shuffle').on('click', () => {
    queue('shuffle').then(update);
    openSCTab2();
  });
  $('.title').on('click', () => { return false; });

  $('#volume-icon').on('click', () => {
    queue('mute').then(update);
  });

  $('#up').on('click', () => {
    queue('up').then(update);
  });
  $('#down').on('click', () => {
    queue('down').then(update);
  });
}

async function registerEvents() { 
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
    popup('../popup/popup.html?p=1', 'a');
    // $('#P').css('display', 'none');
    window.close();
  });

  // Link buttons
  $('#store').on('click', () => {
    openURL('https://akiba.cloud/soundcloud-player/');
  });

  // Share
  $('#share_btn').on('click', () => {
    var share = $('#share');
    // share.is(':visible') ? share.slideUp() : share.slideDown();
    share.is(':visible') ? share.hide() : share.show();
  });

  $('#share_with_time').on('input', () => {
    let check = $('#share_with_time').prop('checked');
    shareSettings['share_with_time'] = check;

    let copyLink = check ? json['link'] : `${json['link']}#t=${json['time']['current']}`;
    $('#copy').val(copyLink);
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
var dark = false, marqueeReady = false, or = false, checkTimer = null,
  hideList = ['#close', '#second', '#controller-body[mode="compact"] #hyphen', '.marquee .title'],
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