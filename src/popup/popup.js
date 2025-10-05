document.addEventListener('DOMContentLoaded', () => {
  Promise.all([
    // initialization (checks if the page itself is a window or a popup)
    init(),
    // checks if popup itself is ready to show elements 
    // (they're unnecessary when there's no sc tab.)
    checkElements(),
    // checks which theme is selected & sets appropriate theme
    setTheme(),
    // adds event listeners for each buttons.
    registerEvents(),
    registerUniversalEvents(),
    checkDisplayArtwork(),
    queue('request-data'),
    checkMultipleWindow(),
  ]);
});

// Initialize:
async function init() {
  // No Duplicate Popout
  if (isPopout()) {
    document.querySelector("#P").style.display = "none";
    document.querySelector("#settings").attr("href", "settings.html?p=1");
  }
  const verDOM = document.querySelector('#version');
  if (verDOM) verDOM.innerText = `v${chrome.runtime.getManifest().version}`;
  const slider = document.querySelector("#volume-slider");
  if (settings['always-show-slider'] && slider) {
    slider.classList.add("always-show");
  }
}

async function checkElements() {
  let results = await chrome.tabs.query({ url: '*://soundcloud.com/*' });

  let arg = results.length != 0 && results[0].status == 'complete';
  keyReady = arg;
  toggleElements(arg);

  // if simple-label is enabled, all of .innerText will be emptied.
  if (settings['simple-label'] && getThemeName() != 'default') {
    document.querySelector("#store").innerText = "SC PLYR";
    // $('#share_btn,#settings,#thelink > div.right > div:nth-child(1) > span').contents().each(function() { if (this.nodeType === Node.TEXT_NODE) this.remove(); });
    removeTextNodes();
  }
}

// remove text nodes
function removeTextNodes() {
  const elements = document.querySelectorAll('#share_btn, #settings, .thelink > .right > div:nth-child(1) > span');
  elements.forEach(element => {
    Array.from(element.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.remove();
      }
    });
  });
}

// they are hidden when there's no sc-tab.
async function toggleElements(visibility) {
  const hideList = [
    /*
      style: {
        "property name": [
          "value when the argument is true", "value when false"
        ],
        "property-2": "singular = only when it's false, the property needs value replacement; otherwise remain the value."
      }
     */
    {
      selector: "#second",
      style: {
        "display": ["block", "none"]
      }
    },
    {
      selector: '#controller-body[mode="compact"] #time',
      style: {
        "display": ["inline-block", "none"]
      }
    },
    {
      selector: '.container',
      style: {
        "display": ["inline-block", "none"]
      },
    },
    {
      selector: '#controller-body > hr:nth-child(4)',
      style: {
        "display": ["block", "none"]
      }
    },
    {
      selector: "#artwork",
      style: {
        "backgroundImage": "url(../icon.png)"
      }
    },
    // Buttons and their attrs below.
    {
      selector: "#fav",
      attr: {
        "favorite": "false"
      }
    },
    {
      selector: "#shuffle",
      attr: {
        "shuffle": "false"
      }
    },
    {
      selector: "#repeat",
      attr: {
        "mode": ""
      }
    },
    {
      selector: "#follow",
      attr: {
        "followed": "false"
      }
    },
    {
      selector: "#toggle",
      attr: {
        "playing": "false"
      }
    },
    {
      selector: "#controller-body[mode='modern'] #time",
      style: {
        "display": ["block", "none"]
      }
    },
    {
      selector: "#controller-body[mode='modern'] div",
      style: {
        "padding-bottom": ["6.5px", "0"]
      }
    },
    {
      selector: "#controller-body[mode='modern']",
      style: {
        "padding-bottom": ["6.5px", "0"]
      }
    }
  ]
  for (let hideThis of hideList) {
    const selector = hideThis["selector"], el = document.querySelector(selector);
    if (el == null) continue;

    // set each element's styles.
    if (hideThis["style"]) {
      const styleProperties = Object.keys(hideThis["style"]), styles = hideThis["style"];

      // for each property in style
      for (let property of styleProperties) {
        const isArray = Array.isArray(styles[property]), vu = isArray ? styles[property][visibility ? 0 : 1] : styles[property];

        // ignore(continue for loop) if the element has already that value OR (it's not an array && there's sc-tab.)
        if (getComputedStyle(el)[property] === vu || (!isArray && visibility)) continue;

        // DEBUG:
        // console.log(selector, property, vu)
        // console.log(`Arg: ${visibility} | ${selector}: ${property} =${getComputedStyle(el)[property]}=> ${vu}`)

        // apply value into target property.
        el.style[property] = vu;
      }
    }

    if (hideThis["attr"]) {
      const attrNames = Object.keys(hideThis["attr"]), attrs = hideThis["attr"];
      for (let name of attrNames) {
        // same thing
        const isArray = Array.isArray(attrs[name]), vu = isArray ? attrs[name][visibility?0:1] : attrs[name];

        // ignore in the same condition as styles.
        if (el.attr(name).toLowerCase() === vu.toLowerCase() || (!isArray && visibility)) continue;
        el.attr(name, vu);
        // console.log(name, vu)
      }
    }
  }
}

