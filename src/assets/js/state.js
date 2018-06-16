
var browser = (function () {
    return window.msBrowser ||
        browser ||
        chrome;
})();
var settings = {
    isActive: true,
    comments: {}
}

var commentsRepoURL = 'https://gist.githubusercontent.com/capJavert/2e80f4da21e4e9664f7dc04642d5fc15/raw/dee82497c1ab32c6008fdba831411db253c58598/clippy.json'
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

            var iconName = 'src/assets/img/clippy-icon' + (settings.isActive ? '' : '-gray');
            browser.browserAction.setIcon({
                path: {
                    16: iconName + '-48x48.png',
                    24: iconName + '-48x48.png',
                    32: iconName + '-48x48.png'
                },
                tabId: tabs[index].id
            });
        }
    });
});

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.name) {
        case 'isActive':
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
    }

    return true;
});
