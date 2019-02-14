/**
 * Proxy methods from WebExtension API Tab object
 * @param  {SafariBrowserTab} tab SafariBrowserTab object
 * @return {Tab} object compatible with WebExtension API
 */
function tabProxy(tab) {
    return new Proxy(tab, {
        get: function(target, prop, receiver) {
            if (prop === 'id') {
                return target.page
            }

            return Reflect.get(target, prop)
        }
    })
}

/**
 * Create browser object
 *
 * @param  {[boolean]} injected If browser object will be used inside injected page
 * @return {Browser} object compatible with WebExtension API
 */
function createBrowser(injected) {
    var polyfill = injected ? safari.self : safari.application
    var callbacks = {}

    // adding special message callback to provide polyfill
    // for browser.runtime.sendMessage(message, callback)
    if (injected) {
        polyfill.addEventListener('message', function(event) {
            var callback = callbacks[event.name]
            if (callback) {
                callback(event.message)
                delete callbacks[event.name]
            }
        }, false)
    }

    return {
        extension: {
            getURL: function(path) {
                return safari.extension.baseURI + path
            }
        },
        runtime: {
            sendMessage: function(message, callback) {
                if (callback) {
                    callbacks[message.name] = callback
                }
                polyfill.tab.dispatchMessage(message.name, message)
            },
            onMessage: {
                addListener: function(callback) {
                    polyfill.addEventListener('message', function(event) {
                        var request = {
                            ...event,
                            ...event.message
                        }
                        var sender = event.target
                        var sendResponse = function(response) {
                            event.target.page.dispatchMessage(response.name, response)
                        }

                        callback(request, sender, sendResponse)
                    }, false)
                }
            }
        },
        tabs: {
            query: function(query, callback) {
                var result = null

                if (query.currentWindow) {
                    if (query.active) {
                        result = [tabProxy(polyfill.activeBrowserWindow.activeTab)]
                    } else {
                        result = polyfill.activeBrowserWindow.tabs.map(tab => tabProxy(tab))
                    }
                } else {
                    var tabs = []

                    if (query.active) {
                        polyfill.browserWindows.forEach(function(browserWindow) {
                            tabs = [
                                ...tabs,
                                tabProxy(browserWindow.activeTab)
                            ]
                        })

                        result = tabs
                    } else {
                        polyfill.browserWindows.forEach(function(browserWindow) {
                            tabs = [
                                ...tabs,
                                ...browserWindow.tabs.map(tab => tabProxy(tab))
                            ]
                        })

                        result = tabs
                    }
                }

                callback(result)
            },
            sendMessage: function(id, message) {
                id.dispatchMessage(message.name, { name: message.name, value: { ...message.value } })
            }
        },
        browserAction: {
            onClicked: {
                // TODO maybe also needs 'validate' event listener
                addListener: function(callback) {
                    polyfill.addEventListener('command', callback)
                }
            }
        }
    }
}
