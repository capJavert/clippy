
var browser = window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();
var settings = {
    isActive: true
}

browser.browserAction.onClicked.addListener(function() {
    settings.isActive = !settings.isActive;

    browser.tabs.query({}, function(tabs) {
        for (var index in tabs) {
            browser.tabs.sendMessage(
                tabs[index].id,
                {
                    name: "isActive",
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
                    name: "isActive",
                    value: settings.isActive
                }
            )
            break
    }

    return true;
});
