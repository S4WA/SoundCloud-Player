document.addEventListener('DOMContentLoaded', () => {
  setCompactTheme();
  if (localStorage.getItem('compact_in_settings') != null && !Bool(localStorage.getItem('compact_in_settings')) || json['title'] == null) {
    document.querySelector("#controller-body").style["display"] = "none";
  }

  initDropdown();
  initSettings();
  initTemplates();
  initInputs();
  putAllLinks();
  registerEvents();
  registerUniversalEvents();
  checkMultipleWindow();
  insertAnnouncement();
  queue('request-data');

  // if (isPopout()) {
  //   document.querySelector('#captureme').attr('href', 'embed.html?p=1');
  //   document.querySelector('#captureme').innerText = "Capture Me";
  //   document.querySelector('#captureguide').innerText = "(Guide)";
  //   // No Duplicates
  //   document.querySelector('#back').attr('href', 'popup.html?p=1');
  // }

  document.querySelector('#video .dd-parent').addEventListener('click', function() {
    document.querySelector("#video .dd-child").innerHTML = '<iframe width="100%" src="https://www.youtube.com/embed/hIJyF2u3-RY" title="Quick Tutorial for SoundCloud Player 1.3.0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    // inserting yt video embed
    // w/o doing so would ruin its performance (drops fps)
  });
});

// apply animations to every dropdown dom element
function initDropdown() {
  // Children
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach((dropdown) => {
    const isClosed = dropdown.hasAttribute('closed') ? dropdown.getAttribute('closed') === 'true' : true;
    if (isClosed) {
      const child = dropdown.querySelector('.dd-child');
      if (child) child.style.display = 'none';
    }
    if (!dropdown.hasAttribute('closed')) {
      dropdown.setAttribute('closed', 'true');
    }
  });

  // Parents
  const parents = document.querySelectorAll('.dropdown > .dd-parent');
  parents.forEach((parent) => {
    parent.classList.add('clickable');
    parent.addEventListener('click', () => {
      const dropdown = parent.parentElement;
      const value = dropdown.getAttribute('closed') === 'true';
      dropdown.setAttribute('closed', !value);
      
      const child = dropdown.querySelector('.dd-child');
      if (!child) return;

      if (localStorage.getItem('dropdown-animation') === 'true') {
        if (value) {
          slideDown(child);
        } else {
          slideUp(child);
        }
      } else {
        child.style.display = value ? 'block' : 'none';
      }
    });
  });

  // Elements
  const boxes = document.querySelectorAll('.dropdown .dd-child textarea, .dropdown .dd-child input');
  boxes.forEach((boxes) => {
    boxes.setAttribute('spellcheck', 'false');
  });
}

function checkMarqueesDurations() {
  document.querySelector('#duration').value = localStorage.getItem('duration');
  document.querySelector('#pause').value = localStorage.getItem('pause');
}

function checkFonts() {
  // - Custom Font
  if (localStorage.getItem('font') == null) return;
  document.querySelector("#font-size").value = Number( localStorage.getItem('font-size').replace('px', '') );

  const fontCheck = new Set([
    // Windows 10
    'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
    // macOS
    'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino',
    // Font Familiy
    'Times', 'Times New Roman', 'Georgia', 'serif', 'Verdana', 'Arial', 'Helvetica', 'sans-serif', 'cursive', 'fantasy', 'emoji', 'math', 'fangsong', 'Meiryo'
  ].sort());
  const fontList = document.getElementById('fontlist');

  (async() => {
    await document.fonts.ready;

    // const fontAvailable = new Set();

    for (const font of fontCheck.values()) {
      if (document.fonts.check(`12px '${font}'`)) {
        // fontAvailable.add(font);
        const option = document.createElement('option');
        option.value = font;
        option.textContent = font;
        fontList.appendChild(option);
      }
    }

    // console.log('Available Fonts:', [...fontAvailable.values()]);
    document.querySelector(`#fontlist option[value='${localStorage.getItem('font')}']`).attr('selected', 'true');
  })();
}

