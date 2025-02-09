/**
 * @jest-environment jsdom
 */

const tabs = [
    {
        id: 1
    },
    {
        id: 2
    },
    {
        id: 3
    }
]

const createBrowser = () => {
    const state = {
        storage: {}
    }
    const listeners = []

    global.browser = {
        runtime: {
            onMessage: {
                addListener(listener) {
                    this.listener = listener
                }
            },
            onMessageExternal: {
                addListener(listener) {
                    this.listener = listener
                }
            },
            getManifest() {
                return {
                    version: 3
                }
            },
            getURL(path) {
                return `chrome-extension://clippy${path}`
            }
        },
        tabs: {
            sendMessage() {},
            query(options, callback) {
                if (options.active && options.currentWindow) {
                    callback([tabs[0]])
                }

                callback([...tabs])
            },
        },
        action: {
            setIcon() {},
            onClicked: {
                addListener(listener) {
                    this.listener = listener
                }
            }
        },
        storage: {
            local: {
                async get() {
                    return state.storage
                },
                async set(newStorage) {
                    state.storage = {
                        ...state.storage,
                        ...newStorage
                    }

                    listeners.forEach((listener) => {
                        listener(Object.entries(newStorage).reduce((acc, [key, value]) => {
                            acc[key] = { newValue: value }

                            return acc
                        }, {}), 'local')
                    })
                },
            },
            onChanged: {
                addListener(callback) {
                    listeners.push(callback)
                }
            }
        }
    }
}

const dictionary = {
    localhost: 'It works! Good job!',
    twitter: 'Tweets can only be 280 characters long!',
    github: 'Need lessons in Python?',
    quora: [
        '????????????????',
        'What is my purpose?'
    ]
}

beforeEach(() => {
    createBrowser()
    require('../src/state')
})

afterEach(() => {
    jest.resetModules()
})

describe('Responds to messages', () => {
    test('isActive listener', async () => {
        await global.initPromise

        expect.assertions(2)

        browser.runtime.onMessage.listener({ name: 'isActive' }, {}, (response) => {
            expect(response).toEqual({
                name: 'isActive',
                value: true
            })
        })

        await browser.storage.local.set({
            isActive: false
        })

        browser.runtime.onMessage.listener({ name: 'isActive' }, {}, (response) => {
            expect(response).toEqual({
                name: 'isActive',
                value: false
            })
        })
    })

    test('comments listener', async () => {
        async function fetch() {
            return {
                ok: true,
                async json() {
                    return JSON.parse(JSON.stringify(dictionary))
                }
            }
        }
        global.fetch = fetch

        browser.runtime.onMessage.listener({ name: 'comments' })

        await new Promise(process.nextTick)

        const settings = await browser.storage.local.get()

        expect(settings.comments).toEqual(dictionary)

        delete global.fetch
    })

    test('idle listener', async () => {
        expect.assertions(4)
        jest.useFakeTimers()
        let lastId
        let lastMessage
        browser.tabs.sendMessage = (id, message) => {
            if (message.name === 'animate') {
                lastId = id
                lastMessage = message
            }
        }

        await browser.storage.local.set({
            isActive: false
        })

        browser.runtime.onMessage.listener({ name: 'idle' })
        jest.runAllTimers()

        expect(lastId).toBeUndefined()
        expect(lastMessage).toBeUndefined()

        await browser.storage.local.set({
            isActive: true
        })

        browser.runtime.onMessage.listener({ name: 'idle' })
        jest.runAllTimers()

        expect(lastId).toEqual(1)
        expect(lastMessage).toEqual({
            name: 'animate',
            value: true
        })
    })
})

describe('Toolbar controls are working', () => {
    it('should toggle button icons on click', () => {
        expect.assertions(tabs.length * 2)

        browser.action.setIcon = (payload) => {
            expect(payload.path).toBeDefined()
            expect(payload.tabId).toBeDefined()
        }

        browser.action.onClicked.listener()
    })

    it('should toggle isActive status on click', async () => {
        expect.assertions(tabs.length * 2)

        await browser.storage.local.set({
            isActive: true
        })

        browser.tabs.sendMessage = (tabId, message) => {
            expect(tabId).toBeDefined()
            expect(message).toEqual({
                name: 'isActive',
                value: false
            })
        }

        browser.action.onClicked.listener()
    })
})

describe('Responds to external messages', () => {
    test('connect listener', async () => {
        await browser.storage.local.set({
            isActive: true
        })

        browser.runtime.onMessageExternal.listener({ name: 'WHAT_IS_THE_MEANING_OF_LIFE' }, {}, (response) => {
            expect(response).toEqual({
                name: 'SILENCE_MY_BROTHER',
                value: {
                    installed: true,
                    isActive: true,
                    version: 3
                }
            })
        })
    })

    test('toggle listener', async () => {
        await browser.storage.local.set({
            isActive: true
        })

        browser.runtime.onMessageExternal.listener({ name: 'RISE' }, {}, (response) => {
            expect(response).toEqual({
                name: 'SILENCE_MY_BROTHER',
                value: false
            })
        })

        browser.runtime.onMessageExternal.listener({ name: 'RISE' }, {}, (response) => {
            expect(response).toEqual({
                name: 'SILENCE_MY_BROTHER',
                value: true
            })
        })
    })
})
