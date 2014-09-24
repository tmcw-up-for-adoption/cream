var url = require('url'),
  levelup = require('levelup'),
  leveljs = require('level-js');

var currentData = {};

var Companies = levelup('companies', {
  db: leveljs,
  valueEncoding: 'json'
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  downloadUpdate();
  if (changeInfo.url) handleChange(changeInfo.url);
});

function downloadUpdate() {
  var n = 0;
  chrome.browserAction.setBadgeText({ text: 'DL' });

  var xhr = new XMLHttpRequest();
  xhr.onload = start;
  xhr.open('GET', chrome.extension.getURL('/companies-distilled.json'), true);
  xhr.send();

  function start() {
    JSON.parse(xhr.responseText)
      .forEach(function(data) {
        Companies.put(data.homepage_url, data, function() {});
      });
    chrome.browserAction.setBadgeText({ text: '' });
  }
}

function handleChange(_) {
  var parsed = url.parse(_);
  Companies.get(parsed.host, function(err, res) {
    if (err || !res) {
      currentData = {};
      return;
    }
    chrome.browserAction.setBadgeText({ text: res.funding });
    currentData = res;
  });
}

function loadDetail() {
  if (currentData && currentData.permalink) {
    chrome.tabs.create({ url: 'http://www.crunchbase.com/organization' + res.permalink });
  }
}

chrome.browserAction.setIcon({ path:'white.png' });
chrome.browserAction.onClicked.addListener(loadDetail);





