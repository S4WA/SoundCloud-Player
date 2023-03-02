document.addEventListener('DOMContentLoaded', () => {
  Promise.all([
    checkIfCompactIsEnabled(),
    initDropdown(),
    initSettings(),
    initTemplates(),
    initInputs(),
    putAllLinks(),
    initDarkmode(),
    registerEvents(),
    initResetButton(),
    initReceiver(),
    checkMultipleWindow(),
    initDarkModeAutomation(),
    refreshTSo(localStorage['back-and-forth'] == 'true' ? 'breathing' : 'marquee'),
  ]);
  if (isPopout()) {
    $('#captureme').attr('href', 'embed.html?p=1');
    $('#captureme').text('Capture Me');
    $('#captureguide').text('(Guide)');
  }

  $('#video').on('click', function() {
    $(this).siblings('.dd-child').html('<iframe width="100%" src="https://www.youtube.com/embed/hIJyF2u3-RY" title="Quick Tutorial for SoundCloud Player 1.3.0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>')
  });

  $('#eshortcuts').text(`To change the shortcut for opening popup, access '${isChrome() ? 'chrome://extensions/shortcuts' : 'about:addons'}' manually.`);
});

async function initReceiver() {
  queue('request-data').then((val) => {
    json = val;
    sessionStorage.setItem('data', JSON.stringify(json));
  });
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
    toggleArtwork(settings['display-artwork']);
    $('#artwork').css('background-image', val['artwork']);
  }

  // set title (text)
  if (val['title'] != null) {
    $('.title,.breathing').text( replaceText( localStorage.getItem('trackdisplay'), val) ).attr( 'title', replaceText( localStorage.getItem('trackdisplay'), val) );
    startMarquees();
  }

  // set link (text)
  if (val['link'] != null) {
    $('.title,.breathing').attr( 'href', val['link'] );
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

  // follow button
  if (val['following'] != null) {
    $('#follow_icon').attr('followed', val['following']);
  }
}

