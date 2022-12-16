document.addEventListener('DOMContentLoaded', () => {
  document.title = 'SoundCloud Player';
  new Promise((resolve, reject) => {
    for (key in settings) {
      if (localStorage.getItem(key) == null) {
        let value = (typeof settings[key] == 'string'
          || typeof settings[key] == 'number'
          || typeof settings[key] == 'boolean'
          ) ? settings[key] : JSON.stringify(settings[key]);
        localStorage.setItem(key, value);
      } else {
        let o = isJsonString(localStorage.getItem(key));
        settings[key] = o == null ? localStorage.getItem(key) : o;
      }
    }
    resolve();
  }).then(() => {
    updateThemeColor();
    updateFont();
    updateBGcolor();
    updateFontSize();
    return;
  }).then(() => {
    initKeyboardBinds();
  });

  $('#version').text('v' + browser.runtime.getManifest().version);

  if (settings['darkmode_automation'] != null && settings['darkmode_automation']['enabled']) {
    darkmode(nightTime());
  }
});

var prefix = '[SoundCloud Player]', json = {}, settings = {
  'trackdisplay': '%title% by %artist%',
  'themecolor': '#FF5500',
  'bgcolor': '#3F3F3F',
  'twitter': '%title% By %artist% %url%',
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
  'darkmode_automation': {
    'enabled': false,
    'range-start': [ 17, 0 ],
    'range-end': [ 5, 0 ]
  },
  'simple-label': false,
  'popout-dupe': true,
  'back-and-forth': false,
  'apply_marquee_to_default': false,
}