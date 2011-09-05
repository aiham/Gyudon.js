  var _gyudon = window.gyudon, // Keep a reference incase overwriting a previous gyudon
    gyudon = {}, // Initialise our main gyudon namespace as an object literal

    document = window.document, // Reference the correct document object

    hasOwn = Object.prototype.hasOwnProperty, // Use the original method in case the object already has a similarly named property

    push = Array.prototype.push, // Same as above

    toString = Object.prototype.toString, // Same as above

    splice = Array.prototype.splice, // Same as above

    concat = Array.prototype.concat, // Same as above

    initialising, // Used by Object

    Timer, // Used by Timer

    rgbaTest = /^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,?\s*([\d\.]*)\s*\)$/, // Used by Colour

    isArray = function (o) {
      return toString.call(o) === '[object Array]';
    },

    each = function (o, callback, context, data, check_all) {
      var i = 0, l, key;

      context = context || this;
    
      if (isArray(o)) { // Or check if !isObject() ?
    
        for (l = o.length; i < l; i += 1) {
          if (callback.call(context, o[i], i, data) === false) {
            i += 1;
            break;
          }
        }
    
      } else {
    
        
        for (key in o) {
          if (check_all || hasOwn.call(o, key)) {
            if (callback.call(context, o[key], key, data) === false) {
              i += 1;
              break;
            }
            i += 1;
          }
        }

      }

      o = null;
      callback = null;
      context = null;
      data = null;

      return i;
    },

    extend = function (o, properties) { // Shallow object extend
      each(properties, function (v, key) {
        o[key] = v;
      });
      return o;
    },

    // Define indexOf manually if the browser is old
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
    indexOf = Array.prototype.indexOf ||
      function (searchElement, fromIndex) {
        var t = this, len, n, k;

        if (!t) {
          throw new TypeError();
        }
    
        len = t.length || 0;
        if (len === 0) {
          return -1;
        }
    
        n = 0;
        if (typeof fromIndex !== 'undefined') {
          n = Number(fromIndex);
          if (isNaN(n)) {// shortcut for verifying if it's NaN
            n = 0;
          } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
            n = (n > 0 || -1) * Math.floor(Math.abs(n));
          }
        }
    
        if (n >= len) {
          return -1;
        }
    
        k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
    
        for (; k < len; k += 1) {
          if (typeof t[k] !== 'undefined' && t[k] === searchElement) {
            return k;
          }
        }
        return -1;
      },

    // Define filter manually if the browser is old
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter
    filter = Array.prototype.filter ||
      function (fun, thisp) {
        var i, len, res, val;

        if (!this) {
          throw new TypeError();
        }
  
        len = this.length || 0;
        if (typeof fun !== "function") {
          throw new TypeError();
        }
  
        res = [];
        for (i = 0; i < len; i += 1) {
          if (typeof [i] !== 'undefined') {
            val = this[i]; // in case fun mutates this
            if (fun.call(thisp, val, i, this)) {
              res.push(val);
            }
          }
        }
  
        return res;
      },

    // New array with elements from array a that are not in array b
    // http://stackoverflow.com/questions/1187518/javascript-array-difference/4026828#4026828
    arrayDiff = function (a, b) {
      return filter.call(a, function (i) {return indexOf.call(b, i) < 0; });
    },

    addDefaults = function (options, defaults) {
      defaults = defaults || {};
      each(defaults, function (def, key) {
        if (hasOwn.call(defaults, key) && !hasOwn.call(this, key)) {
          this[key] = def;
        }
      }, options, null, true);
      return options;
    },

    //assert = function (rule) {//TODO
    //  if (this !== rule) {
    //    throw new Error();
    //  }
    //},

    hasId = function (o) {
      return (typeof o === 'function' || typeof o === 'object') && typeof o._getId === 'function';
    },

    domElementPos = function (el) {
      var point = new gyudon.Coord(0, 0);

      while (el) {
        // This will get you the position relative to the absolute container,
        // which is what you need for positioning an element within it
        if (el.style.position === 'absolute') {
          break;
        }
      
        point.x += el.offsetLeft;
        point.y += el.offsetTop;
      
        el = el.offsetParent;
      }
      return point;
    },

    uniqueArray = function (a) {
      var unique = [];
      each(a, function (v) {
        if (indexOf.call(unique, v) < 0) {
          push.call(unique, v);
        }
      });
      return unique;
    },

    shallowClone = function (o) {

      var clone = isArray(o) ? [] : {};

      each(o, function (v, i) {

        clone[i] = v;

      });

      return clone;

    },

    sort = function (arr, reverse) {

      var sorted = [], o,
        compare = function (b, j, data) {

          if ((!reverse && data.a < b) || (reverse && data.a > b)) {
            data.insert = j;
            return false; // break
          }

        };

      each(arr, function (a) {

        o = {a: a, insert: sorted.length};

        each(sorted, compare, this, o);

        splice.call(sorted, o.insert, 0, a);

      }, this);

      return sorted;

    },

    removeElements = function (arr, elements, should_clone) {

      var deleted = 0;

      if (should_clone) {
        arr = shallowClone(arr);
      }

      elements = sort(elements);

      each(elements, function (v) {

        splice.call(arr, v - deleted, 1);

        deleted += 1;

      });

      return arr;

    },

    keys = function (o, all_keys) {
      var keys = [];

      each(o, function (v, key) {
        push.call(keys, key);
      }, o, null, all_keys);

      return keys;
    },

    arrayExcluding = function (arr, excluding) {
      var result = [];
      each(arr, function (v) {
        if (indexOf.call(excluding, v) < 0) {
          push.call(result, v);
        }
      });
      return result;
    };

  extend(gyudon, {
    Util: {
      each: each,
      extend: extend,
      sort: sort,
      shallowClone: shallowClone,
      indexOf: indexOf,
      arrayDiff: arrayDiff,
      arrayExcluding: arrayExcluding,
      keys: keys
    }
  });
