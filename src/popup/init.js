document.addEventListener('DOMContentLoaded', () => {
  for (key in settings) {
    if (localStorage.getItem(key) == null) {
      let value = typeof settings[key] == 'string' ? settings[key] : JSON.stringify(settings[key]);
      localStorage.setItem(key, value);
    } else {
      let item = localStorage.getItem(key);
      settings[key] = (key != 'email' ? item : JSON.parse(item));
      // console.log(key, item);
    }
  }

  updateThemeColor();
  updateFont();
  updateBGcolor();
  updateFontSize();

  if (isPopout()) {
    $('#P').css('display', 'none');
  }

  // setInterval(function() {
  //   var currentTime = new Date()
  //   var hours = currentTime.getHours()
  //   var minutes = currentTime.getMinutes()
  //   if (minutes < 10){
  //       minutes = "0" + minutes
  //   }
  //   var t_str = hours + ":" + minutes + " ";
  //   if(hours > 11){
  //       t_str += "PM";
  //   } else {
  //      t_str += "AM";
  //   }
  // }, 1000);
});

var settings = {
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