
var clippyHTML = '<div id="clippy-assistant-talk-bubble" class="clippy-assistant-talk-bubble"> <span id="clippy-assistant-comment-text"></span> <div class="clippy-assistant-talk-bubble-border"></div></div><figure class="clippy-assistant-clippy"></figure>';
var clippy = {
    width: 150,
    height: 139,
    comments: {
        'facebook.com': 'It looks like you are spending too much time at this Face page...<br> Maybe take a break?',
        'google.com': 'Maybe try bing? wink wink...',
        'stackoverflow.com': 'Need help? <br><br> You could have just asked me...',
        'reddit.com': 'I think this guys need a serious redesign!!',
        'localhost': 'It works! Good job!'
    },
    init: function() {
        var link = document.createElement('link');
        link.href = '/assets/css/clippy.css'
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.media = 'screen';
        document.head.appendChild(link);

        this.clippyContainer = document.createElement('div');
        this.clippyContainer.className = 'clippy-assistant-container';
        this.clippyContainer.innerHTML = clippyHTML;
        document.body.appendChild(this.clippyContainer);

        console.log("Clippy loaded");
    },
    talk: function () {
        var talkBubble = document.getElementById('clippy-assistant-talk-bubble');
        var talkTextContainer = document.getElementById('clippy-assistant-comment-text');
        talkTextContainer.innerText = '';

        var hostname = window.location.hostname;
        hostname = hostname.replace('www.', '');

        if (this.comments[hostname] !== null) {
            talkTextContainer.innerText = this.comments[hostname];
            talkBubble.style.display = 'block';

            talkBubble.style.bottom = this.bubbleBottomOffset(talkBubble.innerHeight) + "px"

            console.log("Clippy talked", this.comments[hostname]);
        } else {
            talkBubble.style.display = 'none';

            console.log("Clippy did not talk");
        }
    },
    bubbleBottomOffset: function (bubbleHeight) {
        return this.height + 50 + bubbleHeight
    }
};

window.addEventListener('load', function () {
    clippy.init();
    clippy.talk();
}, false)