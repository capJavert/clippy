export var BrowserEnum = Object.freeze({
  chrome: 'CHROME_BROWSER',
  firefox: 'FIREFOX_BROWSER',
  opera: 'OPERA_BROWSER',
  safari: 'SAFARI_BROWSER',
  ie: 'SHIT_BROWSER',
  edge: 'EDGE_BROWSER'
});

export function whichBrowser() {
  if((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
    return BrowserEnum.opera;
  }

  if(typeof InstallTrigger !== 'undefined') {
    return BrowserEnum.firefox;
  }

  if(!!window.chrome && !!window.chrome.webstore) {
    return BrowserEnum.chrome;
  }

  if(/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification)) {
    return BrowserEnum.safari
  }

  if(/*@cc_on!@*/false || !!document.documentMode) {
    return BrowserEnum.ie
  }

  if(!isIE && !!window.StyleMedia) {
    return BrowserEnum.edge
  }

  // other
  return null
}
