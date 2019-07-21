import './assets/scss/main.scss'
import './assets/js/plugins.js'
import {BrowserEnum, whichBrowser} from './assets/js/helpers/which-browser.js'

var browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.safari ||
        window.chrome
})()
var extensionId = 'oaknkllfdceggjpbonhiegoaifjdkfjd'
// var extensionId = 'lgmkadnbhjgdhbaplihfcpggfghddmed' // dev extension id
var actionSwitchInput = document.querySelector('.Toolbar-actionSwitch input')
var animationInterval = null
var refreshInterval = null

window.addEventListener('load', function() {
  const browserPlatform = whichBrowser()

  if ([BrowserEnum.chrome, BrowserEnum.firefox, BrowserEnum.opera].indexOf(browserPlatform) > -1) {
    document.querySelectorAll('.Button-download').forEach(element => {
      element.style.display = 'none'
    })

    switch(browserPlatform) {
    case BrowserEnum.chrome:
      document.querySelector('.Button-download-chrome').style.display = 'inline-block'
      break
    case BrowserEnum.firefox:
      document.querySelector('.Button-download-firefox').style.display = 'inline-block'
      break
    case BrowserEnum.opera:
      document.querySelector('.Button-download-opera').style.display = 'inline-block'
      break
    }

    if(browser) {
      refreshInterval = setInterval(function() {
        checkClippyStatus()
      }, 5000)

      checkClippyStatus()
    }
  }

  animatePosterLogo()
  adjustClippyLogo()
  stickyNavigation()
  clippySwitchButton()
})

window.addEventListener('unload', function() {
  if (refreshInterval != null) {
    clearInterval(refreshInterval)
  }
  if (animationInterval != null) {
    clearInterval(animationInterval)
  }
})

function animatePosterLogo() {
  const svgDocument = document.querySelector('.PosterImage-object').contentDocument
  const foregroundCircle = svgDocument.querySelector('.ForegroundCircle')
  const backgroundCircle = svgDocument.querySelector('.BackgroundCircle')
  const gradient1 = {
    1: svgDocument.querySelector('.Gradient1-1'),
    2: svgDocument.querySelector('.Gradient1-2'),
    3: svgDocument.querySelector('.Gradient1-3')
  }

  animationInterval = setInterval(function() {
    const color = {
      1: [Math.floor(Math.random() * 30) + 48, Math.floor(Math.random() * 30) + 158, Math.floor(Math.random() * 10) + 242],
      2: [Math.floor(Math.random() * 30) + 47, Math.floor(Math.random() * 10) + 239, Math.floor(Math.random() * 20) + 117],
      3: [Math.floor(Math.random() * 30) + 35, Math.floor(Math.random() * 30)+ 92, Math.floor(Math.random() * 10)+ 237]
    }

    TweenLite.to(foregroundCircle, .8, {rotation: Math.floor(Math.random() * 50) + 60, transformOrigin: '50% 50%'})
    TweenLite.to(backgroundCircle, .8, {rotation: Math.floor(Math.random() * 360), transformOrigin: '50% 50%'})

    TweenLite.to(gradient1[1], .4, {stopColor: 'rgb(' + color[1].toString() + ')'})
    TweenLite.to(gradient1[2], .4, {stopColor: 'rgb(' + color[2].toString() + ')'})
    TweenLite.to(gradient1[3], .4, {stopColor: 'rgb(' + color[3].toString() + ')'})
  }, 600)
}

function adjustClippyLogo() {
  const svgDocument = document.querySelector('.Header-logo object').contentDocument
  const foregroundCircle = svgDocument.querySelector('.ForegroundCircle')
  const backgroundCircle = svgDocument.querySelector('.BackgroundCircle')

  foregroundCircle.setAttribute('stroke-width', 4)
  foregroundCircle.setAttribute('r', 14)
  backgroundCircle.setAttribute('r', 20)
}

function stickyNavigation() {
  const headerDownloadElem = document.querySelector('.Toolbar-download')
  const headerMainElem = document.querySelector('.Header-main')
  const stickyActivationPoint = headerMainElem.offsetTop + headerMainElem.offsetHeight

  toggleStickyNavigation(stickyActivationPoint, headerDownloadElem)
  window.onscroll = () => {
    toggleStickyNavigation(stickyActivationPoint, headerDownloadElem)
  }
}

function toggleStickyNavigation(activationPoint, element) {
  const documentElement = document.documentElement
  const documentOffsetTop = (window.pageYOffset || documentElement.scrollTop)  - (documentElement.clientTop || 0)

  if(documentOffsetTop >= activationPoint && documentOffsetTop != 0) {
    element.classList.add('Toolbar-fixed')
    element.classList.add('Toolbar-opaque')
    document.body.className = 'Fixed Fixed-toolbar'
  } else {
    element.classList.remove('Toolbar-fixed')
    element.classList.remove('Toolbar-opaque')
    document.body.className = null
  }
}

function checkClippyStatus() {
  browser.runtime.sendMessage(extensionId,
    {name: 'WHAT_IS_THE_MEANING_OF_LIFE'},
    function(response) {
      if (!response) {
        // removeClippy()
        document.querySelector('.Section-clippyActive').classList.add('Section-hidden')
        document.querySelector('.Section-download').classList.remove('Section-hidden')
        document.querySelector('.Toolbar-actionDownload').classList.remove('hidden')
        document.querySelector('.Toolbar-actionSwitch').classList.add('hidden')

        return
      }

      clearInterval(refreshInterval)

      document.querySelector('.Section-clippyActive').classList.remove('Section-hidden')
      document.querySelector('.Section-download').classList.add('Section-hidden')
      document.querySelector('.Toolbar-actionDownload').classList.add('hidden')

      if (!response.value.isActive) {
        document.querySelector('.Toolbar-actionSwitch').classList.remove('hidden')
      }

      actionSwitchInput.checked = response.value.isActive
    }
  )
}

function clippySwitchButton() {
  actionSwitchInput.addEventListener('click', function(e) {
    browser.runtime.sendMessage(extensionId,
      {name: 'RISE'},
      function(response) {
        if (!response) {
          return
        }

        actionSwitchInput.checked = response.value
      }
    )
  })
}

function removeClippy() {
  var clippy = document.querySelector('.clippy')

  if (clippy != null) {
    document.body.removeChild(clippy)
  }
}
