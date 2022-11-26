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
  initResetButton();
  checkDDAnimation();
  checkDisplayArtwork();
  initReceiver();
  initDarkModeAutomation();

  if (isPopout()) {
    $('#captureme').attr('href', 'embed.html?p=1');
    $('#captureme').text('Capture Me');
    $('#captureguide').on('click', function() {
      openURL('https://github.com/S4WA/SoundCloud-Player/wiki/For-Streamers-and-Gamers#using-the-green-screen-soundcloud-player-embed');
    });
    $('#captureguide').text('(Guide)');
  }

  $('#video').on('click', function() {
    $(this).siblings('.dd-child').html('<iframe width="100%" src="https://www.youtube.com/embed/hIJyF2u3-RY" title="Quick Tutorial for SoundCloud Player 1.3.0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>')
  });

  if (browser.extension.getViews().length > 1) {
    $('#small-msg').css('display', 'block');
  }
});

async function initReceiver() {
  queue('request-data').then((val) => {
    update(val);
    json = val;
    sessionStorage.setItem('data', JSON.stringify(json));
  });

  setInterval(async() => {
    queue('smart-request-data').then((val) => {
      if (val != null && val != {}) {
        update(val);
        sessionStorage.setItem('data', JSON.stringify(json));
        return val;
      }
      return {};
    }).then((val) => {
      for (key in val) {
        json[key] = val[key];
      }
    });

    let [ScTab] = await browser.tabs.query({ url: '*://soundcloud.com/*' });

    // If sc tab is closed -> reload the popup.html (itself)
    if (keyReady && ScTab == null) {
      location.reload(); // RESET EVERYTHING!
    }
  }, 500);
}

async function update(val) {
  // if value is null or isn't json, return. 
  if (val == null || typeof val !== 'object') return;

  let compact_enabled = localStorage.getItem('compact_in_settings') != null && localStorage.getItem('compact_in_settings') == 'true';
  if (compact_enabled == false) return;

  $('#controller-body').css('display', 'inline-block');
  keyReady = true;


  // set artwork (text)
  if (val['artwork'] != null) {
  // set artwork (text)
    $('#artwork').css('background-image', val['artwork']);
  }

  // set title (text)
  if (val['title'] != null) {
    $('.title').text( replaceText( localStorage.getItem('trackdisplay'), val) );
    $('.title').attr( 'title', replaceText( localStorage.getItem('trackdisplay'), val) );
  }

  // set link (text)
  if (val['link'] != null) {
    $('.title').attr( 'href', val['link'] );
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
}

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

  if (localStorage.getItem('startpage') != null) {
    $('#startpage').val(localStorage.getItem('startpage'));
  }
}

function initTemplates() {
  // Share Templates
  // - init
  if (localStorage.getItem('twitter') != null) {
    $('#twitter').val( localStorage.getItem('twitter') );
  }
  if (localStorage.getItem('copy') != null) {
    $('#copy').val( localStorage.getItem('copy') );
  }
}

function initInputs() {
  $('#trackdisplay').on('input', function () {
    settings['trackdisplay'] = $(this).val();
    localStorage.setItem('trackdisplay', $(this).val());
  });
  $('#fontlist').on('input', function () {
    updateFont($(this).val());
  });
  $('#theme-select').on('change', function () {
    settings['theme'] = $(this).val();
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

  $('#copy').on('input', function () {
    localStorage.setItem('copy', $(this).val());
  });

  $('#startpage').on('input', function () {
    localStorage.setItem('startpage', $(this).val());
  })
}

function putAllLinks() {
  let linkList = [
    [ '#github', 'https://github.com/S4WA/SoundCloud-Player' ],
    [ '#hp', 'https://akiba.cloud/soundcloud-player/' ],
    [ '#yt', 'https://youtu.be/hIJyF2u3-RY' ],
    [ '#feedback', 'https://forms.gle/oG2DvmK7HXhq8q8ZA' ],
    [ '#support', 'https://ko-fi.com/sawanese' ], 
    [ '.wiki', 'https://github.com/S4WA/SoundCloud-Player/wiki' ]
  ];
  for (var i = 0; i < linkList.length; i++) {
    (function(n) {
      $(linkList[n][0]).on('click', function() {
        openURL(linkList[n][1]);
      });
    })(i);
  }
  $('#eshortcuts').text(`To change the shortcut for opening popup, access '${shortcutPage()}' manually.`);
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

function goBackToMain() {
  location.href = 'popup.html?' + (isPopout() ? 'p=1' : '');
}

function registerEvents() {
  $('#toggle').on('click', () => { toggle(); });
  $('#prev').on('click', () => { queue('prev'); });
  $('#next').on('click', () => { queue('next'); });
  $('#fav').on('click', () => {
    queue('fav').then((val) => {
      if (val != null && val['response'] != null) {
        update(val['response']);
      }
    });
  });
  $('.title').on('click', () => { openSCTab(); });
  $('#artwork').on('click', () => { openSCTab(); });
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

function initDarkModeAutomation() {
  let auto = settings['darkmode_automation'];
  $('#da').prop('checked', auto['enabled']);

  $('#da').change(function() {
    auto['enabled'] = $(this).prop('checked');
    localStorage.setItem('darkmode_automation', JSON.stringify(auto));
  });

  $('#da-sh').val(auto['range-start'][0]);
  $('#da-sm').val(auto['range-start'][1]);
  $('#da-eh').val(auto['range-end'][0]);
  $('#da-em').val(auto['range-end'][1]);

  let el = $('#range').find('input');
  for (var i = 0; i < el.length; i++) {
    $( el[i] ).on('input', function() {
      let o = $(this)[0].id, head = o.includes('s') ? 'range-start' : 'range-end', num = o.includes('h') ? 0 : 1, z = Number( $(this).val() );
      auto[head][num] = z;
      localStorage['darkmode_automation'] = JSON.stringify(auto);
    });
  }
}

var dark = false;
var json = {};