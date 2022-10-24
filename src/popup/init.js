document.addEventListener('DOMContentLoaded', () => {
  document.title = 'SoundCloud Player';
  new Promise((resolve, reject) => {
    for (key in settings) {
      if (localStorage.getItem(key) == null) {
        let value = (typeof settings[key] == 'string') ? settings[key] : JSON.stringify(settings[key]);
        localStorage.setItem(key, value);
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