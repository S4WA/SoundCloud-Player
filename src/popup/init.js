document.addEventListener('DOMContentLoaded', () => {
  document.title = 'SoundCloud Player';
  new Promise((resolve, reject) => {
    for (const key in settings) {
      if (localStorage.getItem(key) == null) {
        const value = (typeof settings[key] == 'string'
          || typeof settings[key] == 'number'
          || typeof settings[key] == 'boolean'
          ) ? settings[key] : JSON.stringify(settings[key]);
        localStorage.setItem(key, value);
      } else {
        const obj = isJsonString(localStorage.getItem(key));
        settings[key] = obj == null ? localStorage.getItem(key) : obj;
      }
    }
    resolve();
  }).then(() => {
    updateThemeColor();
    updateFont();
    updateBGcolor();
    updateFontSize();
    initDarkmode();
    return;
  }).then(() => {
    initKeyboardBinds();
  });
  if (document.querySelector('#version')) document.querySelector('#version').innerText = `v${chrome.runtime.getManifest().version}`;
});

var prefix = '[SoundCloud Player]', json = {}, settings = {
  'trackdisplay': '%title% by %artist%',
  'themecolor': '#FF5500',
  'bgcolor': '#262626',
  'twitter': '%title% By %artist% %url%',
  'threads': '%title% By %artist% %url%',
  'bsky': '%title% By %artist% %url%',
  'copy': '%title% By %artist% %url%',
  'font': 'Arial',
  'font-size': '12px',
  'theme': 'default',
  'duration': 5000,
  'pause': 5000,
  'duplication': false,
  'dropdown-animation': true,
  'display-artwork': true,
  'startpage': 'https://soundcloud.com',
  'simple-label': false,
  'popout-dupe': true,
  'back-and-forth': false,
  'apply_marquee_to_default': false,
  'remember-window-size': false,
  'window-width': 265,
  'window-height': 340,
};