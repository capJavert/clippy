
var browser = (function () {
    return window.msBrowser ||
        browser ||
        chrome;
})();

var settings = {
  init() {
    this._load();
  },
  _temp: {
      isActive: true,
      comments: {}
  },
  _persist: function() {
    if(this._temp) {
      localStorage.setItem('settings', JSON.stringify(this._temp));
    }
  },
  _load: function() {
    var temp = localStorage.getItem('settings');
    if(temp) {
      this._temp = JSON.parse(temp);
    }
  },
  // isActive
  get isActive() {
    this._load();
    return this._temp.isActive
  },
  set isActive(value) {
    this._temp.isActive = value
    this._persist()
  },
  // comments
  get comments() {
    this._load();
    return this._temp.comments
  },
  set comments(value) {
    this._temp.comments = value
    this._persist()
  }
}
settings.init();

var idleTime = 15000;
var commentsRepoURL = 'https://raw.githubusercontent.com/capJavert/clippy-dictionary/master/clippy.json'
var loadComments = function () {
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', commentsRepoURL, true);

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

browser.browserAction.onClicked.addListener(function() {
    settings.isActive = !settings.isActive;

    browser.tabs.query({}, function(tabs) {
        for (var index in tabs) {
            sendActive(tabs[index]);
            toggleIcon(tabs[index]);
        }
    });
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
