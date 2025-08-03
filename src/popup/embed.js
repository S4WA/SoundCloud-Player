document.addEventListener('DOMContentLoaded', () => {
  Promise.all([
    init(),
    checkMultipleWindow(),
  ]);

  document.title = 'SoundCloud Player Embed';

  document.querySelector('.title').addEventListener('click', (e) => { e.preventDefault(); });
});

// Initialize:
async function init() {
  queue('request-data').then((val) => {
    json = val;
    sessionStorage.setItem('data', JSON.stringify(json));
  });
}

async function update(val) {
  if (val == null) return;

  const arr = [
    {
      key: "artwork",
      handler: () => {
        if (val['artwork'] == null) return;
        document.querySelector("#artwork").style["backgroundImage"] = val['artwork'];

        document.querySelectorAll(".title").forEach(el => {
          el.innerText = val['title'];
          el.attr('href', val['link']);
        });

        startMarquees();
        document.querySelector("#artist").innerText = val['artist'];
      }
    },
    {
      key: "favorite",
      handler: () => {
        document.querySelector("#fav").attr( 'favorite', val['favorite'] );
      }
    }
  ];
}

var or = false, checkTimer = null;