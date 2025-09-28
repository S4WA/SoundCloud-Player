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

// An Array object consists with default-keymaps that are unassigned (even pressed keys match they will ignored, thus shortcut handlers won't be executed).
let unassigned = [];

// INITIALIZATION
function initKeyboardBinds() {
  // EXECUTE INIT FUNCTIONS
  initKeybindsInLocalstorage();
  initUnassignedBindsFromLocalStorage();
  // KEYDOWN EVENT HANDLER
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

  // Verification.
  if (keyReady == false) return; // Ignore events if popup is not ready to interact with content script yet.

  // Ignore keydown events when compact player's not enabled in settings.html
  const disabledInSettingsPage = loc('settings.html') && localStorage['compact_in_settings'] != null && !Bool(localStorage['compact_in_settings']);
  if (disabledInSettingsPage) return;

  for (const item of shortcuts) {
    const { default_keys, overridden_keys, command, handler } = item;

    if (formElementIsFocused) continue;

    // Ignroe if shortcuts are unassigned.
    if (isUnassigned(item)) return;

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
let overlayObj; // The current overlay.
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
    if (isUnassigned(item)) {
      document.getElementById(remapUI.elementID).previousElementSibling.appendChild(Object.assign(document.createElement("p"), {className: "bold", innerText: "(UNASSIGNED)", style: "margin: 0;"}));
    }

    // PREPARE REBINDING HANDLER.
    row.querySelector("th").addEventListener("click", () => {
      if (currentlyEditingBindMapper) return;
      currentlyEditingBindMapper = item;
      const focusedDOM     = document.getElementById(remapUI.elementID); // Targeted DOM to remap keymaps.
      const currentKeys = formatLabel(item.overridden_keys ?? item.default_keys);

      // Create an overlay.
      displayOverlay(item, focusedDOM, currentKeys);
    });
  }
}

function displayOverlay(binderData, binderDOM, formatLabel) {
  overlayObj = createOverlay({
    contentHTML: `<p>PRESS ANY KEY TO OVERRIDE A SHORTCUT: <span class='bold'>${binderData.remapUI.label.toUpperCase()}</span></p>
    <p>
      Currently assigned as:
      <span id='currentkeybindindialog' class='bold clickable'>${formatLabel}</span>
    </p>
    <p>
    <table>
      <tr>
        <td id="dialogcancelbutton" class="clickable">[CANCEL]</td>
        <td id='resetbuttonindialog'class='clickable'>[RESET]</td>
        <td id="unassignbutton" class="clickable">[UNASSIGN]</td>
        <td id="dialogcanceldone" class="clickable">[DONE]</td>
      </tr>
    </table>
    </p>`,
    onRemove: () => {
      // When overlay is removed
      cancelProcedure();
      overlayObj = null;
    }
  });

  // DOM Elements
  const cancelButton      = overlayObj.overlay.querySelector("#dialogcancelbutton");
  const doneButton        = overlayObj.overlay.querySelector("#dialogcanceldone");
  const keybindDialogText = overlayObj.overlay.querySelector("#currentkeybindindialog");
  const resetDialogButton = overlayObj.overlay.querySelector("#resetbuttonindialog");
  const unassignButton    = overlayObj.overlay.querySelector("#unassignbutton");

  // Styling buttons
  if (binderData.overridden_keys) {
    resetDialogButton.classList.add('bold');
  }
  if (isUnassigned(binderData)) {
    unassignButton.innerText = "[ASSIGN]";
    unassignButton.classList.add("bold");
  }

  // Add EventListeners
  keybindDialogText.addEventListener("click", () => {
    currentlyEditingBindMapper = binderData;
    binderDOM.innerText = "[...]"; // here you go hardcoding again.
    keybindDialogText.innerText = "[...]";
  });

  cancelButton.addEventListener("click", () => {
    cancelProcedure();
    overlayObj.remove();
    overlayObj = null;
  });

  doneButton.addEventListener("click", () => {
    cancelProcedure();
    overlayObj.remove();
    overlayObj = null;
  });

  resetDialogButton.addEventListener("click", () => {
    unregisterKeybind(binderData, binderDOM);
    currentlyEditingBindMapper = null;
  });

  unassignButton.addEventListener("click", () => {
    if (!isUnassigned(binderData)) {
      unassignKeybind(binderData);
      unassignButton.classList.add("bold");
    } else {
      assignKeybind(binderData);
      unassignButton.classList.remove("bold");
    }
  });
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
      overlayObj = createOverlay({
        contentHTML: `<p class='bold'>ARE YOU SURE?</p>
        <p>
        <table>
          <tr>
            <td id="noreseteveryshortcut" class="clickable">[NO]</td>
            <td id='yesreseteveryshortcut'class='clickable'>[YES]</td>
          </tr>
        </table>
        </p>`,
        onRemove: () => {
          // When overlay is removed
          cancelProcedure();
          overlayObj = null;
        }
      });

      // Set properties
      document.getElementById("yesreseteveryshortcut").addEventListener("click", function () {
        unregisterKeybindAll();
        overlayObj.remove();
        overlayObj = null;
      });

      document.getElementById("noreseteveryshortcut").addEventListener("click", function () {
        overlayObj.remove();
        overlayObj = null;
      });
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
  let stored = isJsonString(localStorage.getItem("overridden_keybinds"));
  if (!stored) {
    stored = [];
    localStorage.setItem("overridden_keybinds", "[]");
  }
  for (const s of stored) {
    // Obtain a shortcut that matches default keymap.
    const match = shortcuts.find(v => arraysEqual(s.default_keys, v.default_keys));
    if (match) {
      match.overridden_keys = s.overridden_keys;
    }
  }
}

