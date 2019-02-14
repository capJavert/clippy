(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.webStorageObject = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var WebStorageObject = require('./WebStorageObject');
var WebStorageEnum = require('./WebStorageEnum');

/**
 * LocalStorageObject
 *
 * Binds object to localStorage
 *
 * @param  {object} target object or array defining object properties
 * @param  {string} key key that will identifiy object inside webStorage
 * @param  {boolean} overwrite set this flag if you wish to overwrite existing key if it exits inside webStorage
 * @return {Proxy} Proxy object containing LocalStorageObject handler
 */
var LocalStorageObject = function LocalStorageObject(target, key, overwrite) {
  return new WebStorageObject(WebStorageEnum.localStorage, target, key, overwrite);
};

module.exports = LocalStorageObject;

},{"./WebStorageEnum":3,"./WebStorageObject":4}],2:[function(require,module,exports){
'use strict';

var WebStorageObject = require('./WebStorageObject');
var WebStorageEnum = require('./WebStorageEnum');

/**
 * SessionStorageObject
 *
 * Binds object to sessionStorage
 *
 * @param  {object} target object or array defining object properties
 * @param  {string} key key that will identifiy object inside webStorage
 * @param  {boolean} overwrite set this flag if you wish to overwrite existing key if it exits inside webStorage
 * @return {Proxy} Proxy object containing SessionStorageObject handler
 */
var SessionStorageObject = function SessionStorageObject(target, key, overwrite) {
  return new WebStorageObject(WebStorageEnum.sessionStorage, target, key, overwrite);
};

module.exports = SessionStorageObject;

},{"./WebStorageEnum":3,"./WebStorageObject":4}],3:[function(require,module,exports){
'use strict';

/**
 * WebStorageEnum
 *
 * @type {object}
 */
var WebStorageEnum = Object.freeze({
  localStorage: 'localStorage',
  sessionStorage: 'sessionStorage'
});

module.exports = WebStorageEnum;

},{}],4:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var WebStorageEnum = require('./WebStorageEnum');

/**
 * Abstract WebStorageObject type
 * Used in child LocalStorageObject and SessionStorageObject types
 *
 * @param  {WebStorageEnum} type type indicating  WebStorage API to use
 * @param  {object} target object or array defining object properties
 * @param  {string} key key that will identifiy object inside webStorage
 * @param  {boolean} overwrite Defaults to true, unset this flag to keep existing data if the key already exsits inside webStorage
 * @return {Proxy} Proxy object containing WebStorageObject handler
 */