async function initResetButton() {
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

async function initDropdown() {
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
  $('#themecolor').change(function() {
    $('#current-theme').val(`${ $(this).val().toUpperCase() }`);
    updateThemeColor($(this).val());
  });
  $('#current-theme').change(function() {
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
  $('#bgcolor').change(function() {
    $('#current-bgcolor').val(`${ $(this).val().toUpperCase() }`);
    updateBGcolor($(this).val());
  });
  $('#current-bgcolor').change(function() {
    $('#bgcolor').val(`${ $(this).val().toUpperCase() }`);
    updateBGcolor($(this).val());
  });
}

function cheeckTheme() {
  if (localStorage.getItem('theme') == null) return;
  let themeName = localStorage.getItem('theme');
  $(`#theme-select option[value='${themeName}']`).attr('selected', 'true');
}

async function initSettings() {
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

async function initTemplates() {
  // Share Templates
  // - init
  if (localStorage.getItem('twitter') != null) {
    $('#twitter').val( localStorage.getItem('twitter') );
  }
  if (localStorage.getItem('copy') != null) {
    $('#copy').val( localStorage.getItem('copy') );
  }
}

async function initInputs() {
  $('#fontlist').on('input', function () {
    updateFont($(this).val());
  });
  $('#font-size').change(function() {
    updateFontSize($(this).val() + 'px');
  });

  const list = [
    [ '#duration' , 'duration' ],
    [ '#pause', 'pause' ],
    [ '#twitter', 'twitter' ],
    [ '#copy', 'copy' ],
    [ '#startpage', 'startpage' ],
    [ '#theme-select', 'theme' ],
    [ '#trackdisplay', 'trackdisplay' ]
  ], checkboxes = [
    [ '#simple-label', 'simple-label' ],
    [ '#display-artwork', 'display-artwork' ],
    [ '#toggle-compact', 'compact_in_settings' ],
    [ '#duplication', 'duplication' ],
    [ '#dropdown-animation', 'dropdown-animation' ],
    [ '#popout-dupe', 'popout-dupe' ],
    [ '#apply_marquee_to_default', 'apply_marquee_to_default' ],
  ];

  for (let i = 0; i < list.length; i++) {
    (function(n) {
      $(list[n][0]).off('input').on('input', function() { localStorage.setItem(list[n][1], $(this).val()); });
    })(i);
  }

  for (let i = 0; i < checkboxes.length; i++) {
    (function(n) {
      $(checkboxes[n][0]).off('change').change(function() { localStorage.setItem(checkboxes[n][1], this.checked); });

      if (localStorage.getItem( checkboxes[n][1] ) != null && localStorage.getItem( checkboxes[n][1] ) == 'true' ) {
        $(checkboxes[n][0]).attr('checked', '');
      }
    })(i);
  }
}

async function putAllLinks() {
  const linkList = [
    [ '#github', 'https://github.com/S4WA/SoundCloud-Player' ],
    [ '#hp', 'https://akiba.cloud/soundcloud-player/' ],
    [ '#yt', 'https://youtu.be/hIJyF2u3-RY' ],
    [ '#feedback', 'https://forms.gle/oG2DvmK7HXhq8q8ZA' ],
    [ '#support', 'https://ko-fi.com/sawanese' ], 
    [ '.wiki', 'https://github.com/S4WA/SoundCloud-Player/wiki' ],
    [ '#eshortcuts' , 'chrome://extensions/shortcuts' ],
    [ '#captureguide', 'https://github.com/S4WA/SoundCloud-Player/wiki/For-Streamers-and-Gamers#using-the-green-screen-soundcloud-player-embed' ],
    [ '#privacy', 'https://akiba.cloud/soundcloud-player/privacy-policy' ]
  ];
  for (let i = 0; i < linkList.length; i++) {
    $(linkList[i][0]).on('click', () => { openURL(linkList[i][1]); });
  }
}

async function initDarkmode() {
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

function repeat() {
  if (json['repeat'] == null || $('#repeat') == null) return;
  queue('repeat').then(update);
  $('#repeat').attr( 'mode', json['repeat'] );
}

function goBackToMain() {
  location.href = 'popup.html?' + (isPopout() ? 'p=1' : '');
}

async function registerEvents() {
  $('#fav').off('click').on('click', () => { queue('fav'); });
  $('#prev').off('click').on('click', () => { queue('prev'); });
  $('#next').off('click').on('click', () => { queue('next'); });
  $('#artwork,.title,.breathing').off('click').on('click', () => { openSCTab(); return false; });
  $('#repeat').off('click').on('click', () => { repeat(); });
  $('#toggle').off('click').on('click', () => { queue('toggle'); });
  $('#shuffle').off('click').on('click', () => { queue('shuffle'); });
  $('#follow_icon').off('click').on('click', () => { queue('follow'); })
  $('.copynp').off('click').on('click', () => {
    copyToClipboard( replaceText(localStorage.getItem('copy')) );
  });
  $('#toggle-compact').off('change').change(function () {
    console.log(this.checked)
    if (this.checked) {
      queue('request-data');
      startMarquees();
    }
    $('#controller-body').css('display', (keyReady = this.checked) ? 'inline-block' : 'none');
  });
  $('#dropdown-animation').off('change').change(function() {
    localStorage.setItem('dropdown-animation', $(this).prop('checked') ? 'true' : 'false');
  });
  $('#display-artwork').off('change').change(function() { toggleArtwork(this.checked); });
  $('#tsTheme').off('change').change(function() { refreshTSo( $(this).val() ); });
}

async function checkIfCompactIsEnabled() {
  let e = localStorage.getItem('compact_in_settings') != null && localStorage.getItem('compact_in_settings') == 'true' && json['title'] != null;
  $('#controller-body').css('display', e ? 'inline-block' : 'none');
}

async function initDarkModeAutomation() {
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

function refreshTSo(name, inital) {
  name = name.toLowerCase();

  $('#tsOptions').html('').html($(tsOptions + (name == 'marquee' ? mqOptions : '')));
  localStorage['back-and-forth'] = String(name == 'breathing');
  $(`#tsTheme option[value='${ localStorage['back-and-forth'] == 'true' ? 'breathing' : 'marquee' }']`).attr('selected', 'true');

  initInputs();
  registerEvents();
  checkMarqueesDurations();
}

var json = {}, or = false, dark = false, checkTimer = null, tsA = false,
  // text-scrolling, marquee, 
  tsOptions = `<tr>
    <th>Enable Text Scrolling on the default theme.</th>
    <td><input id='apply_marquee_to_default' type='checkbox'></td>
  </tr>
  <tr>
    <th>Theme</th>
    <td>
      <select id='tsTheme'>
        <option value='marquee'>Marquee</option>
        <option value='breathing'>Breathing</option>
      </select>
    </td>
  </tr>`,
  mqOptions = `<tr>
      <th>Speed for title text scrolling</th>
      <td><input id='duration' type='number' step='500' style='width: 45px; height: 14px;'> ms</td>
    </tr>
    <tr>
      <th>Pause length</th>
      <td><input id='pause' type='number' step='500' style='width: 45px; height: 14px;'> ms</td>
    </tr>
    <tr>
      <th>Duplication</th>
      <td><input type='checkbox' id='duplication'></td>
    </tr>`;