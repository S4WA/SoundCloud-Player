document.addEventListener('DOMContentLoaded', () => {
  checkIfCompactIsEnabled();
  registerElements();
  initDropdown();
  initSettings();
  initTemplates();
  initInputs();
  putAllLinks();
  initDarkmode();
  initMarquees();
  registerEvents();
  initKeyboardBinds();
  ready = true;
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message['type'] != 'update' || message['value'] == null) return false;

  var items = message['value'];
  if (json == items) return false;

  if ($('#controller-body').css('display') == 'none' && 
    localStorage.getItem('compact_in_settings') != null && 
    localStorage.getItem('compact_in_settings') == 'true') {
    $('#controller-body').css('display', 'inline-block');
    keyReady = true;
  }

  // artwork
  if (items['artwork'] != json['artwork']) {
    $(artworkElem).css('background-image', items['artwork']);
  }
  
  // track
  if (items['title'] != json['title']) {
    $(titleElem).text( replaceText( localStorage.getItem('trackdisplay'), items) );
    $(titleElem).attr( 'title', replaceText( localStorage.getItem('trackdisplay'), items) );
  }
  // link
  if (items['link'] != json['link']) {
    $(titleElem).attr( 'href', items['link'] );
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

  json = items;
  sessionStorage.setItem('data', JSON.stringify(json));
});

function initDropdown() {
  // Childs
  $('.dropdown').each(function(i) {
    if ( $(this).attr('closed') != null ) {
      if ( Bool( $(this).attr('closed') ) ) {
        $(this).children('.dd-child').hide();
      } 
    } else {
      $(this).attr('closed', 'true');
      $(this).children('.dd-child').hide();
    }
  })

  // Parents
  $('.dropdown .dd-parent').addClass('clickable');

  $('.dropdown .dd-parent').on('click', function() {
    let parent = $(this).parent(), value = Bool( parent.attr('closed') );

    parent.attr('closed', !value);

    if (value) {
      parent.children('.dd-child').slideDown();
    } else {
      parent.children('.dd-child').slideUp();
    }
  });

  // Elements
  $('.dropdown .dd-child textarea').attr('spellcheck', 'false');
  $('.dropdown .dd-child input').attr('spellcheck', 'false');
}

function checkFonts() {
  // - Custom Font
  if (localStorage.getItem('font') != null) {
    $('#font').text(localStorage.getItem('font'));
    updateFont();


    const fontCheck = new Set([
      // Windows 10
      'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
      // macOS
      'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino',
      // Font Familiy
      'Times', 'Times New Roman', 'Georgia', 'serif', 'Verdana', 'Arial', 'Helvetica', 'sans-serif', 'cursive', 'fantasy', 'emoji', 'math', 'fangsong', 'Meiryo'
    ].sort());

    (async() => {
      await document.fonts.ready;

      // const fontAvailable = new Set();

      for (const font of fontCheck.values()) {
        if (document.fonts.check(`12px '${font}'`)) {
          // fontAvailable.add(font);
          $('#fontlist').append( $(`<option value='${font}'>${font}</option>`) );
        }
      }

      // console.log('Available Fonts:', [...fontAvailable.values()]);

      $(`#fontlist option[value='${localStorage.getItem('font')}']`).attr('selected', 'true');
    })();
  }
}

function checkCustomColors() {
  // - Theme Color
  if (localStorage.getItem('themecolor') != null) {
    $('#themecolor').val( localStorage.getItem('themecolor') );
    updateThemeColor();
  } else {
    setTimeout(function() {
      $('#themecolor').val( $(':root').css('--theme-color') );
    }, 100);
  }
  // $('#themecolor').parents('.dropdown').on('click', function() {
  //   if ($(this).attr('closed') == 'false') {
  //     $('#themecolor').focus();
  //     $('#trackdisplay').focus();
  //     $('#trackdisplay').blur();
  //   }
  // })
  $('#themecolor').on('change', function() {
    updateThemeColor($(this).val());
  });

  // - Background
  if (localStorage.getItem('bgcolor') != null) {
    $('#bgcolor').val( localStorage.getItem('bgcolor') );
    updateBGcolor();
  } else {
    setTimeout(function() {
      $('#bgcolor').val( $(':root').css('--bg-color') );
    }, 100);
  }
  $('#bgcolor').on('change', function() {
    updateBGcolor($(this).val());
  });
}

function initSettings() {
  // - Track Display
  if (localStorage.getItem('trackdisplay') != null) {
    $('#trackdisplay').val(localStorage.getItem('trackdisplay'));
  }
  checkFonts();
  checkCustomColors();
}

function initTemplates() {
  // Share Templates
  // - init
  if (localStorage.getItem('twitter') != null) {
    $('#twitter').val( localStorage.getItem('twitter') );
  }
  if (localStorage.getItem('facebook') != null) {
    $('#facebook').val( localStorage.getItem('facebook') );
  }
  if (localStorage.getItem('tumblr') != null) {
    $('#tumblr').val( localStorage.getItem('tumblr') );
  }
  if (localStorage.getItem('email') != null) {
    let data = JSON.parse( localStorage.getItem('email') );
    $('#email_subject').val(data['subject']);
    $('#email_body').val(data['body']);
  }
  if (localStorage.getItem('copy') != null) {
    $('#copy').val( localStorage.getItem('copy') );
  }
}

