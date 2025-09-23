/**
 * Each shortcut object:
 * - command: string|null
 * - default_keys: string[]
 * - overridden_keys: string[]|null
 * - remapUI: { elementID: string, label: string }
 * - handler: function|null
 */
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

// INITIALIZATION
function initKeyboardBinds() {
  // KEYDOWN EVENT HANDLER
  initKeybindsInLocalstorage();
  document.addEventListener('keydown', keybindEventHandler);
  insertShortcutTables();

  // INSERT RESET-ALL BUTTON
  insertResetAllButton();

  // GLOBAL/BROWSER SHORTCUT HANDLING
  if (loc('settings.html')) {
    document.querySelector('#eshortcuts').innerText = `To change the shortcut for opening popup, access '${isChrome() ? 'chrome://extensions/shortcuts' : 'about:addons'}' manually.`;
    chrome.commands.getAll().then(obj => {
      const filtered = obj.filter(item => item.name === "_execute_action");
      // if user has changed the shortcut for '_execute_action' manually then also change innerText.
      if (filtered.length == 1) document.querySelector("#_exec_act_popup").innerText = filtered[0]["shortcut"];
    });
  }
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
    // Converting Set to Array.
    const keymap = Array.from(pressedKeys);
    verifyKeybind(keymap, nonSpecialKeysExist);
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

    const keys = formatLabel(overridden_keys ?? default_keys);
    const row  = document.createElement("tr");
    const customized = overridden_keys != null; // When a keybind is customized then give a different label/DOM element.

    row.innerHTML = `<td class='${customized ? "bold" : ""}'>${remapUI.label}</td><th id="${remapUI.elementID}" class='clickable'>${keys}</th>`;
    table.appendChild(row);
    insertResetButton(item);

    // PREPARE REBINDING HANDLER.
    row.querySelector("th").addEventListener("click", () => {
      if (currentlyEditingBindMapper) return;
      currentlyEditingBindMapper = item;
      const focusedDOM = document.querySelector(`#${remapUI.elementID}`); // Targeted DOM to remap keymaps.
      focusedDOM.innerText = "[...]";
    });
  }
}

function insertResetButton(binderData) {
  if (!binderData) return;
  const binderDOM  = document.querySelector(`#${binderData.remapUI.elementID}`);
  const siblingDOM = binderDOM.previousElementSibling; // td, the one that holds remapUI.label

  const customized = binderData.overridden_keys != null;
  if (!customized) return;

  if (siblingDOM.innerHTML.includes("[ RESET ]")) return;

  const resetButton = Object.assign(document.createElement("span"), { innerText: `[ RESET ]`, className: 'clickable' });

  resetButton.addEventListener("click", () => {
    unregisterKeybind(binderData, binderDOM);
    removeResetButton(binderData);
    if (currentlyEditingBindMapper) currentlyEditingBindMapper = null; // Just in case if user tries to reset a keybind while editing.
  });

  siblingDOM.appendChild(document.createElement("br"))
  siblingDOM.appendChild(resetButton);
}

function removeResetButton(binderData) {
  if (!binderData) return;
  const siblingDOMchildren = document.querySelector(`#${binderData.remapUI.elementID}`).previousElementSibling.children;

  for (let i = siblingDOMchildren.length - 1; i >= 0; i--) {
    siblingDOMchildren[i].remove();
  }
}

function insertResetAllButton() {
  if (!loc('settings.html')) return;
  const shortcuts          = document.querySelector("#shortcuts");
  const shortcutsParent    = shortcuts.parentElement;
  
  const resetDialogBody    = document.createElement("div");
  const resetEveryShortcut = Object.assign(document.createElement("span"), {
    innerText: "[ RESET EVERY SHORTCUT ]",
    className: "clickable",
    onclick: () => {
      if (shortcutsParent.innerHTML.includes("ARE YOU SURE? ")) return;

      // CREATING DOM ELEMENTS
      const suretext     = document.createElement("span");
      suretext.innerHTML = "ARE YOU SURE? ";

      const yesnobody = document.createElement("div");
      const yes       = document.createElement("span");
      const no        = document.createElement("span"); 

      // Set properties
      yes.innerText = "[ YES ]";
      yes.classList.add("clickable");
      yes.onclick = () => {
        unregisterKeybindAll();
        yesnobody.remove();
      }

      no.innerText = "[ NO ]";
      no.classList.add("clickable");
      no.onclick = () => {
        yesnobody.remove();
      }

      yesnobody.style.paddingTop = "0.35em";

      // Insertting/appending created DOM elements.
      yesnobody.appendChild(suretext);
      yesnobody.appendChild(yes);
      yesnobody.appendChild(no);
      resetDialogBody.appendChild(yesnobody);
    }
  });

  resetDialogBody.appendChild(resetEveryShortcut);
  resetDialogBody.style.paddingTop    = "0.35em";
  resetDialogBody.style.paddingBottom = "0.5em";
  shortcutsParent.insertBefore(resetDialogBody, shortcuts);
}

// INITIALIZATION OF KEYBINDS.
// UPDATE OVERRIDDEN_KEYS IN EACH KEYBIND FROM LOCALSTORAGE.
function initKeybindsInLocalstorage() {
  let stored;
  try {
    stored = JSON.parse(localStorage.getItem("overridden_keybinds") || "[]");
  } catch {
    stored = [];
    localStorage.setItem("overridden_keybinds", "[]");
  }
  for (const s of stored) {
    const match = shortcuts.find(v => arraysEqual(s.default_keys, v.default_keys));
    if (match) match.overridden_keys = s.overridden_keys;
  }
}

