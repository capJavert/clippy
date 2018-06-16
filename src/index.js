
var browser = (function () {
    return window.msBrowser ||
        browser ||
        chrome;
})();
var clippyHTML = '<div id="clippy-assistant-talk-bubble" class="clippy-assistant-talk-bubble"> <span id="clippy-assistant-comment-text"></span> <div class="clippy-assistant-talk-bubble-border"></div></div><figure class="clippy-assistant-clippy"><img src="' + browser.extension.getURL('src/assets/img/clippy.png') + '" alt="Clippy"></figure>';
var clippy = {
    width: 150,
    height: 139,
    comments: {},
    init: function() {
        this.createElement();
        this.fetchCommentUpdates();
    },
    talk: function () {
        var talkBubble = document.getElementById('clippy-assistant-talk-bubble');
        var talkTextContainer = document.getElementById('clippy-assistant-comment-text');
        talkTextContainer.innerHTML = '';

        var hostname = window.location.hostname;
        var clippyComment = null;

        for (var property in this.comments) {
            if (this.comments.hasOwnProperty(property)) {
                if (hostname.indexOf(property) !== -1) {
                    clippyComment = this.comments[property];
                    break;
                }
            }
        }

        if (clippyComment !== null) {
            talkTextContainer.innerHTML = clippyComment
            talkBubble.style.display = 'block';

            talkBubble.style.bottom = this.bubbleBottomOffset(talkBubble.innerHeight) + 'px'
        } else {
            talkBubble.style.display = 'none';
        }
    },
    bubbleBottomOffset: function (bubbleHeight) {
        return this.height + 50 + bubbleHeight
    },
    toggle: function (state) {
        this.element.style.display = state ? 'block' : 'none';
    },
    createElement: function () {
        if (document.getElementsByClassName('clippy-assistant-container').length > 0) {
            return;
        }

        this.element = document.createElement('div');
        this.element.className = 'clippy-assistant-container';
        this.element.innerHTML = clippyHTML;
        document.body.appendChild(this.element);
    },
    fetchCommentUpdates: function () {
        browser.runtime.sendMessage({name: 'comments'});
    }
};

window.addEventListener('load', function () {
    clippy.init();

    browser.runtime.sendMessage({name: 'isActive'}, function(response) {
        clippy.toggle(response.value);
    });

    clippy.talk();
}, false)

browser.runtime.onMessage.addListener(function(request) {
    switch (request.name) {
        case 'isActive':
            clippy.toggle(request.value)
            break;
        case 'comments':
            clippy.comments = request.value;
            clippy.talk();
            break;
    }
});