var companies = DATA;

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (tab.url) query(tab.url, tabId);
});

chrome.tabs.onCreated.addListener(handleTab);

function handleTab(tab) { if (tab.url) query(tab.url, tab.id); }

function query(url, tabId) {
  var funding = companies[getHost(url)];
  if (funding !== undefined) {
    var formatted = formatDollars(funding[0]);
    chrome.browserAction.setBadgeText({ text: formatted[0], tabId: tabId });
    chrome.browserAction.setBadgeBackgroundColor({ color: formatted[1], tabId: tabId });
  } else {
    chrome.browserAction.disable(tabId);
  }
}

chrome.browserAction.onClicked.addListener(function(tab) {
  var funding = companies[getHost(tab.url)];
  if (funding) chrome.tabs.create({ url: 'http://crunchbase.com' + funding[1] });
});

function formatDollars(num) {
    if (num >= 1000000000) {
        return [Math.floor(num / 1000000000) + 'B', '#1C3F0B'];
    } else if (num >= 1000000) {
        return [Math.floor(num / 1000000) + 'M', '#35601F'];
    } else if (num >= 1000) {
        return [Math.floor(num / 1000) + 'K', '#53823B'];
    }
    return [num, '#9CC189'];
}

function getHost(url) {
  var parser = document.createElement('a');
  parser.href = url;
  return parser.hostname.replace('www.', '');
}

chrome.browserAction.setIcon({ path: 'white.png' });