var WebStorageObject = function WebStorageObject(type, target, key, overwrite) {
  if (overwrite == null) {
    overwrite = true;
  }

  var handler = this._handler(key);
  if (!handler._setStorage(type)) {
    throw "WebStorage type is not valid or supported.";
  }
  if (overwrite === true || handler._fetch() === null) {
    handler._persist(target);
  } else {
    target = handler._fetch();
  }
  var proxy = new Proxy(target, handler);
  handler._proxy = proxy;

  if (window) {
    window.addEventListener('storage', function () {
      handler._reflect();
    });
  }

  return proxy;
};
WebStorageObject.prototype._handler = function (key) {
  return {
    /**
     * Unique identifier for object inside webStorage
     *
     * @type {string}
     */
    _id: key || this._uuid(),
    /**
     * Reference to handlers Proxy object
     * Always set if WebStorageObject is created through constructor function
     *
     * @type {Proxy}
     */
    _proxy: null,
    /**
     * Reference to selected WebStorage type
     *
     * @type {localStorage|sessionStorage}
     */
    _storage: null,
    /**
     * Getter for binded webStorage object properties
     *
     * @param  {object} target
     * @param  {string|number} key
     * @return {any}
     */
    get: function get(target, key) {
      target = this._fetch();
      if (_typeof(target[key]) === 'object') {
        return new WebStorageProperty(target[key], key, this._proxy);
      } else {
        return target[key] || null;
      }
    },
    /**
     * Setter for binded webStorage object properties
     *
     * @param  {object} target
     * @param  {string|number} key
     * @return {any}
     */
    set: function set(target, key, value) {
      target[key] = value;
      var temp = this._fetch();
      temp[key] = value;

      return this._persist(temp);
    },
    /**
     * Used to generate random object identifier inside webStorage
     *
     * @return {string}
     */
    _uuid: function _uuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
      });
    },
    /**
     * Save data to webStorage as JSON string
     *
     * @param {object} value
     */
    _persist: function _persist(value) {
      if (value) {
        this._storage.setItem(this._id, JSON.stringify(value));
        return true;
      } else {
        return false;
      }
    },
    /**
     * Get data from webStorage as object
     *
     * @return {object}
     */
    _fetch: function _fetch() {
      var temp = this._storage.getItem(this._id);
      return temp ? JSON.parse(temp) : null;
    },
    /**
     * Abstract webStorage setter
     *
     * @type {localStorage|sessionStorage}
     * @return {boolean} Returns false if WebStorage type is not valid or supported
     */
    _setStorage: function _setStorage(type) {
      switch (type) {
        case WebStorageEnum.localStorage:
          this._storage = localStorage;
          return true;
        case WebStorageEnum.sessionStorage:
          this._storage = sessionStorage;
          return true;
      }

      return false;
    },
    /**
     * Reflect all values from WebStorage to proxy internal target object
     */
    _reflect: function _reflect() {
      var temp = this._fetch();
      for (var key in temp) {
        this._proxy[key] = temp[key];
      }
    }
  };
};

/**
 * Constructor for creating an object of WebStorageProperty type
 *
 * @param  {object} target object or array defining object properties
 * @param  {string} key key that will identifiy object inside his parent
 * @param  {Proxy} parent Proxy object of a parent object
 * @return {Proxy} Proxy object containing WebStorageProperty handler
 */
var WebStorageProperty = function WebStorageProperty(target, key, parent) {
  var handler = this._handler(key, parent);
  var proxy = new Proxy(target, handler);
  handler._proxy = proxy;

  return proxy;
};
WebStorageProperty.prototype._handler = function (key, parent) {
  return {
    /**
     * Unique identifier for property inside webStorage
     *
     * @type {string}
     */
    _id: key,
    /**
     * Reference to handlers Proxy object
     * Always set if WebStorageProperty is created through constructor function
     *
     * @type {Proxy}
     */
    _proxy: null,
    /**
     * Original Proxy that traps this property
     *
     * @type {object}
     */
    _parent: parent,
    /**
     * Getter for binded webStorage property properties
     *
     * @param  {object} target
     * @param  {string|number} key
     * @return {any}
     */
    get: function get(target, key) {
      if (_typeof(target[key]) === 'object') {
        return new WebStorageProperty(target[key], key, this._proxy);
      } else {
        return target[key] || null;
      }
    },
    /**
     * Setter for binded webStorage property properties
     *
     * @param  {object} target
     * @param  {string|number} key
     * @return {any}
     */
    set: function set(target, key, value) {
      target[key] = value;
      this._parent[this._id] = target;

      return true;
    }
  };
};

module.exports = WebStorageObject;

},{"./WebStorageEnum":3}],5:[function(require,module,exports){
'use strict';

/**
 * API providing 2 way binding of JavaScript objects to browser WebStorage
 * Consists of two mechanisms
 * - LocalStorageObject
 * - SessionStorageObject
 *
 * Each is used to bind any JavaScript object to specific WebStorage type
 *
 */

var LocalStorageObject = require('./LocalStorageObject');
var SessionStorageObject = require('./SessionStorageObject');

module.exports = {
  LocalStorageObject: LocalStorageObject,
  SessionStorageObject: SessionStorageObject
};

},{"./LocalStorageObject":1,"./SessionStorageObject":2}]},{},[5])(5)
});