function initInputs() {
  $('#trackdisplay').on('input', function() {
    localStorage.setItem('trackdisplay', $(this).val());
  });
  $('#fontlist').on('input', function() {
    localStorage.setItem('font', $(this).val());
    updateFont();
    $('#font').text(localStorage.getItem('font'));
  });

  $('#twitter').on('input', function() {
    localStorage.setItem('twitter', $(this).val());
  });
  $('#facebook').on('input', function() {
    localStorage.setItem('facebook', $(this).val());
  });
  $('#tumblr').on('input', function() {
    localStorage.setItem('tumblr', $(this).val());
  });

  $('#email_subject').on('input', function() {
    let data = JSON.parse(localStorage.getItem('email'));
    // console.log($(this).val());
    data['subject'] = $(this).val();
    localStorage.setItem('email', JSON.stringify(data));
  });
  $('#email_body').on('input', function() {
    let data = JSON.parse(localStorage.getItem('email'));
    // console.log($(this).val());
    data['body'] = $(this).val();
    localStorage.setItem('email', JSON.stringify(data));
  });

  $('#copy').on('input', function() {
    localStorage.setItem('copy', $(this).val());
  });
}

function putAllLinks() {
  // Links
  $('#discord').on('click', () => {
    openURL('https://discord.gg/R9R6fdm');
  });
  $('#github').on('click', () => {
    openURL('https://github.com/S4WA/soundcloud-player');
  });
  $('#feedback').on('click', () => {
    openURL('https://forms.gle/oG2DvmK7HXhq8q8ZA');
  });
  $('#c-twitter').on('click', () => {
    openURL('https://twitter.com/evildaimyoh');
  });
}

function initDarkmode() {
  if (localStorage.getItem('darkmode') != null) {
    dark = (localStorage.getItem('darkmode') === 'true');
  }
  darkmode(dark);
  $('#toggle_darkmode').on('click', () => { toggleDarkmode(); });

  // No Duplicate Popout
  if (isPopout()) {
    $('#back').attr('href', 'popup.html?p=1')
  }
}

function toggle() {
  if (toggleElem == null) return;
  queue('toggle');
}

function repeat() {
  if (json['repeat'] == null || repeatElem == null) return;
  queue('repeat');
  $(repeatElem).attr( 'mode', json['repeat'] );
}

function toggleFav() {
  if (favElem == null) return;
  let value = Bool( $(favElem).attr('favorite') );
  queue( value ? 'unFav' : 'Fav' );
}

function registerElements() {
  artworkElem = $('#artwork')[0];
  titleElem = $('.title')[0];
  toggleElem = $('#toggle')[0];
  prevElem = $('#prev')[0];
  nextElem = $('#next')[0];
  favElem = $('#fav')[0];
  repeatElem = $('#repeat')[0];
  shuffleElem = $('#shuffle')[0];
}

function registerEvents() {
  $(toggleElem).on('click', () => { toggle(); });
  $(prevElem).on('click', () => { queue('prev'); });
  $(nextElem).on('click', () => { queue('next'); });
  $(favElem).on('click', () => { toggleFav(); });
  $(titleElem).on('click', () => { location.href = 'popup.html'; });
  $(artworkElem).on('click', () => { location.href = 'popup.html'; });
  $(repeatElem).on('click', () => { repeat(); });
  $(shuffleElem).on('click', () => { queue('shuffle'); });
  $('.title').on('click', () => { return false; });
  $('#copynp').on('click', () => {
    copyToClipboard( replaceText(localStorage.getItem('copy')) );
  });
  $('#toggle_compact').change(function() {
    if ( $(this).prop('checked') ) {
      if ($('.marquee .js-marquee-wrapper').css('animation') == null) {
        startMarquees();
        console.log('a');
      }

      $('#controller-body').css('display', 'inline-block');
      localStorage.setItem('compact_in_settings', 'true');
      $('.maruee').marquee('resume');
      keyReady = true;
    } else {
      stopMarquees();

      $('#controller-body').css('display', 'none');
      localStorage.setItem('compact_in_settings', 'false');
      keyReady = false;
    }
  });
}

function replaceText(text, json) {
  if (!json) json = JSON.parse( sessionStorage.getItem('data') );
  return text.replace('%title%', json['title']).replace('%artist%', json['artist']).replace('%url%', json['link']);
}

function startMarquees() {
  $('.marquee')
  .bind('finished', () => {
    $('.marquee').marquee('pause');
    setTimeout(() => {
      $('.marquee').marquee('resume');
    }, marqueePauseTime);
  })
  .marquee({
    direction: 'left', 
    duration: textVisibleDuration,
    pauseOnHover: true,
    startVisible: true,
    duplicated: true
  });
}

function stopMarquees() {
  // clearInterval(marqueeTimer);
  $('.maruee').marquee('pause');
}

function initMarquees() {
  setTimeout(startMarquees, 50)
}

function checkIfCompactIsEnabled() {
  if (localStorage.getItem('compact_in_settings') != null && localStorage.getItem('compact_in_settings') == 'true') {
    if (json['playing'] != null) {
      $('#controller-body').css('display', 'inline-block');
    } else {
      $('#controller-body').css('display', 'none');
    }
    $('#toggle_compact').attr('checked', 'true');
  } else {
    $('#controller-body').css('display', 'none');
  }
}

var dark = false;
var ready = false, json = {};
var artworkElem, titleElem, toggleElem, prevElem, nextElem, favElem, repeatElem, shuffleElem;
var marqueeTimer, textVisibleDuration = 5000, marqueePauseTime = 5000;
