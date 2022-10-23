document.addEventListener('DOMContentLoaded', () => {
  document.title = 'SoundCloud Player';
  new Promise((resolve, reject) => {
    for (key in settings) {
      if (localStorage.getItem(key) == null) {
        let value = (typeof settings[key] == 'string') ? settings[key] : JSON.stringify(settings[key]);
        localStorage.setItem(key, value);
      } else {
        let item = localStorage.getItem(key);
        settings[key] = (key != 'email' ? item : JSON.parse(item));
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

  $('#version').text('v' + chrome.runtime.getManifest().version);
});

var json = {}, settings = {
  'trackdisplay': '%title% by %artist%',
  'themecolor': '#FF5500',
  'bgcolor': '#3F3F3F',
  'twitter': '%title% By %artist% %url%',
  'facebook': '%url%',
  'tumblr': '%title% By %artist%',
  'email': {
    'subject': '%title% By %artist%',
    'body': '%url%'
  },
  'copy': '%title% By %artist% %url%',
  'font': 'Arial',
  'font-size': '12px',
  'theme': 'default',
  'duration': 5000,
  'pause': 5000,
  'duplication': false,
  'dropdown-animation': true,
  'display-artwork': true
}