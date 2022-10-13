document.addEventListener('DOMContentLoaded', () => {
  checkIfCompactIsEnabled();
  initDropdown();
  initSettings();
  initTemplates();
  initInputs();
  putAllLinks();
  initDarkmode();
  checkDuplication();
  initMarquees();
  registerEvents();
  initKeyboardBinds();
  initResetButton();
  checkDDAnimation();
  checkDisplayArtwork();
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
    $('#artwork').css('background-image', items['artwork']);
  }
  
  // track
  if (items['title'] != json['title']) {
    $('.title').text( replaceText( localStorage.getItem('trackdisplay'), items) );
    $('.title').attr( 'title', replaceText( localStorage.getItem('trackdisplay'), items) );
  }
  // link
  if (items['link'] != json['link']) {
    $('.title').attr( 'href', items['link'] );
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

  json = items;
  sessionStorage.setItem('data', JSON.stringify(json));
});

function initResetButton() {
  $('#reset').on('click', function () {
    let a = $('#count'), b = 1;
    if (a.text() != '') {
      b = Number(a.text());
      b++;
    }
    if (b > 3) return;
    a.text(b);

    if (b == 3) { // if it's '>=', it's gonna add elements more than 1. 
      $('#sure').append($(`<div><br>ARE YOU SURE YOU WANT TO RESET EVERYTHING ? [<span id='yes' class='clickable'>YES</span>] [<span id='no' class='clickable'>NO</span>] </div>`))
      $('#yes,#no').on('click', function () {
        if ($(this).attr('id') == 'yes') localStorage.clear(); 
        location.reload();
      });
    }
  });
}

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
  $('.dropdown > .dd-parent').addClass('clickable');

  $('.dropdown > .dd-parent').on('click', function() {
    let parent = $(this).parent(), value = Bool( parent.attr('closed') );

    parent.attr('closed', !value);

    if (localStorage.getItem('dropdown-animation') == 'true') {
      if (value) {
        parent.children('.dd-child').slideDown();
      } else {
        parent.children('.dd-child').slideUp();
      }
    } else {
      parent.children('.dd-child').css('display', value ? 'block' : 'none');
    }
  });

  // Elements
  $('.dropdown .dd-child textarea').attr('spellcheck', 'false');
  $('.dropdown .dd-child input').attr('spellcheck', 'false');
}

function checkMarqueesDurations() {
  $('#duration').val(localStorage.getItem('duration'));
  $('#pause').val(localStorage.getItem('pause'));
}

function checkFonts() {
  // - Custom Font
  if (localStorage.getItem('font') == null) return;
  $('#font-size').val( Number( localStorage.getItem('font-size').replace('px', '') ) );

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

function checkCustomColors() {
  // - Theme Color
  if (localStorage.getItem('themecolor') != null) {
    $('#themecolor').val( localStorage.getItem('themecolor') );
    $('#current-theme').val(`${ localStorage.getItem('themecolor').toUpperCase() }`)
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
    $('#current-theme').val(`${ $(this).val().toUpperCase() }`);
    updateThemeColor($(this).val());
  });
  $('#current-theme').on('change', function() {
    $('#themecolor').val(`${ $(this).val().toUpperCase() }`);
    updateThemeColor($(this).val());
  });

  // - Background
  if (localStorage.getItem('bgcolor') != null) {
    $('#bgcolor').val( localStorage.getItem('bgcolor') );
    $('#current-bgcolor').val(`${ localStorage.getItem('bgcolor').toUpperCase() }`)
    updateBGcolor();
  } else {
    setTimeout(function() {
      $('#bgcolor').val( $(':root').css('--bg-color') );
    }, 100);
  }
  $('#bgcolor').on('change', function() {
    $('#current-bgcolor').val(`${ $(this).val().toUpperCase() }`);
    updateBGcolor($(this).val());
  });
  $('#current-bgcolor').on('change', function() {
    $('#bgcolor').val(`${ $(this).val().toUpperCase() }`);
    updateBGcolor($(this).val());
  });
}

function cheeckTheme() {
  if (localStorage.getItem('theme') == null) return;
  let themeName = localStorage.getItem('theme');
  $(`#theme-select option[value='${themeName}']`).attr('selected', 'true');
}

