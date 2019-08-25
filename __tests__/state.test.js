window.webStorageObject = require('../src/assets/js/web-storage-object')

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
    browser = {
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
                    version: 2
                }
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
        browserAction: {
            setIcon() {},
            onClicked: {
                addListener(listener) {
                    this.listener = listener
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
    require('../src/assets/js/state')
})

afterEach(() => {
    jest.resetModules();
})

test('isActive listener', () => {
    expect.assertions(2)

    browser.runtime.onMessage.listener({ name: 'isActive' }, {}, (response) => {
        expect(response).toEqual({
            name: 'isActive',
            value: true
        })
    })

    window.settings.isActive = false

    browser.runtime.onMessage.listener({ name: 'isActive' }, {}, (response) => {
        expect(response).toEqual({
            name: 'isActive',
            value: false
        })
    })
})

test('comments listener', () => {
    function XMLHttpRequest() {
        return {
            send() {
                if (typeof this.onreadystatechange() === 'function') {
                    this.onreadystatechange()
                }
            },
            open() {
                this.readyState = 4
                this.status = 200
                this.response = JSON.stringify(dictionary)
            }
        }
    }
    global.XMLHttpRequest = XMLHttpRequest

    browser.runtime.onMessage.listener({ name: 'comments' })

    expect(window.settings.comments).toEqual(dictionary)
})

test('idle listener', () => {
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

    window.settings.isActive = false
    browser.runtime.onMessage.listener({ name: 'idle' })
    jest.runAllTimers()

    expect(lastId).toBeUndefined()
    expect(lastMessage).toBeUndefined()

    window.settings.isActive = true
    browser.runtime.onMessage.listener({ name: 'idle' })
    jest.runAllTimers()

    expect(lastId).toEqual(1)
    expect(lastMessage).toEqual({
        name: 'animate',
        value: true
    })
})

it('should toggle button icons on click', () => {
    expect.assertions(tabs.length * 2)

    browser.browserAction.setIcon = (payload) => {
        expect(payload.path).toBeDefined()
        expect(payload.tabId).toBeDefined()
    }

    browser.browserAction.onClicked.listener()
})

it('should toggle isActive status on click', () => {
    expect.assertions(tabs.length * 2)
    window.settings.isActive = true

    browser.tabs.sendMessage = (tabId, message) => {
        expect(tabId).toBeDefined()
        expect(message).toEqual({
            name: 'isActive',
            value: false
        })
    }

    browser.browserAction.onClicked.listener()
})