async function registerEvents() {
  const arr = [
    {
      selector: "#twitter, #threads, #bsky",
      event: "click",
      handler: (event) => {
        openURL( shareLink(event.target.id.toLowerCase()) );
      }
    },
    {
      selector: "#P",
      event: "click",
      handler: async () => {
        let t = chrome.runtime.getURL(''); // 'chrome-extension://<extension-id>/'
        await chrome.tabs.query({active:true, url: `${t + (t.endsWith('/') ? '' : '/')}popup/*.html?p=1`}).then(async (val) => {
          if (val[0] == null || (localStorage['popout-dupe'] != null && localStorage['popout-dupe'] == 'true')) {
            await popup('../popup/popup.html?p=1', 'a');
            return;
          }
          await chrome.windows.update(val[0].windowId, {focused: true});
        });
        window.close();
      }
    },
    {
      selector: "#store",
      event: "click",
      handler: () => {
        openURL('https://akiba.cloud/soundcloud-player/');
      }
    },
    {
      selector: "#share_btn",
      event: "click",
      handler: () => {
        const share = document.querySelector('#share'), isVisible = (share.style['display'] !== 'none' && share.style['display'] !== '');
        if (settings["dropdown-animation"]) {
          isVisible ? slideUp(share) : slideDown(share);
        } else {
          share.style.display = isVisible ? 'none' : 'block';
        }
      }
    },
    {
      selector: "#share_with_time",
      event: "input",
      handler: (event) => {
        share_with_time = event.target.checked;
        setShareLink(json);
      }
    },
    {
      selector: "#social .clipboard",
      event: "click",
      handler: () => {
        let text = replaceText(settings['copy']);
        if (text.includes(json['link']) && share_with_time) {
          text = text.replace(json['link'], json['link'] + '#t=' + json['time']['current']);
        }
        copyToClipboard( text );
      }
    },
    {
      selector: "#copy",
      event: "focus",
      handler: () => {
        document.querySelector('#copy').select();
        // be careful because there's another #copy with different function in settings page...
      }
    },
    {
      selector: "#volume-slider",
      event: "change",
      handler: async (e) => {
        const range = e.target, newNum = Number(range.value);
        sliderEditing = true;

        range.gap = newNum - range.oldNum;
        range.oldNum = newNum;

        const isPositive = range.gap > 0;
        let count = Math.floor( Math.abs(range.gap)/10 );

        while (count >= 0) {
          if (count > 0) {
            await queue(isPositive ? "up" : "down"); // does it have to be async/await?
          } else {
            sliderEditing = false;
          }
          --count;
        }

        if (showSlider) showSlider();
      }
    }
  ];

  arr.forEach(({ selector, event, handler }) => {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener(event, handler);
    });
  });
}

function shareLink(social) {
  social = social.toLowerCase();
  let data = JSON.parse( sessionStorage.getItem('data') ); 
  // console.log(data);
  let text = replaceText( settings[social] );
  if (share_with_time) {
    text = text.replace( data['link'], data['link'] + '#t=' + data['time']['current'] );
  }
  return links[social].replace( '%text%', fixedEncoder(text) );
}

async function updateDescription() {
  let   description       = await getDescription();
  const descriptionBody   = document.querySelector("#description")
  const descriptionChild  = document.querySelector("#description .dd-child");
  const descriptionParent = document.querySelector("#description .dd-parent");

  if (!description) return;
  const isEmpty = description.length < 1;

  console.log(descriptionBody)

  // If the description is empty, return and invis.
  if (isEmpty) {
    descriptionBody.style.display = 'none';
    if (debug) console.log("%cNo description.", "color:white; background-color:red; padding:2px 4px; border-radius:4px;")
    return;
  } else {
    descriptionBody.style.display = 'block';
    if (debug) {
      console.log("%cObtained description:", "color:white; background-color:purple; padding:2px 4px; border-radius:4px;", description);
    }
  }
  description = description.split("\n");

  // Clear description
  descriptionChild.innerHTML = ""

  // For-loop each line in the description.
  for (let i = 0; i < description.length; i++) {
    const line = description[i];
    const wordsAndLinks    = splitTextAndLinks(line)
    const paragraphElement = document.createElement("p");

    if (wordsAndLinks.length > 0) {
      // Pretty devious work here. Erasing margins if the array is not empty.
      // Contrally, if it's an empty line, let margins as is, creating a visible blank line.
      // - Which it will follow with original description the track has.
      // - Without doing so, there will be no blank lines in the description. 

      // margin-top:    if it's the first line, add margin, anything else = 0.
      // margin-bottom: if it's the last line, add margin, anything else = 0.
      Object.assign(paragraphElement.style, {
        marginTop: i === 0 ? '12px' : 0,
        marginBottom: i === description.length-1 ? "12px" : 0,
        wordBreak: "break-word",
      });
    }

    // For-loop words and links in one line.
    for (let textObject of wordsAndLinks) {
      const isLink  = textObject.type === 'link';
      const content = textObject.value;
      let wordElement; // DOM element (span or a).

      if (isLink) {
        // If it's a link, insert a tag.
        const polishedLink = normalizeLink(content);

        // href != "#", because I want to show the actual link and not a link with "chrome-extension://" scheme.
        wordElement = Object.assign(document.createElement("a"), { innerText: content, className: "exception", href: polishedLink }); 
        wordElement.addEventListener("click", (event) => {
          openURL(polishedLink); // normalize link in case if it doesn't have scheme.
          event.preventDefault();
        });
      } else {
        // If not span.
        wordElement = Object.assign(document.createElement("span"), { innerText: content });
      }
      // Append each word to a paragraph.
      paragraphElement.appendChild(wordElement);
    }
    // Append each paragraph to div element.
    descriptionChild.appendChild(paragraphElement);
  }
}

async function getDescription() {
  if (!json || !json.link) return null;
  const url = `https://soundcloud.com/oembed?format=json&url=${json.link}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    return result?.description;
  } catch (error) {
    return error.message;
  }
}

// Variables
var dark = false, or = false, checkTimer = null, share_with_time = false, sliderEditing = false, 
  links = {
    'twitter': 'https://twitter.com/intent/tweet?text=%text%&hashtags=NowPlaying',
    'threads': 'https://www.threads.com/intent/post?text=%text%',
    'bsky': 'https://bsky.app/intent/compose?text=%text%'
  };