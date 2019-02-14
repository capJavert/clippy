
var browser = (function () {
    return window.msBrowser ||
        browser ||
        chrome ||
        createBrowser ? createBrowser(true) : undefined;
})();

var settings = new webStorageObject.LocalStorageObject(
  {
    isActive: true,
    comments: {}
  },
  'settings',
  false
);

var idleTime = 15000;
var getCommentsRepoURL = function () {
    return 'https://raw.githubusercontent.com/capJavert/clippy-dictionary/master/clippy.json?v=' + new Date().getTime()
}
var loadComments = function () {
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', getCommentsRepoURL(), true);

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
           settings.comments = JSON.parse(xhttp.response);

            browser.tabs.query({}, function(tabs) {
                for (var index in tabs) {
                    browser.tabs.sendMessage(
                        tabs[index].id,
                        {
                            name: 'comments',
                            value: settings.comments
                        }
                    );
                }
            });
        }
    };
    xhttp.send();
}
var toggleIcon = function (tab) {
    var iconName = 'src/assets/img/clippy-icon' + (settings.isActive ? '' : '-gray');
    browser.browserAction.setIcon({
        path: {
            16: iconName + '-48x48.png',
            24: iconName + '-48x48.png',
            32: iconName + '-48x48.png'
        },
        tabId: tab.id
    });
}

var sendActive = function (tab) {
    browser.tabs.sendMessage(
        tab.id,
        {
            name: 'isActive',
            value: settings.isActive
        }
    );
}

var toggleClippy = function() {
  settings.isActive = !settings.isActive;

  browser.tabs.query({}, function(tabs) {
      for (var index in tabs) {
          sendActive(tabs[index]);
          toggleIcon(tabs[index]);
      }
  });
}

browser.browserAction.onClicked.addListener(function() {
  toggleClippy();
});

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.name) {
        case 'isActive':
            browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs.length > 0) {
                    toggleIcon(tabs[0]);
                }
            });

            sendResponse(
                {
                    name: 'isActive',
                    value: settings.isActive
                }
            );
            break;
        case 'comments':
            loadComments();
            break;
        case 'idle':
            if (settings.isActive) {
                setTimeout(function(){
                    if (!settings.isActive) {
                        return;
                    }

                    browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        if (tabs.length > 0) {
                            browser.tabs.sendMessage(
                                tabs[0].id,
                                {
                                    name: 'animate',
                                    value: true
                                }
                            );
                        }
                    });
                }, idleTime);
            }
            break;
    }

    return true;
});

browser.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  switch (request.name) {
    case 'WHAT_IS_THE_MEANING_OF_LIFE':
      var manifest = chrome.runtime.getManifest();

      sendResponse({
          name: 'SILENCE_MY_BROTHER',
          value: {
            installed: true,
            isActive: settings.isActive || false,
            version: manifest.version
          }
      });
      break
    case 'RISE':
      toggleClippy();
      sendResponse({
          name: 'SILENCE_MY_BROTHER',
          value: settings.isActive || false
      });
  }

  return true;
});
