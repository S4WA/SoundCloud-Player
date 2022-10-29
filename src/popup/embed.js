document.addEventListener('DOMContentLoaded', () => {
  init();

  document.title = 'SoundCloud Player Embed';

  $('#title').on('click', function() {
    return false;
  });
});

// Initialize:
async function init() {
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
        
        // Controller
        keyReady = true;
        return val;
      }
      return {};
    }).then((val) => {
      json = val;
    });

    let [ScTab] = await chrome.tabs.query({ url: '*://soundcloud.com/*' });

    // If sc tab is closed -> reload the popup.html (itself)
    if (keyReady && ScTab == null) {
      location.reload(); // RESET EVERYTHING!
    }
  }, 1500);
}

async function update(val) {
  // set artwork (text)
  if (val['artwork'] != null && val['artwork'] != json['artwork']) {
    $('#artwork').css('background-image', val['artwork']);
  }

  // set title (text)
  if (val['artwork'] != null && val['title'] != json['title']) {
    $('#title').text(val['title']);

    if (marqueeReady == false) {
      marqueeReady = true;
      startMarquees();
    }
    $('#title').attr('href', val['link']);
    $('#artist').text(val['artist']);
  }

  // set favorite status (true/false)
  if (val['favorite'] != null && val['favorite'] != json['favorite']) {
    $('#fav').attr( 'favorite', val['favorite'] );
  }
}
var marqueeReady = false;