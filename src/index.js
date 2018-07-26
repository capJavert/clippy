import './assets/scss/main.scss'
import './assets/js/plugins.js'
import {BrowserEnum, whichBrowser} from './assets/js/helpers/which-browser.js'

window.onload = () => {
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
  }

  animatePosterLogo()
  adjustClippyLogo()
  stickyNavigation()
}

function animatePosterLogo() {
  const svgDocument = document.querySelector('.PosterImage-object').contentDocument
  const foregroundCircle = svgDocument.querySelector('.ForegroundCircle')
  const backgroundCircle = svgDocument.querySelector('.BackgroundCircle')
  const gradient1 = {
    1: svgDocument.querySelector('.Gradient1-1'),
    2: svgDocument.querySelector('.Gradient1-2'),
    3: svgDocument.querySelector('.Gradient1-3')
  }

  setInterval(function() {
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
