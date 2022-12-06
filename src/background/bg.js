if (this.chrome != null) {
  this.browser = chrome;
}

const names = [
  'open',
  'toggle',
  'prev',
  'next',
  'fav',
  'repeat',
  'shuffle',
  'mute',
  'up',
  'down',
  'seekb',
  'seekf' 
];

browser.commands.onCommand.addListener(async (command) => {
  command = command.toLowerCase();
  if (!names.includes(command)) return;
  // console.log(command);
  if (command == 'open') {
    let [ScTab] = await browser.tabs.query({ url: '*://soundcloud.com/*' });
    let [currentTab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });

    if (!currentTab) {
      return;
    }
    
    if (!ScTab) {
      await browser.tabs.create({ url: "https://soundcloud.com/" });
      return;
    }

    if (currentTab.windowId != ScTab.windowId) {
      await browser.windows.update(ScTab.windowId, { focused: true });
    }

    if (currentTab.id != ScTab.id) {
      await browser.tabs.update(ScTab.id, { active: true });
    } else {
      await queue('open');
    }
  } else {
    queue(command);
  }
});

async function queue(command) {
  return new Promise(async(resolve, reject) => {
    let results = await browser.tabs.query({ url: '*://soundcloud.com/*' });
    if (results != null && results.length != 0 && results[0].status == 'complete') {
      resolve(browser.tabs.sendMessage(results[0].id, {'type': command}));
    }
  });
} 