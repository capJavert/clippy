
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
        }
    });
});
