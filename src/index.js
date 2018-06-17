
var browser = (function () {
    return window.msBrowser ||
        browser ||
        chrome;
})();

var clippyController = {
    agent: null,
    lastComment: null,
    animations: ['Congratulate', 'LookRight', 'SendMail', 'Thinking', 'Explain', 'IdleRopePile', 'IdleAtom', 'Print', 'GetAttention', 'Save', 'GetTechy', 'GestureUp', 'Idle1_1', 'Processing', 'Alert', 'LookUpRight', 'IdleSideToSide', 'LookLeft', 'IdleHeadScratch', 'LookUpLeft', 'CheckingSomething', 'Hearing_1', 'GetWizardy', 'IdleFingerTap', 'GestureLeft', 'Wave', 'GestureRight', 'Writing', 'IdleSnooze', 'LookDownRight', 'GetArtsy', 'LookDown', 'Searching', 'EmptyTrash', 'LookUp', 'GestureDown', 'RestPose', 'IdleEyeBrowRaise', 'LookDownLeft'],
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
                    if (this.comments[property].constructor === Array) {
                        clippyComments = clippyComments.concat(this.comments[property])
                    } else {
                        clippyComments.push(this.comments[property]);
                    }
                    break;
                }
            }
        }

        if (clippyComments.length > 0) {
            var nextComment = null;
            if (clippyComments.constructor === Array) {
                nextComment = clippyComments[Math.floor(Math.random()*clippyComments.length)];
            } else {
                nextComment = clippyComments;
            }

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
        var clippyBalloon = document.getElementsByClassName('clippy-balloon');

        if (clippyBalloon.length > 0) {
            clippyBalloon[0].style.display = state ? 'block' : 'none';
        }

        this.agent.stop();

        if (!state) {
            this.agent.play('GoodBye', 5000, function () {
                clippyController.agent.hide(true)
            });
        } else {
            clippyController.agent.show(true);
        }
    },
    fetchCommentUpdates: function () {
        browser.runtime.sendMessage({name: 'comments'});
    },
    idle: function () {
        browser.runtime.sendMessage({name: 'idle'});
    },
    animate: function () {
        this.agent.play(this.animations[Math.floor(Math.random()*this.animations.length)])
    }
};

window.addEventListener('load', function () {
    clippy.load('Clippy', function(agent){
        clippyController.init(agent);

        browser.runtime.sendMessage({name: 'isActive'}, function(response) {
            if (response.value) {
                clippyController.toggle(response.value);
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
            clippyController.animate();
            clippyController.talk();
            browser.runtime.sendMessage({name: 'idle'});
            break;
    }
});