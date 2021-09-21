document.addEventListener("DOMContentLoaded", () => {
  for (key in settings) {
    if (localStorage.getItem(key) == null) {
      let value = typeof settings[key] == "string" ? settings[key] : JSON.stringify(settings[key]);
      localStorage.setItem(key, value);
    } else {
      let item = localStorage.getItem(key);
      // console.log(key, item);
      settings[key] = (key != "email" ? item : JSON.parse(item));
    }
  }

  updateThemeColor();
  updateFont();
});

var settings = {
  "trackdisplay": "%title% by %artist%",
  "themecolor": "#f50",
  "twitter": "%title% By %artist% %url%",
  "facebook": "%url%",
  "tumblr": "%title% By %artist%",
  "email": {
    "subject": "%title% By %artist%",
    "body": "%url%"
  },
  "copy": "%title% By %artist% %url%",
  "font": "Meiryo"
}