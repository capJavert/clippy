
var browser = (function () {
    return window.msBrowser ||
        browser ||
        chrome;
})();

var clippyController = {
    agent: null,
    lastComment: null,
    comments: {},
    init: function(agent) {
        this.agent = agent
        this.fetchCommentUpdates();
    },
    talk: function () {
        var hostname = window.location.hostname;
        var clippyComments = [];

        for (var property in this.comments) {
            if (this.comments.hasOwnProperty(property)) {
                if (hostname.indexOf(property) !== -1) {
                    clippyComments.push(this.comments[property]);
                    break;
                }
            }
        }

        if (clippyComments.length > 0) {
            var nextComment = clippyComments[Math.floor(Math.random()*clippyComments.length)];

            if (nextComment !== this.lastComment) {
                this.agent.speak(nextComment);
                this.lastComment = nextComment;
            } else {
                this.lastComment = null;
            }
        } else {
            this.agent.stopCurrent();
        }
    },
    toggle: function (state) {
        state ? this.agent.show(true) : this.agent.hide(true);
        var clippyBalloon = document.getElementsByClassName('clippy-balloon');

        if (clippyBalloon.length > 0) {
            clippyBalloon[0].style.display = state ? 'block' : 'none';
        }
    },
    fetchCommentUpdates: function () {
        browser.runtime.sendMessage({name: 'comments'});
    },
    idle: function () {
        browser.runtime.sendMessage({name: 'idle'});
    }
};

window.addEventListener('load', function () {
    clippy.load('Clippy', function(agent){
        clippyController.init(agent);

        browser.runtime.sendMessage({name: 'isActive'}, function(response) {
            clippyController.toggle(response.value);

            if (response.value) {
                clippyController.idle();
            }
        });
    });
}, false)

browser.runtime.onMessage.addListener(function(request) {
    switch (request.name) {
        case 'isActive':
            clippyController.toggle(request.value)

            if (request.value) {
                clippyController.idle();
            }
            break;
        case 'comments':
            clippyController.comments = request.value;

            browser.runtime.sendMessage({name: 'isActive'}, function(response) {
                if (response.value) {
                    clippyController.talk();
                }
            });
            break;
        case 'animate':
            clippyController.agent.animate();
            clippyController.talk();
            browser.runtime.sendMessage({name: 'idle'});
            break;
    }
});