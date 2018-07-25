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
})