function initUnassignedBindsFromLocalStorage() {
  let stored = isJsonString(localStorage['unassigned_keybinds']);
  if (!stored) {
    stored = []
    localStorage.setItem('unassigned_keybinds', JSON.stringify(stored));
  }

  unassigned = stored;
}

// VERIFY KEYMAPS
function verifyKeybind(keymap, nonSpecialKeysExist) {
  // THIS FUNCTION RETURNS BOOLEAN DATA TYPE.
  // - TRUE  = registered successfully.
  // - FALSE = failed.
  // NOTE: I forgot why I did this. Seems pointless for now.

  if (!keymap) {
    // Null check
    console.log("verifyKeybind: return false @ null check")
    return false;
  }
  if (!nonSpecialKeysExist){
     // Ignore when keydown event only holds special keys like "Shift".
    console.log("verifyKeybind: return false @ special-keys check");
    return false;
 }

 console.log(`verifyKeybind:${keymap}`)

  // Obtain localStorage and parse as a JS Object.
  const stored = isJsonString(localStorage.overridden_keybinds);
  if (!stored) {
    cancelProcedure();
    console.log("verifyKeybind: return false @ localStorage check");
    return false; // If there's no localStorage, return. This exist just in case.
  }

  // VARIABLES;
  const binderData = currentlyEditingBindMapper // an object containing all data of one keybind (command, default_keys, overridden_keys, remapUI, handler).
  const binderDOM  = document.getElementById(binderData.remapUI.elementID);


  // IF PRESSED KEYS ARE JUST "ESCAPE" KEY THEN RETURN.
  if (Array.isArray(keymap) && keymap.length === 1 && keymap[0] === "Escape") {
    cancelProcedure();
    console.log("verifyKeybind: return false @ Escape key check");
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
      console.log("verifyKeybind: return false @ conflict check");
      return false;
    }
  }

  // IS IT SAME AS THE DEFAULT KEYBIND?
  if (arraysEqual(binderData.default_keys, keymap)) {
    if (binderData.overridden_keys) {
      // This is when user's trying to reset the keybind manually, thereby proceed the registration.

      unregisterKeybind(binderData, binderDOM);

      // REFACTORING.
      currentlyEditingBindMapper = null;
      console.log("verifyKeybind: return true @ reset to default");
      return true;
    }
    // This contrarily is when user is trying to bind the same keymap as the default, thereby drop the process.
    cancelProcedure();
    console.log("verifyKeybind: return false @ bind same as default");
    return false;
  }

  // --- If function reaches here it means the keymap is legitimate. ---
  binderData.overridden_keys = keymap;
  registerKeybind(binderData, binderDOM, keymap);

  // REFACTORING VARIABLE & RETURN TRUE.
  currentlyEditingBindMapper = null;
  console.log("verifyKeybind: return true @ successful registration");
  return true;
}