// VERIFY KEYMAPS
function verifyKeybind(keymap, nonSpecialKeysExist) {
  // THIS FUNCTION RETURNS BOOLEAN DATA TYPE.
  // - TRUE  = registered successfully.
  // - FALSE = failed.
  // NOTE: I forgot why I did this. Seems pointless for now.

  if (!keymap) return false;              // Null check
  if (!nonSpecialKeysExist) return false; // Ignore when keydown event only holds special keys like "Shift".

  // Obtain localStorage and parse as a JS Object.
  const stored = isJsonString(localStorage.overridden_keybinds);
  if (!stored) {
    cancelProcedure();
    return false; // If there's no localStorage, return. This exist just in case.
  }

  // VARIABLES;
  const binderData = currentlyEditingBindMapper // an object containing all data of one keybind (command, default_keys, overridden_keys, remapUI, handler).
  const binderDOM  = document.querySelector(`#${binderData.remapUI.elementID}`);


  // IF PRESSED KEYS ARE JUST "ESCAPE" KEY THEN RETURN.
  if (Array.isArray(keymap) && keymap.length === 1 && keymap[0] === "Escape") {
    cancelProcedure();
    return false;
  }

  // CONFLICT CHECK (AVOID ANY DUPLICATION)
  // - If there's a keybind (either default or customized) already exists, then don't register.
  for (const other of shortcuts) {
    if (other === binderData) continue;
    const otherKeys = other.overridden_keys ?? other.default_keys;

    // If there's duplication (conflict) in both default_keys or existing customized keys.
    if (arraysEqual(keymap, otherKeys)) {
      cancelProcedure();
      return false;
    }
  }

  // IS IT SAME AS THE DEFAULT KEYBIND?
  if (arraysEqual(binderData.default_keys, keymap)) {
    if (binderData.overridden_keys) {
      // This is when user's trying to reset the keybind manually, thereby proceed the registration.

      unregisterKeybind(binderData, binderDOM);
      removeResetButton(binderData);

      // REFACTORING.
      currentlyEditingBindMapper = null;
      return true;
    }
    // This contrarily is when user is trying to bind the same keymap as the default, thereby drop the process.
    cancelProcedure();
    return false;
  }

  // --- If function reaches here it means the keymap is legitimate. ---
  binderData.overridden_keys = keymap;
  registerKeybind(binderData, binderDOM, keymap);

  // REFACTORING VARIABLE & RETURN TRUE.
  currentlyEditingBindMapper = null;
  return true;
}

// REGISTER KEYMAP: UPDATE VARIABLES, LOCALSTORAGE, DOM ELEMENT.
function registerKeybind(binderData, binderDOM, keymap) {
  const stored = isJsonString(localStorage.overridden_keybinds);
  // UPDATE DOM ELEMENT.
  binderDOM.innerText = formatLabel(keymap);
  binderDOM.previousElementSibling.classList.add("bold");
  insertResetButton(binderData);

  // UPDATE LOCALSTORAGE
  const updateExistingObject = stored.some(obj => arraysEqual(obj.default_keys, binderData.default_keys));
  // Avoid duplication in localStorage.
  if (updateExistingObject) {
    stored.forEach(obj => {
      // Find the right target to overwrite.
      if (arraysEqual(obj.default_keys, binderData.default_keys)) {
        obj.overridden_keys = keymap;
      }
    });
  } else {
    // Create a new JS object & add it.
    stored.push({
      default_keys:    binderData.default_keys,
      overridden_keys: keymap,
    });
  }
  // Overwrite the localStorage.
  localStorage.overridden_keybinds = JSON.stringify(stored);
}

function unregisterKeybind(binderData, binderDOM) {
  const stored = isJsonString(localStorage.overridden_keybinds);

  // Update variable and DOM element.
  binderData.overridden_keys       = null;
  binderDOM.innerText              = formatLabel(binderData.default_keys);
  binderDOM.previousElementSibling.classList.remove("bold");
  // Update localStorage.
  localStorage.overridden_keybinds = JSON.stringify(
    stored.filter(
      obj => !arraysEqual(obj.default_keys, binderData.default_keys)
    )
  );
}

function unregisterKeybindAll() {
  if (currentlyEditingBindMapper) currentlyEditingBindMapper = null; // Just in case if user tries to reset a keybind while editing.}
  for (const item of shortcuts) {
    if (!item.overridden_keys) continue;

    unregisterKeybind(item, document.querySelector(`#${item.remapUI.elementID}`));
    removeResetButton(item);
  }
}

function cancelProcedure() {
  // Revert DOM element and nullify 'currentlyEditingBindMapper'.
  const keys = currentlyEditingBindMapper.overridden_keys ?? currentlyEditingBindMapper.default_keys; // Obtain the keymap to display.
  document.querySelector(`#${currentlyEditingBindMapper.remapUI.elementID}`).innerText = formatLabel(keys)
  currentlyEditingBindMapper = null; // RESET EDITING.
}

// UTILITIES.
function codeToLabel(code) {
  if (code.startsWith("Key")) return code.slice(3).toUpperCase(); // "KeyQ" → "Q"
  if (code.startsWith("Digit")) return code.slice(5).toUpperCase(); // "Digit1" → "1"
  if (code.startsWith("Arrow")) return code.replace("Arrow", "").toUpperCase(); // "ArrowUp" → "Up"
  return (code).toUpperCase();
}

function formatLabel(keymap) {
  if (!Array.isArray(keymap)) return null;
  return keymap.map(codeToLabel).join(" + ");
}
