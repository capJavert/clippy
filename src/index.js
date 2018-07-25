import './assets/scss/main.scss'
import './assets/js/plugins.js'
import {BrowserEnum, whichBrowser} from './assets/js/helpers/which-browser.js'

$(document).ready(function() {
  var browserPlatform = whichBrowser()

  if ([BrowserEnum.chrome, BrowserEnum.firefox, BrowserEnum.opera].indexOf(browserPlatform) > -1) {
    $('.Button-download').hide()

    switch(browserPlatform) {
    case BrowserEnum.chrome:
      $('.Button-download-chrome').show()
      break
    case BrowserEnum.firefox:
      $('.Button-download-firefox').show()
      break
    case BrowserEnum.opera:
      $('.Button-download-opera').show()
      break
    }
  }

  // logo animation demo
  // TODO clear this up
  var stop1Elem = document.getElementById('stop1');
  var stop2Elem = document.getElementById('stop2');
  var stop3Elem = document.getElementById('stop3');

  // var stop3Elem = document.getElementById('stop3');
  // var stop4Elem = document.getElementById('stop4');

  setInterval(function() {
    var stop1 = [Math.floor(Math.random() * 15) + 45, Math.floor(Math.random() * 16) + 76, Math.floor(Math.random() * 13) + 133];
    var stop2 = [Math.floor(Math.random() * 14) + 74, Math.floor(Math.random() * 16) + 126, Math.floor(Math.random() * 12) + 92];
    var stop3 = [Math.floor(Math.random() * 18) + 88, Math.floor(Math.random() * 18)+ 158, Math.floor(Math.random() * 15)+ 175]

    // stop1Elem.style.stopColor = stop4Elem.style.stopColor = 'rgb(' + stop1.toString() + ')';
    // stop2Elem.style.stopColor = stop3Elem.style.stopColor = 'rgb(' + stop2.toString() + ')';
    stop1Elem.style.stopColor = 'rgb(' + stop1.toString() + ')';
    stop2Elem.style.stopColor = 'rgb(' + stop2.toString() + ')';
    stop3Elem.style.stopColor = 'rgb(' + stop3.toString() + ')';
  }, 300);
})
