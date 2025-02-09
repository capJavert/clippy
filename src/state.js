/* eslint-disable no-var */
var browser = (function createBrowser() {
    if (typeof chrome !== 'undefined') {
        return chrome
    }

    if (typeof browser !== 'undefined') {
        return browser
    }

    throw new Error('No browser found')
}())
/* eslint-enable no-var */

const initSettings = async () => {
    const initialState = {
        settings: {
            isActive: true,
            comments: {},
            ...(await browser.storage.local.get()).settings
        }
    }
    await browser.storage.local.set(initialState)
    const state = {
        ...initialState
    }

    browser.storage.onChanged.addListener((changes, namespace) => {
        if (namespace !== 'local') {
            return
        }

        Object.entries(changes).forEach(([key, { newValue }]) => {
            state.settings = {
                ...state.settings,
                [key]: newValue
            }
        })
    })

    return {
        get: () => state.settings,
        set: async (value) => {
            state.settings = {
                ...state.settings,
                ...value
            }

            await browser.storage.local.set(state.settings)
        },
    }
}

const worker = ({ settings }) => {
    let talkedAlready = false
    const idleTime = 10000
    const getCommentsRepoURL = () => `https://clippy-dictionary.kickass.website/?v=${new Date().getTime()}`
    const loadComments = async () => {
        const response = await fetch(getCommentsRepoURL())

        if (!response.ok) {
            return
        }

        const comments = await response.json()

        settings.set({
            comments
        })

        browser.tabs.query({}, (tabs) => {
            tabs.forEach((tab, index) => {
                browser.tabs.sendMessage(
                    tabs[index].id,
                    {
                        name: 'comments',
                        value: comments
                    }
                )
            })
        })
    }
    const toggleIcon = (tab) => {
        const iconName = browser.runtime.getURL(`assets/img/clippy-icon${settings.get().isActive ? '' : '-gray'}`)
        browser.action.setIcon({
            path: {
                16: `${iconName}-48x48.png`,
                24: `${iconName}-48x48.png`,
                32: `${iconName}-48x48.png`
            },
            tabId: tab.id
        })
    }

    const sendActive = (tab) => {
        browser.tabs.sendMessage(
            tab.id,
            {
                name: 'isActive',
                value: settings.get().isActive
            }
        )
    }

    const toggleClippy = () => {
        settings.set({
            isActive: !settings.get().isActive
        })

        browser.tabs.query({}, (tabs) => {
            tabs.forEach((tab, index) => {
                sendActive(tabs[index])
                toggleIcon(tabs[index])
            })
        })
    }

    browser.action.onClicked.addListener(toggleClippy)

    let idleTimeoutInstance = null

    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        switch (request.name) {
        case 'isActive':
            browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length > 0) {
                    toggleIcon(tabs[0])
                }
            })

            sendResponse(
                {
                    name: 'isActive',
                    value: settings.get().isActive
                }
            )
            break
        case 'comments':
            loadComments()
            break
        case 'idle':
            if (settings.get().isActive) {
                if (idleTimeoutInstance) {
                    clearTimeout(idleTimeoutInstance)
                }

                idleTimeoutInstance = setTimeout(() => {
                    if (!settings.get().isActive) {
                        return
                    }

                    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        if (tabs.length > 0) {
                            browser.tabs.sendMessage(
                                tabs[0].id,
                                {
                                    name: 'animate',
                                    value: true
                                }
                            )
                        }
                    })

                    talkedAlready = true
                }, talkedAlready ? idleTime : 5000)
            }
            break
        case 'toggle':
            toggleClippy()
            sendResponse({
                name: 'SILENCE_MY_BROTHER',
                value: settings.get().isActive
            })
            break
        default:
            break
        }

        return true
    })

    browser.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
        const manifest = browser.runtime.getManifest()

        switch (request.name) {
        case 'WHAT_IS_THE_MEANING_OF_LIFE':
            sendResponse({
                name: 'SILENCE_MY_BROTHER',
                value: {
                    installed: true,
                    isActive: settings.get().isActive,
                    version: manifest.version
                }
            })
            break
        case 'RISE':
            toggleClippy()
            sendResponse({
                name: 'SILENCE_MY_BROTHER',
                value: settings.get().isActive
            })
            break
        default:
            break
        }

        return true
    })
}

const init = async () => {
    const settings = await initSettings()

    worker({ settings })
}

init()
