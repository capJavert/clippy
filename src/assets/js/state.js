
var browser = (function () {
    return window.msBrowser ||
        browser ||
        chrome;
})();
var settings = {
    isActive: true,
    comments: {}
}

var idleTime = 15000;
var commentsRepoURL = 'https://gist.githubusercontent.com/capJavert/2e80f4da21e4e9664f7dc04642d5fc15/raw/47614fcf84ccad536b098a970bce8e7e90a50738/clippy.json'
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

browser.browserAction.onClicked.addListener(function() {
    settings.isActive = !settings.isActive;

    browser.tabs.query({}, function(tabs) {
        for (var index in tabs) {
            browser.tabs.sendMessage(
                tabs[index].id,
                {
                    name: 'isActive',
                    value: settings.isActive
                }
            );

            toggleIcon(tabs[index]);
        }
    });
});

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.name) {
        case 'isActive':
            browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
                toggleIcon(tabs[0]);
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
                    browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        browser.tabs.sendMessage(
                            tabs[0].id,
                            {
                                name: 'animate',
                                value: true
                            }
                        );
                    });
                }, idleTime);
            }
            break;
    }

    return true;
});
