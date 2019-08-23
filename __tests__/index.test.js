const createBrowser = () => {
    browser = {
        runtime: {
            sendMessage() {},
            onMessage: {
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

const createAgent = () => ({
    isActive: false,
    play(animation, length, callback) {
        this.animation = animation
        this.animationLength = length
        this.callback = callback

        if (typeof this.callback === 'function') {
            this.callback()
        }
    },
    stop() {},
    show() {
        this.isActive = true
    },
    hide() {
        this.isActive = false
    },
    speak(comment) {
        this.comment = comment
    }
})

beforeEach(() => {
    createBrowser()
    require('../src/index')
})

afterEach(() => {
    jest.resetModules();
})

test('agent init', () => {
    const agent = createAgent()
    clippyController.init(agent)

    expect(clippyController.agent).not.toBeNull()
})

it('should check active status on init', () => {
    browser.runtime.sendMessage = (message, callback) => {
        if (message.name === 'isActive') {
            callback({ value: true })
        }
    }

    const agent = createAgent()
    clippyController.init(agent)

    expect(clippyController.agent.isActive).toBe(true)
})

it('should respect off switch on init', () => {
    browser.runtime.sendMessage = (message, callback) => {
        if (message.name === 'isActive') {
            callback({ value: false })
        }
    }

    const agent = createAgent()
    clippyController.init(agent)

    expect(clippyController.agent.isActive).toBe(false)
})

it('should prefetch comments on init', () => {
    expect.assertions(2)
    let commentsMessage
    browser.runtime.sendMessage = (message) => {
        if (message.name === 'comments') {
            commentsMessage = message
        }
    }

    const agent = createAgent()
    clippyController.init(agent)

    expect(commentsMessage).toEqual({ name: 'comments' })

    browser.runtime.onMessage.listener({ name: 'comments', value: dictionary })

    expect(clippyController.comments).toEqual(dictionary)
})

it('should talk', () => {
    delete global.window.location
    global.window.location = {
        hostname: 'github'
    }

    const agent = createAgent()
    clippyController.init(agent)
    clippyController.comments = dictionary
    clippyController.talk()

    expect(clippyController.lastComment).toEqual(dictionary.github)
})

test('pick random comment', () => {
    delete global.window.location
    global.window.location = {
        hostname: 'quora'
    }

    const agent = createAgent()
    clippyController.init(agent)
    clippyController.comments = dictionary
    clippyController.talk()

    expect(dictionary.quora).toContain(clippyController.lastComment)
})

it('should send idle message', () => {
    let idleMessage
    browser.runtime.sendMessage = (message) => {
        if (message.name === 'idle') {
            idleMessage = message
        }
    }

    clippyController.idle()

    expect(idleMessage).toEqual({ name: 'idle' })
})

test('animation trigger', () => {
    expect.assertions(3)
    const animations = ['Congratulate', 'LookRight', 'SendMail', 'Thinking']

    const agent = createAgent()
    clippyController.init(agent)
    clippyController.animations = animations
    clippyController.animate(() => {})

    expect(clippyController.animations).toContain(agent.animation)
    expect(agent.animationLength).toEqual(5000)
    expect(agent.callback).toBeDefined()
})