function checkCustomColors() {
  // #themecolor, #bgcolor and #dark-themecolor are color pickers
  // #current-theme, #current-bgcolor and #current-dark-theme are input elements
  const thColorPicker = document.querySelector('#themecolor'), bgColorPicker = document.querySelector('#bgcolor'), thDarkColorPicker = document.querySelector("#dark-themecolor")
  thInput = document.querySelector('#current-theme'), bgInput = document.querySelector('#current-bgcolor'), thDarkInput = document.querySelector("#current-dark-theme");

  // - Theme Color
  if (localStorage.getItem('themecolor') != null) {
    thColorPicker.value = localStorage.getItem('themecolor');
    thInput.value = `${ localStorage.getItem('themecolor').toUpperCase() }`;
    updateThemeColor();
  } else {
    setTimeout(function() {
      thColorPicker.value = document.documentElement.style.getPropertyValue("--theme-color").trim();
    }, 100);
  }

  // has to cooperate with one another when the other's have changed its value. same with #bgcolor and #current-bgcolor.
  // when colorpicker changes value, input's value also changes and have to hold the same value.
  thColorPicker.addEventListener('change', function() {
    thInput.value = this.value.toUpperCase();
    updateThemeColor(this.value);
  });
  // vice versa. when input changes, colorpicker's value has to hold the same value.
  thInput.addEventListener('change', function() {
    thColorPicker.value = this.value.toUpperCase();
    updateThemeColor(this.value);
  });

  // - Background color
  if (localStorage.getItem('bgcolor') !== null) {
    bgColorPicker.value = localStorage.getItem('bgcolor');
    bgInput.value = localStorage.getItem('bgcolor').toUpperCase();
    updateBGcolor();
  } else {
    setTimeout(function() {
        bgColorPicker.value = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim();
    }, 100);
  }

  bgColorPicker.addEventListener('change', function() {
    bgInput.value = this.value.toUpperCase();
    updateBGcolor(this.value);
  });

  bgInput.addEventListener('change', function() {
    bgColorPicker.value = this.value.toUpperCase();
    updateBGcolor(this.value);
  });
}

function checkTheme() {
  if (localStorage.getItem('theme') == null) return;
  const themeName = localStorage.getItem('theme');
  document.querySelector(`#theme-select option[value='${themeName}']`).attr('selected', 'true');
}

function initSettings() {
  // - Track Display
  if (localStorage.getItem('trackdisplay') != null) {
    document.querySelector("#trackdisplay").value = localStorage["trackdisplay"];
  }

  checkTheme();
  checkFonts();
  checkCustomColors();
  checkMarqueesDurations();

  if (localStorage.getItem('startpage') != null) {
    document.querySelector('#startpage').value = localStorage.getItem('startpage');
  }
}

function initTemplates() {
  // Share Templates
  // - init
  const keys = ['twitter', 'copy', 'threads', 'bsky'];
  for (let key of keys) {
    if (localStorage.getItem(key) != null) {
      document.querySelector(`#${key}`).value = localStorage.getItem(key);
    }
  }
}

function initInputs() {
  document.querySelector('#fontlist').addEventListener('input', function() {
    updateFont(this.value);
  });
  document.querySelector('#font-size').addEventListener('change', function() {
    updateFontSize(this.value + 'px');
  });

  // apply elements with values from localStorage
  // [ "#element's ID", "localStorage key" ]
  const list = [
    [ '#duration' , 'duration' ],
    [ '#pause', 'pause' ],
    [ '#twitter', 'twitter' ],
    [ '#threads', 'threads' ],
    [ '#bsky', 'bsky' ],
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
    [ '#apply_marquee_to_legacy', 'apply_marquee_to_legacy' ],
    [ '#remember-window-size', 'remember-window-size' ],
    [ '#always-show-slider', 'always-show-slider' ]
  ];

  // EVENT HANDLER with any change occur in <input> OR <textarea> OR <select> elements will automatically save values to localStorage.
  for (let i = 0; i < list.length; i++) {
    const elementID = list[i][0], settingsKey = list[i][1];
    const element = document.querySelector(elementID);
    if (element) {
      element.addEventListener('input', function() {
        localStorage.setItem(settingsKey, this.value);
        settings[settingsKey] = this.value;
      });
    }
  }
  for (let i = 0; i < checkboxes.length; i++) {
    const elementID = checkboxes[i][0], settingsKey = checkboxes[i][1];
    const element = document.querySelector(elementID);
    if (element) {
      element.addEventListener('change', function(event) {
        localStorage.setItem(settingsKey, this.checked);
        settings[settingsKey] = this.checked;
      });
      if (localStorage.getItem(settingsKey) != null && localStorage.getItem(settingsKey) == 'true') {
        element.checked = true;
      }
    }
  }
}

function putAllLinks() {
  const linkList = [
    [ '#github', 'https://github.com/S4WA/SoundCloud-Player' ],
    [ '#hp', 'https://akiba.cloud/soundcloud-player/' ],
    [ '#yt', 'https://youtu.be/hIJyF2u3-RY' ],
    // [ '#feedback', 'https://forms.gle/oG2DvmK7HXhq8q8ZA' ],
    [ '#support', 'https://ko-fi.com/sawanese' ], 
    [ '.wiki', 'https://github.com/S4WA/SoundCloud-Player/wiki' ],
    [ '#eshortcuts' , 'chrome://extensions/shortcuts' ],
    [ '#captureguide', 'https://github.com/S4WA/SoundCloud-Player/wiki/For-Streamers-and-Gamers#using-the-green-screen-soundcloud-player-embed' ],
    [ '#privacy', 'https://akiba.cloud/soundcloud-player/privacy-policy' ]
  ];
  for (let i = 0; i < linkList.length; i++) {
    const elements = document.querySelectorAll(linkList[i][0]);
    elements.forEach(element => {
      element.addEventListener('click', () => { 
        openURL(linkList[i][1]); 
      });
    });
  }
}

