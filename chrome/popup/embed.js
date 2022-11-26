document.addEventListener('DOMContentLoaded', () => {
  Promise.all([
    init(),
    checkMultipleWindow(),
  ]);

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
}

async function update(val) {
  if (val == null) return;

  // set artwork (text)
  if (val['artwork'] != null) {
    $('#artwork').css('background-image', val['artwork']);
  }

  // set title (text)
  if (val['artwork'] != null) {
    $('#title').text(val['title']);

    if (marqueeReady == false) {
      marqueeReady = true;
      startMarquees();
    }
    $('#title').attr('href', val['link']);
    $('#artist').text(val['artist']);
  }

  // set favorite status (true/false)
  if (val['favorite'] != null) {
    $('#fav').attr( 'favorite', val['favorite'] );
  }
}

var marqueeReady = false, or = false, checkTimer = null;