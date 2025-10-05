# Changelog

## Version 1.5.4 — Oct 5, 2025
### Added
- Description of track (experimental).
- When the extension is installed/updated, SoundCloud tabs will be automatically reloaded from now on.

---

## Version 1.5.3 — Sep 28, 2025
### Fixed
- Bug: the keybinder wasn’t activated when the user was not on the SoundCloud tab.
- Done button in overlay had no implementation but looks.

---

## Version 1.5.2 — Sep 28, 2025
### Fixed
- Bug: the keybinder didn't work properly when compact player was closed in settings page.
- Bug: the keybinder stopped working after resetting all of the settings.

### Changed
- Replaced cluttery UI for keybinder with overlay.

---

## Version 1.5.1 — Sep 23, 2025
### Fixed
- Minor bugs

---

## Version 1.5.0 — Sep 22, 2025
### Added
- New Default UI Theme
- Volume Slider
- Progress Bar
- Custom Keybinds

### Changed
- The old default theme will remain as the "Legacy" theme, as we introduced new default theme.

---

## Version 1.4.2
### Updated
- A few internal things have changed. The extension as a whole should work smoother.
- Options for displays are subcategorized in smaller chunks now.

### Added
- Option for remembering window size in popout.

[Download](https://github.com/S4WA/SoundCloud-Player/releases/tag/1.4.2)

---

## Version 1.4.0
[Details](https://github.com/S4WA/SoundCloud-Player/commit/91f7cf1cf96b662adb4d70bdd5604c0acf9b664f)  
[Download](https://github.com/S4WA/SoundCloud-Player/releases/tag/1.4.0)

---

## Version 1.3.9.2
### Fixed
- Small issues.  
[Details](https://github.com/S4WA/SoundCloud-Player/commit/1244f06f583402e6b806644e25ec75fb8693f6a7)  
[Download](https://github.com/S4WA/SoundCloud-Player/releases/tag/1.3.9.2)

---

## Version 1.3.9.1
### Fixed
- Bug that wasn't showing track info.  
[Download](https://github.com/S4WA/SoundCloud-Player/releases/tag/1.3.9.1)

---

## Version 1.3.9
### Fixed
- A bug that never displays tracks uploaded by the user.
- Grammar errors.

[54e5c06](https://github.com/S4WA/SoundCloud-Player/commit/54e5c06ace5b9707232888a3fcf626fcab556455), [7978c2a](https://github.com/S4WA/SoundCloud-Player/commit/7978c2ae48fc33d184d67f391112f5fd4affda31)  
[Download](https://github.com/S4WA/SoundCloud-Player/releases/tag/1.3.9)

---

## Version 1.3.8
### Upgraded
- jQuery (avoiding vulnerability)

### Added
- Follow Button

### Removed
- Darkmode Automation

Commits: [d1eadd6](https://github.com/S4WA/SoundCloud-Player/d1eadd612b3dfc7dd9d9dd2026f6e8259eb51344), [b5db419](https://github.com/S4WA/SoundCloud-Player/commit/b5db419647bb2653c0ad2fb4f42fd1f5215504a6), [bf75c49](https://github.com/S4WA/SoundCloud-Player/commit/bf75c49274e2327914058c01f7aa76a6137b269f)  
[Download](https://github.com/S4WA/SoundCloud-Player/releases/tag/1.3.8)

---

## Version 1.3.7.1 (Unpublished)
### Updated
- Screenshots, CSS, Background.js

<img src="https://raw.githubusercontent.com/S4WA/SoundCloud-Player/9cacf0f521f8db43eae1b7052a7018fcf73441c2/img/1.png" width="30%" height="30%" />
<img src="https://raw.githubusercontent.com/S4WA/SoundCloud-Player/9cacf0f521f8db43eae1b7052a7018fcf73441c2/img/2.png" width="30%" height="30%" />

Commits: [bd1dee7](https://github.com/S4WA/SoundCloud-Player/commit/bd1dee7dc8641797f3f5df0dfe8bf1268b4d2d57), [9cacf0f](https://github.com/S4WA/SoundCloud-Player/commit/9cacf0f521f8db43eae1b7052a7018fcf73441c2), [ca6f28d](https://github.com/S4WA/SoundCloud-Player/commit/ca6f28d696dbc1def7848e9bc64a934ccf128988), [1c79a0f](https://github.com/S4WA/SoundCloud-Player/commit/1c79a0f2decdcddae61d11993cfb7bbc82b49d1c)

---

## Version 1.3.7
### Added
- Global Shortcut

![image](https://user-images.githubusercontent.com/24929259/205882009-51464240-d669-4e02-85f4-47feb23fac73.png)

---

## Version 1.3.6.3 & 1.3.6.4
### Fixed
- Synchronization of mute icons
- Repeat shortcut

### Added
- Feature to disable pop-out duplicates.
- Feature to enable marquee in default theme.
- Simple labels.
- Breathing marquee (thanks [@apades](https://github.com/apades))

---

## Version 1.3.6.2
### Added
- Simple Label

(Reversed to Web Extension again; difference unnoticeable.)

---

## Version 1.3.6 & 1.3.6.1
Reversed to Chrome API. Tracks on multiple windows stabilized/fixed.  
1.3.6.1 includes minor bug patches.

---

## Version 1.3.5
Migrated to Web Extension.

### Added
- Start Page Option
- Dark Mode Automation ([#11](https://github.com/S4WA/SoundCloud-Player/issues/11))

### Fixed
- Minor bugs
- `Unchecked runtime.lastError`

---

## Version 1.3.4
Replaced core scripts (`contents/contents.js`, `popup/init.js`, `popup/utils.js`, `popup/popup.js`, `popup/settings.js`) for improved performance. ([#18](https://github.com/S4WA/SoundCloud-Player/issues/18), [#20](https://github.com/S4WA/SoundCloud-Player/issues/20))

### Added
- Green Screen ([#19](https://github.com/S4WA/SoundCloud-Player/issues/19))

### Removed
- Share buttons for Facebook, Tumblr, and Email ([80f4cb3](https://github.com/S4WA/SoundCloud-Player/commit/80f4cb32e12500a67ceee23e0caf20e7470ea6fe))

---

## Version 1.3.3 (Unpublished)
### Added
- Fav/Unfav Shortcut ([#15](https://github.com/S4WA/SoundCloud-Player/issues/15))
- Shifting Repeat Shortcut
- Toggle Shuffle Shortcut
- Disable Dropdown Animation ([#13](https://github.com/S4WA/SoundCloud-Player/issues/13))
- Disable Artwork ([#9](https://github.com/S4WA/SoundCloud-Player/issues/9))

### Improved
- Settings Page design

### Fixed
- Minor Bugs ([#16](https://github.com/S4WA/SoundCloud-Player/issues/16))

### Changed
- Clicking audio buttons now opens a new SoundCloud tab (due to artwork function update). ([#9](https://github.com/S4WA/SoundCloud-Player/issues/9))

[<s>Download 1.3.3.zip</s>](https://github.com/S4WA/SoundCloud-Player/releases/tag/1.3.3)

---

## Version 1.3.2
### Added
- Font Size Customization
- Feedback Form
- Compact Player
- Keyboard Shortcuts
- Volume Buttons

### Changed
- URLs

---

## Version 1.3.0 & 1.3.1 (Unpublished)
### Added
- Compact Display
- Volume Control