function goBackToMain() {
  location.href = 'popup.html?' + (isPopout() ? 'p=1' : '');
}

// 
function registerEvents() {
  const arr = [
    {
      selector: "#toggle-compact",
      event: "change",
      handler: () => {
        const checked = document.querySelector('#toggle-compact').checked;
        if (checked) {
          queue('request-data');
          startMarquees();
        }
        document.querySelector("#controller-body").style["display"] = (keyReady = checked) ? 'inline-block' : 'none';
      }
    },
    {
      selector: '#dropdown-animation',
      event: "change",
      handler: () => {
        localStorage.setItem('dropdown-animation', document.querySelector("#dropdown-animation").checked);
      }
    },
    {
      selector: '#display-artwork',
      event: "change",
      handler: (e) => { toggleArtwork(e.target.checked); }
    },
    {
      selector: "#tsTheme",
      event: "change",
      handler: () => { 
        let breathing = document.querySelector("#tsTheme").value == 'breathing';
        localStorage['back-and-forth'] = breathing;
        document.querySelectorAll('#tsOptions tr').forEach((row, index) => {
          if (index >= 4) {
            row.style.display = breathing ? 'none' : '';
          }
        });
      }
    },
    {
      selector: "#reset",
      event: "click",
      handler: () => {
        // This handler is from a removed function initResetButton().
        const countElement = document.querySelector('#count');
        let count = 1;
        
        if (countElement.textContent !== '') {
          count = Number(countElement.textContent);
          count++;
        }
        
        if (count > 3) return;
        countElement.textContent = count;

        if (count === 3) {
          const sureDiv = document.getElementById('sure');
          const div = document.createElement('div');
          div.innerHTML = `<br>ARE YOU SURE YOU WANT TO RESET EVERYTHING? There's no going back.<br><br>[<span id="yes" class="clickable">YES</span>] [<span id="no" class="clickable">NO</span>]`;
          sureDiv.appendChild(div);

          const yesNoSpans = document.querySelectorAll('#yes, #no');
          yesNoSpans.forEach(span => {
            span.addEventListener('click', (e) => {
              if (e.target.id === 'yes') localStorage.clear();
              location.reload();
            });
          });
        }
      }
    }
  ];

  arr.forEach(({ selector, event, handler }) => {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener(event, handler);
    });
  });

  document.querySelector(`#tsTheme option[value='${ localStorage['back-and-forth'] == 'true' ? 'breathing' : 'marquee' }']`).attr('selected', 'true');
  document.querySelectorAll('#tsOptions tr').forEach((tr, index) => {
    if (index >= 4) {
      tr.style.display = localStorage.getItem('back-and-forth') === 'true' ? 'none' : '';
    }
  });
}

function insertAnnouncement() {
  const messages = [
    {
      version: "1.5.0",
      date: "Sep 22, 2025",
      changes: [
        {
          title: "Added",
          items: [
            "New Default UI Theme",
            "Volume Slider",
            "Progress Bar",
            "Custom Keybinds",
          ]
        },
        {
          title: "Changed",
          items: [
            "The old default theme will remain as the 'Legacy' theme, as we introduced new default theme."
          ]
        }
      ]
    },
    {
      version: "1.4.2",
      date: "Aug 3, 2025",
      changes: [
        {
          title: "Fixed",
          items: [
            "Critical display bugs."
          ]
        },
        {
          title: "Updated",
          items: [
            "A few internal things have changed. The extensions as a whole should work smoother.",
            "Options for displays are subcategorized in smaller chunks now.",
          ]
        },
        {
          title: "Added",
          items: [
            "Option for remembering window size in popout."
          ]
        }
      ]
    }
  ];

  const announceBody = document.querySelector("#announcement");

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];      // each version's changelog.
    const date    = message?.date;    // the date of each version is published
    const version = message?.version; // e.g. 1.5.0
    const changes = message?.changes; // list of change groups.

    const messageDOM = Object.assign(document.createElement('div'), {
      innerHTML: `<span class='bold' style='font-size: 150%;'>V${version}</span> <span>${date}</span><br>`
    });

    for (let j = 0; j < changes.length; j++) {
      const change = changes[j];    // category of change.
      const title  = change?.title; // "Added", "Fixed", "Removed", etc.
      const items  = change?.items; // descriptions / list of individual changes under this category.

      const changesDOM = document.createElement("ul"); // bulletpoints for descriptions
      messageDOM.appendChild(Object.assign(document.createElement("span"), { innerText: `[${title}]` })); // DOM for "Added", etc

      for (var k = 0; k < items.length; k++) {
        const item = items[k];
        changesDOM.appendChild(Object.assign(document.createElement('li'), { innerText: item })); // each description "volume slider" ...etc.
      }

      messageDOM.appendChild(changesDOM);
    }
    announceBody.appendChild(messageDOM);
    announceBody.appendChild(document.createElement("hr"));
  }
}

var or = false, dark = false, checkTimer = null;