// REGISTER KEYMAP: UPDATE VARIABLES, LOCALSTORAGE, DOM ELEMENT.
function registerKeybind(binderData, binderDOM, keymap) {
  const stored = isJsonString(localStorage.overridden_keybinds);
  // UPDATE DOM ELEMENT.
  const formatMap     = formatLabel(keymap);
  binderDOM.innerText = formatMap;
  binderDOM.previousElementSibling.classList.add("bold"); // Highlight because it's customed.
  if (overlayObj?.overlay.querySelector("#currentkeybindindialog")) {
    overlayObj.overlay.querySelector("#currentkeybindindialog").innerText = formatMap;
    overlayObj.overlay.querySelector("#resetbuttonindialog").classList.add('bold');
  }

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
  const formatMap = formatLabel(binderData.default_keys);
  binderData.overridden_keys = null;
  binderDOM.innerText        = formatMap;
  binderDOM.previousElementSibling.classList.remove("bold");
  if (overlayObj?.overlay.querySelector("#currentkeybindindialog")) {
    overlayObj.overlay.querySelector("#currentkeybindindialog").innerText = formatMap;
    overlayObj.overlay.querySelector("#resetbuttonindialog").classList.remove('bold');
  }
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

    unregisterKeybind(item, document.getElementById(item.remapUI.elementID));
  }
}

function unassignKeybind(binderData) {
  if (isUnassigned(binderData)) return;
  const binderDOM = document.getElementById(binderData.remapUI.elementID);

  // Updating the variable.
  unassigned.push([...binderData.default_keys]);
  // Overwriting the localStorage.
  localStorage.setItem('unassigned_keybinds', JSON.stringify(unassigned));

  if (overlayObj?.overlay.querySelector("#currentkeybindindialog")) {
    const el = overlayObj.overlay.querySelector("#unassignbutton");
    el.innerText = "[ASSIGN]"
    el.classList.add("bold");
  }
  binderDOM.previousElementSibling.appendChild(Object.assign(document.createElement("p"), {className: "bold", innerText: "(UNASSIGNED)", style: "margin: 0;"}));
}

function assignKeybind(binderData) {
  if (!isUnassigned(binderData)) return;
  const binderDOM = document.getElementById(binderData.remapUI.elementID);

  // Create another Array without the target and overwrite the variable with it.
  const keymap = binderData.default_keys;
  unassigned = unassigned.filter(target => !arraysEqual(target, binderData.default_keys));
  // Overwriting the localStorage.
  localStorage.setItem('unassigned_keybinds', JSON.stringify(unassigned));

  if (overlayObj?.overlay.querySelector("#currentkeybindindialog")) {
    const el = overlayObj.overlay.querySelector("#unassignbutton");
    el.innerText = "[UNASSIGN]"
    el.classList.remove("bold");
  }
  binderDOM.previousElementSibling.querySelector("p").remove();
}

function isUnassigned(binderData) {
  if (!binderData) return;
  return unassigned.some(target => arraysEqual(target, binderData.default_keys));
}

function cancelProcedure() {
  if (!currentlyEditingBindMapper) return;
  // Revert DOM element and nullify 'currentlyEditingBindMapper'.
  const keys = currentlyEditingBindMapper.overridden_keys ?? currentlyEditingBindMapper.default_keys; // Obtain the keymap to display.
  const formatMap = formatLabel(keys);
  document.getElementById(currentlyEditingBindMapper.remapUI.elementID).innerText = formatMap;
  if (overlayObj?.overlay.querySelector("#currentkeybindindialog")) {
    const keybindDialogText = overlayObj.overlay.querySelector("#currentkeybindindialog");
    keybindDialogText.innerText = formatMap;
    keybindDialogText.classList.add('editing');
  }
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