function initSettings() {
  // - Track Display
  if (localStorage.getItem('trackdisplay') != null) {
    $('#trackdisplay').val(localStorage.getItem('trackdisplay'));
  }
  cheeckTheme();
  checkFonts();
  checkCustomColors();
  checkMarqueesDurations();
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
  $('#trackdisplay').on('input', function () {
    localStorage.setItem('trackdisplay', $(this).val());
  });
  $('#fontlist').on('input', function () {
    updateFont($(this).val());
  });
  $('#theme-select').on('change', function () {
    localStorage.setItem('theme', $(this).val());
  });
  $('#font-size').on('change', function() {
    updateFontSize($(this).val() + 'px')
  });
  $('#duration,#pause').on('change', function() {
    let name = $(this).attr('id');
    localStorage.setItem(name, Number( $(this).val() ));
    $('.marquee').marquee()
  });

  $('#twitter').on('input', function () {
    localStorage.setItem('twitter', $(this).val());
  });
  $('#facebook').on('input', function () {
    localStorage.setItem('facebook', $(this).val());
  });
  $('#tumblr').on('input', function () {
    localStorage.setItem('tumblr', $(this).val());
  });

  $('#email_subject').on('input', function () {
    let data = JSON.parse(localStorage.getItem('email'));
    // console.log($(this).val());
    data['subject'] = $(this).val();
    localStorage.setItem('email', JSON.stringify(data));
  });
  $('#email_body').on('input', function () {
    let data = JSON.parse(localStorage.getItem('email'));
    // console.log($(this).val());
    data['body'] = $(this).val();
    localStorage.setItem('email', JSON.stringify(data));
  });

  $('#copy').on('input', function () {
    localStorage.setItem('copy', $(this).val());
  });
}

function putAllLinks() {
  // Links
  $('#github').on('click', () => {
    openURL('https://github.com/S4WA/soundcloud-player');
  });
  $('#store').on('click', () => {
    openURL('https://chrome.google.com/webstore/detail/soundcloud-player/oackhlcggjandamnkggpfhfjbnecefej');
  });
  $('#feedback').on('click', () => {
    openURL('https://forms.gle/oG2DvmK7HXhq8q8ZA');
  });
  $('#c-twitter').on('click', () => {
    openURL('https://twitter.com/evildaimyoh');
  });
  $('#eshortcuts').on('click', () => {
    openURL('chrome://extensions/shortcuts');
  });
  $('#support').on('click', () => {
    openURL('https://ko-fi.com/sawanese');
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
  if ($('#toggle') == null) return;
  queue('toggle');
}

function repeat() {
  if (json['repeat'] == null || $('#repeat') == null) return;
  queue('repeat');
  $('#repeat').attr( 'mode', json['repeat'] );
}

function toggleFav() {
  if ($('#fav') == null) return;
  let value = Bool( $('#fav').attr('favorite') );
  queue( value ? 'unFav' : 'Fav' );
}

function goBackToMain() {
  location.href = 'popup.html?' + (isPopout() ? 'p=1' : '');
}

function registerEvents() {
  $('#toggle').on('click', () => { toggle(); });
  $('#prev').on('click', () => { queue('prev'); });
  $('#next').on('click', () => { queue('next'); });
  $('#fav').on('click', () => { toggleFav(); });
  $('.title').on('click', () => { goBackToMain(); });
  $('#artwork').on('click', () => { goBackToMain(); });
  $('#repeat').on('click', () => { repeat(); });
  $('#shuffle').on('click', () => { queue('shuffle'); });
  $('.title').on('click', () => { return false; });
  $('.copynp').on('click', () => {
    copyToClipboard( replaceText(localStorage.getItem('copy')) );
  });
  $('#toggle-compact').change(function () {
    if ( $(this).prop('checked') ) {
      if ($('.marquee.js-marquee-wrapper').css('animation') == null) {
        startMarquees();
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
  $('#dropdown-animation').change(function() {
    localStorage.setItem('dropdown-animation', $(this).prop('checked') ? 'true' : 'false');
  });
  $('#display-artwork').change(function() {
    let val = $(this).prop('checked');
    toggleArtwork(val);
    localStorage.setItem('display-artwork', String(val));
  });

  $('#duplication').change(function () {
    localStorage.setItem('duplication', duplicated = $(this).prop('checked'));
  })
}

function stopMarquees() {
  $('.maruee').marquee('pause');
}

function initMarquees() {
  setTimeout(startMarquees, 50);
}

function checkIfCompactIsEnabled() {
  if (localStorage.getItem('compact_in_settings') != null && localStorage.getItem('compact_in_settings') == 'true') {
    if (json['playing'] != null) {
      $('#controller-body').css('display', 'inline-block');
    } else {
      $('#controller-body').css('display', 'none');
    }
    $('#toggle-compact').attr('checked', '');
  } else {
    $('#controller-body').css('display', 'none');
  }
}

function checkDDAnimation() {
  if (localStorage.getItem('dropdown-animation') != null && localStorage.getItem('dropdown-animation') == 'true') {
    $('#dropdown-animation').attr('checked', '');
  }
}

function checkDuplication() {
  if (localStorage.getItem('duplication') != null && localStorage.getItem('duplication') == 'true') {
    $('#duplication').attr('checked', '');
  }
}

var dark = false;
var ready = false, json = {};