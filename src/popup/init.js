document.addEventListener('DOMContentLoaded', () => {
  (function() {
    const prefix = "[SoundCloud Player]";
    for (const m of ["log", "warn", "error", "info", "debug"]) {
      const orig = console[m];
      console[m] = orig.bind(console, prefix);
    }
  })();

  document.title = 'SoundCloud Player';
  new Promise((resolve, reject) => {
    for (const key in settings) {
      if (localStorage.getItem(key) == null) {
        const value = (typeof settings[key] == 'string' || typeof settings[key] == 'number' || typeof settings[key] == 'boolean') ? settings[key] : JSON.stringify(settings[key]);
        // save items to localstorage if it doesn't exist.
        localStorage.setItem(key, value);
      } else {
        // import from localstorage
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
});

let debug = false;
const settings = {
      'trackdisplay': '%title% by %artist%',
      'themecolor': '#FF5500',
      'bgcolor': '#121212',
      'twitter': '%title% by %artist% %url%',
      'threads': '%title% by %artist% %url%',
      'bsky': '%title% by %artist% %url%',
      'copy': '%title% by %artist% %url%',
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
      'apply_marquee_to_legacy': false,
      'remember-window-size': false,
      'compact_in_settings': false,
      'window-width': 265,
      'window-height': 340,
      'always-show-slider': false,
    };