# Clippy

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/oaknkllfdceggjpbonhiegoaifjdkfjd)](https://chrome.google.com/webstore/detail/clippy/oaknkllfdceggjpbonhiegoaifjdkfjd)
[![Mozilla Add-on](https://img.shields.io/amo/v/clippy-assistant)](https://addons.mozilla.org/en-US/firefox/addon/clippy-assistant/)
[![Build Status](https://travis-ci.org/capJavert/clippy.svg?branch=master)](https://travis-ci.org/capJavert/clippy)
[![Coverage Status](https://coveralls.io/repos/github/capJavert/clippy/badge.svg)](https://coveralls.io/github/capJavert/clippy)

Clippy MS Word Office asistant is now back to assist inside your browser!

![alt text](https://github.com/capJavert/clippy/raw/master/assets/img/screenshots/clippy-google.jpg "Clippy in action!")

## Features
- Adds Clippy assistant to every page
- You can enable/disable assistan globally through icon in toolbar
- On selected sites Clippy will show useful but mostly funny comments (checkout Contribute section)

## The code
You can pack this code into your custom extension for any major browser. These browsers are officially supported:
- Chrome
- Firefox (57+)
- Opera

Consult these links for guids on how to develop, test and pack extensions:
- Chrome: https://developer.chrome.com/extensions/getstarted
- Firefox: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Your_first_WebExtension
- Opera: https://dev.opera.com/extensions/basics

### Setup the code
```
$ git clone https://github.com/capJavert/clippy.git
$ cd clippy
$ npm install
```

### Contribute
Clippy fetches comments from my personal repository file: https://github.com/capJavert/clippy-dictionary/blob/master/clippy.json - Feel free to contribute new comments for your favorite sites by making a pull request
- Entries are filled in format ```"keyword": "comment"```
- For example sitename for github.com would be 'github', but it could also be "com" which would add this comment for all sites containing ".com" in URL
- You can also define an array of comments like ```"keyword: ["comment1", "comment2"]```
- If there are multiple comments for the same site Clippy will pick a random one
- I will try to merge any pull requests on regular basis
- Feel free to build and install your own version of Clippy if you don't want to wait for next update

### Credits
- Smore Inc. (https://github.com/smore-inc/clippy.js) - JS recreation of classic MS Word assistant
