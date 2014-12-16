var companies = DATA;

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (tab.url) query(tab.url, tabId);
});

chrome.tabs.onCreated.addListener(handleTab);

function handleTab(tab) { if (tab.url) query(tab.url, tab.id); }

function query(url, tabId) {
  var funding = findCompanyByHostAndPath(getHostAndPath(url));
  if (funding !== undefined) {
    var formatted = formatDollars(funding[0]);
    chrome.browserAction.setBadgeText({ text: formatted[0], tabId: tabId });
    chrome.browserAction.setBadgeBackgroundColor({ color: formatted[1], tabId: tabId });
  } else {
    chrome.browserAction.disable(tabId);
  }
}

chrome.browserAction.onClicked.addListener(function(tab) {
  var funding = findCompanyByHostAndPath(getHostAndPath(tab.url));
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
    return [String(num), '#9CC189'];
}

function reverseString(string) {
  return string.split('').reverse().join('');
}

function getHost(url) {
  if (url.indexOf('/') === -1) { return url; }
  return url.substring(0, url.indexOf('/'));
}

function getPath(url) {
  if (url.indexOf('/') === -1) { return ''; }
  return url.substring(url.indexOf('/')).replace(/\/$/, '');
}

function firstPathSegment(path) {
  if (path.indexOf('/') === -1) { return ''; }
  return path.replace(/^\//, '').split('/')[0];
}

// given some.long.subdomain.google.com returns information for google
// given some.long.subdomain.google.com/admob returns information for admob
function findCompanyByHostAndPath(url) {
  var hostParts = getHost(url).split('.');
  var path = getPath(url);

  var matches = [];

  function test(url, testUrl) {
    return url.indexOf(testUrl) === 0;
  }

  function scoreUrl(u) {
    var score = 0;

    if (getHost(u) === hostParts.join('.')) { score++; }

    if (!getPath(u)) {
      score++;
    } else if (firstPathSegment(getPath(u)) === firstPathSegment(path)) {
      score += 1.5;
    }

    return score;
  }

  while (hostParts.length > 1) {
    var a = reverseString(hostParts.join('.'));
    var aPath = path && reverseString(path) + a;

    // iterate through each company url
    Object.keys(companies).forEach(function(url) {
      var b = reverseString(url.substring(0, url.indexOf('/')));
      var bPath = reverseString(url);

      // test with full paths, then with just the tab path, then with neither
      if ((aPath && test(bPath, aPath)) || test(bPath, a) || (b && test(b, a))) {
        var result = companies[url];
        result.url = url;
        matches.push(result);
      }
    });

    if (matches.length) {
      return matches.sort(function (a, b) {
        return scoreUrl(b.url) - scoreUrl(a.url);
      })[0];
    }

    // discard a path segment, e.g. blog.google.com → google.com
    hostParts.shift();
  }
}

function getHostAndPath(url) {
  var parser = document.createElement('a');
  parser.href = url;
  return parser.hostname.replace(/^www-?\d{0,2}\./, '') + parser.pathname;
}

chrome.browserAction.setIcon({ path: 'white.png' });
