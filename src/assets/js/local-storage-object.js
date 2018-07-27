/**
 * API providing 2 way binding of JavaScript objects to browser LocalStorage
 *
 * @type {Object}
 */
var LocalStorageObject = {
  create: function(target, key, overwrite) {
    var handler = this._handler(key);
    if((overwrite && overwrite === true) || handler._fetch() === null) {
      handler._persist(target);
    }

    return new Proxy(target, handler);
  },
  _handler: function(key) {
    return {
      /**
       * Unique identifier for object inside localStorage
       *
       * @type {string}
       */
      _id: key || this._uuid(),
      /**
       * Getter for binded localStorage object properties
       *
       * @param  {object} target
       * @param  {string|number} key
       * @return {any}
       */
      get: function (target, key) {
        target = this._fetch();

        return target[key] || null;
      },
      /**
       * Setter for binded localStorage object properties
       *
       * @param  {object} target
       * @param  {string|number} key
       * @return {any}
       */
      set: function (target, key, value) {
        var target = this._fetch()
        target[key] = value;

        this._persist(target);
      },
      /**
       * Used to generate random object identifier inside localStorage
       *
       * @return {string}
       */
      _uuid: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function ( c ) {
          var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      },
      /**
       * Save data to localStorage as JSON string
       *
       * @param {object} value
       */
      _persist: function(value) {
        if(value) {
          localStorage.setItem(this._id, JSON.stringify(value));
        }
      },
      /**
       * Get data from localStorage as object
       *
       * @return {object}
       */
      _fetch: function() {
        var temp = localStorage.getItem(this._id);
        return temp ? JSON.parse(temp) : null
      }
    }
  }
}
