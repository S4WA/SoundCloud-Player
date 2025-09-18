
// default shortcut
// - rules: Shift, Control, Meta, Alt should never hold which side it is, remove "Right"/"Left" in the text.
const shortcuts = [
  {
    command: "toggle",
    default_keys: [ "Space" ],
    overridden_keys: null,
    remapUI: {
      elementID: "bind_toggle",
      label: "Play or Pause",
    }
  },
  {
    command: "up",
    default_keys: [ "Shift", "ArrowUp" ],
    overridden_keys: null,
    remapUI: {
      elementID: "bind_up",
      label: "Increase Volume",
    },
    handler: showSlider,
  },
  {
    command: "down",
    default_keys: [ "Shift", "ArrowDown" ],
    overridden_keys: null,
    remapUI: {
      elementID: "bind_down",
      label: "Decrease Volume",
    },
    handler: showSlider,
  },
  {
    command: "mute",
    default_keys: [ "KeyM" ],
    overridden_keys: null,
    remapUI: {
      elementID: "bind_mute",
      label: "Mute Volume",
    }
  },
  {
    command: "repeat",
    default_keys: [ "Shift", "KeyL" ],
    overridden_keys: null,
    remapUI: {
      elementID: "bind_repeat",
      label: "Toggle repeat (Single, All, None)",
    }
  },
  {
    command: "fav",
    default_keys: [ "KeyL" ],
    overridden_keys: null,
    remapUI: {
      elementID: "bind_fav",
      label: "Like/Unlike the track",
    }
  },
  {
    command: "shuffle",
    default_keys: [ "Shift", "KeyS" ],
    overridden_keys: null,
    remapUI: {
      elementID: "bind_shuffle",
      label: "Toggle Shuffle",
    }
  },
  {
    command: "prev",
    default_keys: [ "Shift", "ArrowLeft" ],
    overridden_keys: null,
    remapUI: {
      elementID: "bind_prev",
      label: "Previous Track",
    }
  },
  {
    command: "next",
    default_keys: [ "Shift", "ArrowRight" ],
    overridden_keys: null,
    remapUI: {
      elementID: "bind_next",
      label: "Next Track",
    }
  },
  {
    command: "seekf",
    default_keys: [ "ArrowRight" ],
    overridden_keys: null,
    remapUI: {
      elementID: "bind_seekf",
      label: "Seek Forward",
    }
  },
  {
    command: "seekb",
    default_keys: [ "ArrowLeft" ],
    overridden_keys: null,
    remapUI: {
      elementID: "bind_seekb",
      label: "Seek Backward",
    }
  },
  {
    command: null,
    default_keys: [ "KeyQ" ],
    overridden_keys: null,
    remapUI: {
      elementID: "bind_opensc_tab",
      label: "Open SoundCloud Tab",
    },
    handler: openSCTab,
  }
];

function initKeyboardBinds() {
  // KEYDOWN EVENT HANDLER
  initKeybindsInLocalstorage();
  document.addEventListener('keydown', keybindEventHandler);
  insertShortcutTables();
}

// VOLUME CHANGE HANDLER -> ANIMATE AND SHOW VOL SLIDER
let sliderTimeout; // = setTimeout
let lastVol = 100; // TODO: fix it.
function showSlider() {
  const newVol = json['volume'];
  if (lastVol === newVol) return;
  lastVol = newVol;

  const slider = document.querySelector("#volume-slider");
  if (!slider) return; // ignore if there's no slider === current page is not popup.html || current theme is not 'modern'
  if (settings['always-show-slider']) return;

  slider.classList.add("anim"); // animate slider to show up

  // clear old timeout
  if (sliderTimeout) clearTimeout(sliderTimeout);

  // set new timeout
  sliderTimeout = setTimeout(() => {
    slider.classList.remove("anim");
    sliderTimeout = null;
  }, 500);
};

