var companies = DATA;

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (tab.url) query(tab.url);
});

chrome.tabs.onCreated.addListener(function(tab) {
  if (tab.url) query(tab.url);
});

function query(url) {
  var funding = companies[getHost(url)];
  if (funding !== undefined) {
    chrome.browserAction.setBadgeText({ text: formatDollars(funding) });
  } else {
    chrome.browserAction.setBadgeText({ text: '?' });
  }
}

function formatDollars(num) {
    if (num >= 1000000000) return Math.floor(num / 1000000000) + 'B';
    if (num >= 1000000) return Math.floor(num / 1000000) + 'M';
    if (num >= 1000) return Math.floor(num / 1000) + 'K';
    return num;
}

function getHost(url) {
  var parser = document.createElement('a');
  parser.href = url;
  return parser.hostname.replace('www.', '');
}

chrome.browserAction.setIcon({ path: 'white.png' });