// KEYDOWN EVENT HANDLER
const pressedKeys = new Set();
function keybindEventHandler(event) { // e.g.) Keydown event
  // VERIFY.
  if (keyReady == false) return; // Ignore events if popup is not ready to interact with content script yet.

  const disabledInSettingsPage = loc('settings.html') && localStorage['compact_in_settings'] != null && !Bool(localStorage['compact_in_settings']);
  if (disabledInSettingsPage) return; // ignore keydown events when compact player's not enabled in settings.html

  // FOCUSED ELEMENT VARIABLES.
  const active = document.activeElement;
  const activeTag = active?.tagName?.toLowerCase() ?? "";
  const formElementIsFocused = ["input", "select", "option", "textarea"].includes(activeTag) || active?.isContentEditable;

  // PRESSED KEYS VARIABLES.
  const pressedKeys = new Set(); // Using Set can avoid redundancy.
  const mainKey = event.code;
  const nonSpecialKeysExist = !["ShiftLeft","ShiftRight","ControlLeft","ControlRight","AltLeft","AltRight","MetaLeft","MetaRight"].includes(mainKey);
  if (event.ctrlKey) pressedKeys.add("Control");
  if (event.shiftKey) pressedKeys.add("Shift");
  if (event.altKey) pressedKeys.add("Alt");
  if (event.metaKey) pressedKeys.add("Meta");
  if (nonSpecialKeysExist) {
    pressedKeys.add(mainKey);
  }

  // REMAPPING KEYS HANDLING.
  if (currentlyEditingBindMapper) {
    if (!nonSpecialKeysExist) return; // Ignore when keydown event only holds special keys like "Shift".

    // VARIABLES   (targeted key map data, DOM element to edit & an array of pressed ekys)
    const binderData = currentlyEditingBindMapper // an object containing all data of one keybind (command, default_keys, overridden_keys, remapUI, handler).
    const binderDOM  = document.querySelector(`#${binderData.remapUI.elementID}`);
    const keymaps    = Array.from(pressedKeys);

    // IF PRESSED KEYS ARE JUST "ESCAPE" KEY THEN ACT LIKE NOTHING HAPPENED; RETURN.
    if (Array.isArray(keymaps) && keymaps.length === 1 && keymaps[0] === "Escape") {
      if (binderData) {
        const keys = binderData.overridden_keys ?? binderData.default_keys;
        binderDOM.innerText = keys.map(codeToLabel).join(" + ");
        currentlyEditingBindMapper = null; // RESET EDITING. WE GOING BACK.
        return;
      }
    }

    // CONFLICT CHECK. (No duplicated shortcuts.)
    for (const other of shortcuts) {
      if (other === binderData) continue;
      const otherKeys = other.overridden_keys?.length ? other.overridden_keys : other.default_keys;
      // Check if there's duplication (conflict) in both default_keys or existing customized keys.
      if (arraysEqual(keymaps, otherKeys) || arraysEqual(keymaps, other.default_keys)) { // If there's a conflict then reset the whole thing. No saving, act like nothing happened; RETURN.
        const keys = binderData.overridden_keys ?? binderData.default_keys;
        binderDOM.innerText = keys.map(codeToLabel).join(" + ");
        currentlyEditingBindMapper = null; // RESET EDITING. WE GOING BACK.
        return;
      }
    }

    // UPDATING BINDING VARIABLES & DOM ELEMENTS (VISUALS)
    binderData.overridden_keys = keymaps;
    binderDOM.innerText = keymaps.map(codeToLabel).join(" + ");

    // UPDATING LOCALSTORAGE
    const objects = isJsonString(localStorage.overridden_keybinds); // Obtaining localstorage that holds customized keybinds and reconvert them from string to JS Object.
    if (objects) {
      // Rewrite localstorage to save.
      for (const item of shortcuts) { // For-loop default keybinds,,,
        if (item.default_keys === binderData.default_keys) { // For-loop to find the right JS Object that holds the right data by checking default keybinds.
          // Recreating obj for the keybind to overwrite localStorage.
          const recreatedObj = {
            default_keys: binderData.default_keys, // Hold default_keys as well in order to fact check
            overridden_keys: keymaps, // Update the datum here. This is what's overwritten.
          };
          objects.push(recreatedObj);
          break; // Stop for-loops.
        } else {
          continue; // Continue for-loops.
        }
      }

      // UPDATING LOCALSTORAGE.
      localStorage.overridden_keybinds = JSON.stringify(objects); // Stringfy JS Object to save it as localStorage.
    }

    // REFACTORING VARIABLES / CANCELING EVENTS / RETURNING.
    currentlyEditingBindMapper = null;
    event.preventDefault();
    return;
  }

  // EXECUTING SHORTCUTS, COMMANDS & HANDLERS.
  for (const item of shortcuts) {
    const { default_keys, overridden_keys, command, handler } = item;

    if (formElementIsFocused) continue;

    // Check if user customized keybind and provide the right keymaps.
    const keysToMatch = overridden_keys?.length ? overridden_keys : default_keys;
    // Check if pressed keys exactly match.
    const match = keysToMatch.every(k => pressedKeys.has(k)) && keysToMatch.length === pressedKeys.size;
    if (!match) continue;

    // Executing command and handlers.
    if (command) { // Some of the shortcuts doesn't have command but has handler. (e.g. 'Open SC Tab').
      queue(command).then((val) => {
        if (handler) handler(val);
      });
    } else if (handler) {
      handler();
    }
    // Canceling the keydown event.
    event.preventDefault();
    break;
  }
}

// HANDLING REMAPPING SYSTEM (in settings.html)
let currentlyEditingBindMapper; // The element currently being focused to remap keybind (e.g. #mapper_toggle)
function insertShortcutTables() {
  if (!loc('settings.html')) return;

  const table = document.querySelector("#shortcuts");

  for (const item of shortcuts) {
    const { default_keys, overridden_keys, remapUI } = item;

    const keys = (overridden_keys ?? default_keys).map(codeToLabel).join(" + ");
    const row  = document.createElement("tr");
    
    row.innerHTML = `<td>${remapUI.label}</td><th id="${remapUI.elementID}">${keys}</th>`;
    table.appendChild(row);

    row.querySelector("th").addEventListener("click", () => {
      if (currentlyEditingBindMapper) return;
      currentlyEditingBindMapper = item;
      const focusedDOM = document.querySelector(`#${remapUI.elementID}`); // Targeted DOM to remap keymaps.
      focusedDOM.innerText = "[   ]";
    });
  }
}

function initKeybindsInLocalstorage() {
  // INITIALIZATION OF KEYBINDS.
  // UPDATE OVERRIDDEN_KEYS IN EACH KEYBIND FROM LOCALSTORAGE.
  const storage = localStorage.overridden_keybinds;
  if (!storage) {
    localStorage.overridden_keybinds = JSON.stringify([]);
  } else {
    const obj = isJsonString(storage); // Parse stringfied data of localStorage to JS Object.
    for (const item of obj) { // For-loop parsed data.
      for (const defaultKeybind of shortcuts) { // For-loop default keybind data.
        if (arraysEqual(item.default_keys, defaultKeybind.default_keys)) { // If both parsed data and default keybind data maches, then we can overwrite.
          defaultKeybind.overridden_keys = item.overridden_keys; // Overwrite 'shortcut'. The essense of it.
          break;
        } else {
          continue;
        }
      }
    }
  }
}
