/*
 * Gyudon.js v0.1
 * http://code.aiham.net/gyudonjs/
 *
 * You may use Gyudon.js under the terms of the MIT License.
 * Copyright (c) 2011 Aiham Hammami
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

/* gyudon.js v0.1 - generated at 2011.09.06 08:43:58 */

(function (window) {

  'use strict';

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

  extend(gyudon, {
    strict: false,

    restorePrevious: function () {
      window.gyudon = _gyudon;
      return this;
    },

    errors: [],

    destroy: function () {
      this.Timer.destroy();
      delete this.Timer;
    },

    version: 0.1 
  });

  // Object class that all other classes inherit from
  //
  // Usage:
  //
  // var Parent = gyudon.Object.extend({
  //   init: function () {
  //     // This is the parent's constructor
  //   },
  //   method1: function () {
  //     // This is a method
  //   }
  // });
  //
  // var Child;
  // Child = Parent.extend({
  //   init: function () {
  //     // This is the child's constructor
  //     Child.prototype.init.call(this); // Call the parent's constructor
  //   },
  //   method1: function () {
  //     // This child method overwrites the parent's one
  //     Child.prototype.method1.call(this); // Call the overwritten method
  //   },
  //   method2: function () {
  //     // This is a new child's method
  //   }
  // });
  // 
  // this.self._super.prototype.init.call(this) can be done but care must be taken
  // to ensure that both the child and parent do not call it as it can result in
  // an infinite loop.

  extend(gyudon, {
    Object: function () {}
  });

  initialising = false;

  gyudon.Object.prototype = {
    constructor: gyudon.Object,
    self: gyudon.Object,
    _getId: function () {
      return this.self._id;
    },
    is: function (type) {
      var id = hasId(type) ? type._getId() : false;
      return id && id === this._getId();
    },
    isKindOf: function (type) {
      return this.is(type) || this.self.isKindOf(type);
    }
  };

  gyudon.Object._id = 'gyudon.Object';

  gyudon.Object._getId = function () {
    return this._id;
  };

  gyudon.Object.isKindOf = function (type) {
    var id = hasId(type) ? type._getId() : false;
    return id && 
      (id === this._id || (hasOwn.call(this, '_super') && this._super.isKindOf(type)));
  };

  gyudon.Object.extend = function (id, methods) {
    var Child = function () {
      if (!initialising && typeof this.init === 'function') {
        this.init.apply(this, arguments);
      }
    };
    initialising = true;
    Child.prototype = new this();
    initialising = false;
  
    Child.prototype.self = Child; // For static method calls
  
    each(methods, function (v, key) {
      Child.prototype[key] = v;
    });
    Child.extend = this.extend;
    Child.isKindOf = this.isKindOf;
    Child._getId = this._getId;
    Child._super = this;
    Child._id = id;
    return Child;
  };


  extend(gyudon, {
    Math: {
      TWO_PI: Math.PI * 2,

      PI_2: Math.PI / 2,

      PI_3: Math.PI / 3,

      PI_4: Math.PI / 4,

      distance: function (a, b) {
        var label = a.x + ',' + a.y + 'x' + b.x + ',' + b.y,
          r = this.distance._cache[label];
        return r !== undefined ? r : (this.distance._cache[label] = Math.sqrt(
          Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)
        ));
      },

      deg: function (rad) {
        return rad * 180 / Math.PI;
      },

      rad: function (deg) {
        return deg * Math.PI / 180;
      },

      normalise: function (val, max) {
        return val - max * Math.floor(val / max);
      },

      sin: function (x) {
        var r = this.sin._cache[x];
        return r !== undefined ? r : (this.sin._cache[x] = Math.sin(x));
      },

      cos: function (x) {
        var r = this.cos._cache[x];
        return r !== undefined ? r : (this.cos._cache[x] = Math.cos(x));
      },

      tan: function (x) {
        var r = this.tan._cache[x];
        return r !== undefined ? r : (this.tan._cache[x] = Math.tan(x));
      },

      asin: function (x) {
        var r = this.asin._cache[x];
        return r !== undefined ? r : (this.asin._cache[x] = Math.asin(x));
      },

      acos: function (x) {
        var r = this.acos._cache[x];
        return r !== undefined ? r : (this.acos._cache[x] = Math.acos(x));
      },

      atan: function (x) {
        var r = this.atan._cache[x];
        return r !== undefined ? r : (this.atan._cache[x] = Math.atan(x));
      },

      // Calcluate the bounding box of multiple coordinates
      boundedFrame: function (points) {
        var min_x = null, min_y = null, max_x = null, max_y = null;
  
        each(points, function (point) {
          if (min_x === null || point.x < min_x) {
            min_x = point.x;
          }
          if (min_y === null || point.y < min_y) {
            min_y = point.y;
          }
          if (max_x === null || point.x > max_x) {
            max_x = point.x;
          }
          if (max_y === null || point.y > max_y) {
            max_y = point.y;
          }
        });
        if (min_x === null) {
          min_x = 0;
        }
        if (min_y === null) {
          min_y = 0;
        }
        if (max_x === null) {
          max_x = 0;
        }
        if (max_y === null) {
          max_y = 0;
        }
        return new gyudon.Frame(min_x, min_y, max_x - min_x, max_y - min_y);
      },

      isBoundByPoints: function (point, points) {
        return this.isBoundByFrame(point, this.boundedFrame(points));
      },

      isBoundByFrame: function (point, frame) {
        return point.x >= frame.origin.x &&
          point.x <= frame.origin.x + frame.size.width &&
          point.y >= frame.origin.y &&
          point.y <= frame.origin.y + frame.size.height;
      },

      rotatePoint: function (point, rotate, pivot) {
        var xdist = point.x - pivot.x, ydist = point.y - pivot.y;

        return new gyudon.Coord(
          (xdist * this.cos(rotate) - ydist * this.sin(rotate)) + pivot.x,
          (xdist * this.sin(rotate) + ydist * this.cos(rotate)) + pivot.y
        );
      },

      gradient: function (a, b) {
        if (a.x === b.x) {
          return Infinity;
        }
        return (a.y - b.y) / (a.x - b.x);
      },

      angleBetweenGradients: function (m1, m2) {
        var m, tmp;
        if (m1 === m2) {
          return 0;
        } else if (m1 === Infinity || m2 === Infinity) {
          m = m1 === Infinity ? m2 : m1;
          if (m === 0) {
            return Math.PI_2;
          }
          return m > 0 ? this.atan(1 / m) : this.atan(-1 / m);
        } else if (m1 * m2 === -1) {
          return Math.PI_2;
        } else {
          if (m1 > m2) {
            tmp = m1;
            m1 = m2;
            m2 = tmp;
          }
          return this.atan((m2 - m1) / (1 + m1 * m2));
        }
      },

      globalPointToLocal: function (point, global_pos) {
        var dist = this.distance(point, global_pos.origin),
          alpha = this.angleBetweenGradients(
            this.gradient(point, global_pos.origin),
            0
          ),
          angle;

        if (point.x < global_pos.origin.x) {
          if (point.y < global_pos.origin.y) {
            angle = Math.PI + alpha;
          } else {
            angle = Math.PI - alpha;
          }
        } else {
          if (point.y < global_pos.origin.y) {
            angle = Math.TWO_PI - alpha;
          } else {
            angle = alpha;
          }
        }

        angle = gyudon.Math.normalise(angle - global_pos.angle, this.TWO_PI);

        return new gyudon.Coord(
          dist * this.cos(angle) / global_pos.zoom,
          dist * this.sin(angle) / global_pos.zoom
        );
      },

      _getId: function () {
        return 'gyudon.Math';
      }
    }
  });

  (function () {

    var add_cache = ['distance', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan'];

    each(add_cache, function (v) {
      gyudon.Math[v]._cache = {};
    });

  }());


  // Timer class. A singleton instance is provided at gyudon.Timer
  Timer = gyudon.Object.extend('gyudon.Timer', {
  
    init: function (speed) {
      this.callbacks = [];
      this.timer_id = null;
      this.count = 0;
      this.speed = speed;
      this.start = (new Date()).getTime();
      this.step();
    },
  
    add: function (context, func, duration) {
      var that = this, callback;
      callback = {
        context: context,
        func: func,
        start: (new Date()).getTime(),
        duration: duration,
        count: 0,
        steps: typeof duration === 'undefined' ? 0 : Math.floor(duration / this.speed),
        remove: function () {
          that.remove(callback);
          delete this.remove;
          delete this.pause;
          delete this.restart;
          delete this.context;
          delete this.func;
          that = null;
          context = null;
          func = null;
          callback = null;
        },
        pause: function () {
          that.pause(callback);
        },
        restart: function () {
          that.restart(callback);
        },
        running: true
      };
      push.call(this.callbacks, callback);
      return callback;
    },
  
    pause: function (callback) {
      if (this.callbackIndex(callback) === false) {
        return false;
      }
      callback.running = false;
      return true;
    },
  
    restart: function (callback) {
      if (this.callbackIndex(callback) === false) {
        return false;
      }
      callback.running = true;
      return true;
    },
  
    remove: function (callback) {
      var i = this.callbackIndex(callback);
      if (i === false) {
        return false;
      }
      splice.call(this.callbacks, i, 1);
      return true;
    },
  
    callbackIndex: function (callback) {
      var index = indexOf.call(this.callbacks, callback);
      return index < 0 ? false : index;
    },
  
    moveTo: function (callback, index) {
      var i = this.callbackIndex(callback);
      if (i === false || index >= this.callbacks.length) {
        return false;
      }
      splice.call(this.callbacks, index, 0, splice.call(this.callbacks, i, 1)[0]);
      return true;
    },
  
    moveToStart: function (callback) {
      return this.moveTo(callback, 0);
    },
  
    moveToEnd: function (callback) {
      return this.moveTo(callback, this.callbacks.length - 1);
    },
  
    step: function () {
      var that = this;
      this.timer_id = window.setTimeout(function () {
        var to_delete = [];
        each(that.callbacks, function (callback, i) {
          var elapsed, percentage, new_count;
          if (!callback || !callback.running) {
            return;
          }
          if (callback.steps > 0) {
            elapsed = (new Date()).getTime() - callback.start;
            percentage = elapsed / callback.duration;
            percentage = percentage > 1 ? 1 : percentage < 0 ? 0 : percentage;

            new_count = Math.round(callback.steps * percentage);

            if (new_count > callback.count) {
              callback.count = new_count;
              callback.func.call(callback.context, callback);
            }

            if (callback.count >= callback.steps) {
              push.call(to_delete, callback);
            }
          } else {
            callback.count += 1;
            callback.func.call(callback.context, callback);
          }
        }, that);
        that.callbacks = arrayDiff(that.callbacks, to_delete);
        that.count += 1;
        that.step();
      }, this.speed);
    },

    destroy: function () {
      this.stop();

      each(this.callbacks, function (callback, i) {
        if (callback) {
          callback.remove();
        }
        callback = null;
        delete this.callbacks[i];
      }, this);
      delete this.callbacks;
      return this;
    },
  
    stop: function () {
      if (this.timer_id !== null) {
        window.clearTimeout(this.timer_id);
        this.timer_id = null;
      }
    },
  
    isRunning: function () {
      return this.timer_id !== null;
    }
    
  });

  gyudon.Timer = new Timer(50);


  extend(gyudon, {
    Support: {
      canvas: function () {
        if (!hasOwn.call(gyudon.Support, '_canvas')) {
          gyudon.Support._canvas = false;//TODO
        }
        return gyudon.Support._canvas;
      },
      text: function () {
        if (!hasOwn.call(gyudon.Support, '_text')) {
          gyudon.Support._text = false;//TODO
        }
        return gyudon.Support._text;
      },
      imageAlpha: function () {
        if (!hasOwn.call(gyudon.Support, '_image_alpha')) {
          gyudon.Support._image_alpha = false;//TODO
        }
        return gyudon.Support._image_alpha;
      }
    }

  });


  extend(gyudon, {
    DOMEvent: {
      preventDefault: function (e) {
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          e.returnValue = false;
        }
        return false;
      },

      _getId: function () {
        return 'gyudon.DOMEvent';
      }
    }
  });

  // Based on http://msdn.microsoft.com/en-us/scriptjunkie/ff728624
  // Populates gyudon.DOMEvent.addListener and gyudon.DOMEvent.removeListener

  (function () {

    var getUniqueId = (function () {
        var uid = 0;
        if (typeof document.documentElement.uniqueID !== 'undefined') {
          return function (element) {
            return element.uniqueID;
          };
        }
        return function (element) {
          if (!element.__uniqueID) {
            element.__uniqueID = 'uniqueID__' + uid;
            uid += 1;
          }
          return element.__uniqueID;
        };
      }()),

      areHostMethods = function (object) {
        var methodNames = Array.prototype.slice.call(arguments, 1), t;

        each(methodNames, function (methodName) {
          t = typeof object[methodName];
          if (!(/^(?:function|object|unknown)$/).test(t)) {
            return false;
          }
        });
        return true;
      },

      shouldUseAddListenerRemoveListener = (
        areHostMethods(document.documentElement, 'addEventListener', 'removeEventListener') &&
        areHostMethods(window, 'addEventListener', 'removeEventListener')
      ),
    
    
      shouldUseAttachEventDetachEvent = (
        areHostMethods(document.documentElement, 'attachEvent', 'detachEvent') &&
        areHostMethods(window, 'attachEvent', 'detachEvent')
      ),

      getElement,

      setElement,

      listeners = {},

      handlers = {};

    (function () {
      var elements = {};

      getElement = function (uid) {
        return elements[uid];
      };

      setElement = function (uid, element) {
        elements[uid] = element;
      };
    }());

    if (shouldUseAddListenerRemoveListener) {
 
      gyudon.DOMEvent.addListener = function (element, eventName, handler) {
        element.addEventListener(eventName, handler, false);
      };
 
 
      gyudon.DOMEvent.removeListener = function (element, eventName, handler) {
        element.removeEventListener(eventName, handler, false);
      };
 
    } else if (shouldUseAttachEventDetachEvent) {

      gyudon.DOMEvent.addListener = function (element, eventName, handler) {
        var uid = getUniqueId(element), listener;
        setElement(uid, element);

        if (!listeners[uid]) {
          listeners[uid] = {};
        }
        if (!listeners[uid][eventName]) {
          listeners[uid][eventName] = [];
        }
        listener = {
          handler: handler,
          wrappedHandler: (function (uid, handler) {
            return function (e) {
              handler.call(getElement(uid), e || window.event);
            };
          }(uid, handler))
        };
        listeners[uid][eventName].push(listener);
        element.attachEvent('on' + eventName, listener.wrappedHandler);
      };
   
      gyudon.DOMEvent.removeListener = function (element, eventName, handler) {
        var uid = getUniqueId(element);
        if (listeners[uid] && listeners[uid][eventName]) {
          each(listeners[uid][eventName], function (listener, i) {
            if (listener && listener.handler === handler) {
              element.detachEvent('on' + eventName, listener.wrappedHandler);
              listeners[uid][eventName][i] = null;
            }
          });
        }
      };

    } else {

      gyudon.DOMEvent.addListener = function (element, eventName, handler) {
        var uid = getUniqueId(element), existingHandler, handlersForEvent;
        if (!handlers[uid]) {
          handlers[uid] = {};
        }
        if (!handlers[uid][eventName]) {
          handlers[uid][eventName] = [ ];
          existingHandler = element['on' + eventName];
          if (existingHandler) {
            handlers[uid][eventName].push(existingHandler);
          }
          element['on' + eventName] = (function (uid, eventName) {
            return function (e) {
              if (handlers[uid] && handlers[uid][eventName]) {
                handlersForEvent = handlers[uid][eventName];
                each(handlersForEvent, function (handler, i) {
                  handlersForEvent[i].call(this, e || window.event);
                }, this);
              }
            };
          }(uid, eventName));
        }
        handlers[uid][eventName].push(handler);
      };

      gyudon.DOMEvent.removeListener = function (element, eventName, handler) {
        var uid = getUniqueId(element), handlersForEvent, to_delete;
        if (handlers[uid] && handlers[uid][eventName]) {
          handlersForEvent = handlers[uid][eventName];
          to_delete = [];
          each(handlersForEvent, function (v, i) {
            if (v === handler) {
              push.call(to_delete, i);
            }
          });
          removeElements(handlersForEvent, to_delete);
        }
      };

    }

  }());


  extend(gyudon, {
    Coord: gyudon.Object.extend('gyudon.Coord', {
      init: function (x, y) {
        this.x = x;
        this.y = y;
      }
    }),
    
    Size: gyudon.Object.extend('gyudon.Size', {
      init: function (width, height) {
        this.width  = width;
        this.height = height;
      }
    }),
    
    Line: gyudon.Object.extend('gyudon.Line', {
      init: function (x1, y1, x2, y2) {
        this.start = new gyudon.Coord(x1, y1);
        this.end = new gyudon.Coord(x2, y2);
      }
    }),
    
    Frame: gyudon.Object.extend('gyudon.Frame', {
      init: function (x, y, width, height) {
        this.origin = new gyudon.Coord(x, y);
        this.size = new gyudon.Size(width, height);
      }
    }),

    GlobalPos: gyudon.Object.extend('gyudon.GlobalPos', {
      init: function (x, y, angle, zoom) {
        this.origin = new gyudon.Coord(x, y);
        this.angle = angle;
        this.zoom = zoom;
      }
    }),

    Gradient: gyudon.Object.extend('gyudon.Gradient', {//TODO
      init: function (line, colours) {
        this.line = line;
        this.colours = colours;
      }
    })
  });


  extend(gyudon, {
    Animation: gyudon.Object.extend('gyudon.Animation', {//TODO
      init: function (options) {
        options = options || {};

        addDefaults(options, {
          repeat: false
        });
  
        each(options, function (v, key) {
          if (typeof this[key] === 'undefined') {
            this[key] = v;
          }
        }, this);
      },

      instance: function () {},

      complete: function () {}
    })
  });

  extend(gyudon.Animation, {
    RotateTo: gyudon.Animation.extend('gyudon.Animation.RotateTo', {
      instance: function (index, steps, data) {
        var progress = index / steps;
        this.rotate = (data.end - data.start) * progress + data.start;
      }
    }),

    MoveTo: gyudon.Animation.extend('gyudon.Animation.MoveTo', {
      instance: function (index, steps, data) {
        var progress = index / steps;
        this.move.x = (data.end.x - data.start.x) * progress + data.start.x;
        this.move.y = (data.end.y - data.start.y) * progress + data.start.y;
      }
    }),

    FadeTo: gyudon.Animation.extend('gyudon.Animation.FadeTo', {
      instance: function (index, steps, data) {
        var progress = index / steps;
        this.alpha = (data.end - data.start) * progress + data.start;
      }
    }),

    ScaleTo: gyudon.Animation.extend('gyudon.Animation.ScaleTo', {
      instance: function (index, steps, data) {
        var progress = index / steps;
        this.frame.size.width = (data.end.width - data.start.width) * progress + data.start.width;
        this.frame.size.height = (data.end.height - data.start.height) * progress + data.start.height;
        if (typeof this.updatePoints === 'function') {
          this.updatePoints();
        }
      }
    }),

    ZoomTo: gyudon.Animation.extend('gyudon.Animation.ZoomTo', {
      instance: function (index, steps, data) {
        var progress = index / steps;
        this.zoom = (data.end - data.start) * progress + data.start;
        if (this.needsRecalc && typeof this.needsRecalc === 'function') {
          this.needsRecalc();
        }
      }
    }),

    OffsetTo: gyudon.Animation.extend('gyudon.Animation.OffsetTo', {
      instance: function (index, steps, data) {
        var progress = index / steps;
        this.offset.x = (data.end.x - data.start.x) * progress + data.start.x;
        this.offset.y = (data.end.y - data.start.y) * progress + data.start.y;
        if (this.needsRecalc && typeof this.needsRecalc === 'function') {
          this.needsRecalc();
        }
      }
    })
  });


  extend(gyudon, {
    Colour: gyudon.Object.extend('gyudon.Colour', {
      init: function (r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = typeof a === 'undefined' ? 1 : a;
      },
    
      toHex: function () {
        return '#' +
          this.r.toString(16) +
          this.g.toString(16) +
          this.b.toString(16);
      },
    
      toRgb: function () {
        return 'rgb(' +
          this.r + ',' +
          this.g + ',' +
          this.b + ')';
      },
    
      toRgba: function () {
        return 'rgba(' +
          this.r + ',' +
          this.g + ',' +
          this.b + ',' +
          this.a + ')';
      }
    })
  });
    
  gyudon.Colour.parseStr = function (str) {
    var r = 0, g = 0, b = 0, a = 1, digits;
  
    if (str.charAt(0) === '#') {
      str = str.substring(1, 7);
      r = parseInt(str.substring(0, 2), 16);
      g = parseInt(str.substring(2, 4), 16);
      b = parseInt(str.substring(4, 6), 16);
    } else {
      digits = rgbaTest.exec(str);
      
      if (digits) {
        r = parseInt(digits[1], 10);
        g = parseInt(digits[2], 10);
        b = parseInt(digits[3], 10);
        a = parseFloat(digits[4] === '' ? 1 : digits[4]);
      }
    }
  
    return new gyudon.Colour(r, g, b, a);
  };


  extend(gyudon, {
    Canvas: gyudon.Object.extend('gyudon.Canvas', {
    
      init: function (width, height, shift) {
        var dummy_canvas = document.createElement('canvas');
        this.canvas_support = typeof dummy_canvas.getContext === 'function';
        this.text_support = this.canvas_support && typeof dummy_canvas.getContext('2d').fillText === 'function';
    
        this.width = width;
        this.height = height;
        this.shift = typeof shift === 'undefined' ? 0.5 : shift;
        this.e = document.createElement('canvas');
        this.e.setAttribute('width', this.width);
        this.e.setAttribute('height', this.height);
        if (typeof window.G_vmlCanvasManager !== 'undefined') {
          this.e.display = false;
          document.body.appendChild(this.e);
          this.e = window.G_vmlCanvasManager.initElement(this.e);
          this.context = this.e.getContext('2d');
          this.e = document.body.removeChild(this.e);
        } else {
          this.context = this.e.getContext('2d');
        }
        dummy_canvas = null;
      },

      destroy: function () {
        delete this.e;
        delete this.context;
      },
    
      alpha: function (alpha) {
        if (!alpha) {
          alpha = 0;
        }
        this.context.globalAlpha = alpha;
      },
    
      clear: function () {
        this.context.clearRect(0, 0, this.width, this.height);
      },
    
      line: function (start, end, options) {
        var shift;
        if (!start) {
          start = new gyudon.Coord(0, 0);
        }
        if (!end) {
          end = new gyudon.Coord(0, 0);
        }
        if (!options) {
          options = {};
        }
        shift = options.shift !== false ? this.shift : 0;
        this.context.moveTo(start.x + shift, start.y + shift);
        this.context.lineTo(end.x + shift, end.y + shift);
      },
    
      lines: function (lines, options) {
        if (!lines) {
          lines = [];
        }
        if (!options) {
          options = {};
        }
        this.context.beginPath();
        each(lines, function (line) {
          this.line(line.start, line.end, options);
        }, this);
        this.context.closePath();
        if (options.stroke_width) {
          this.context.lineWidth = options.stroke_width;
        }
        this.context.strokeStyle = options.stroke;
        this.context.stroke();
      },
    
      path: function (points, options) {
        var shift;
        if (!points) {
          points = [];
        }
        if (!options) {
          options = {};
        }
        shift = options.shift !== false ? this.shift : 0;

        this.context.beginPath();
        each(points, function (point, i) {
          if (i === 0) {
            this.context.moveTo(point.x + shift, point.y + shift);
          } else {
            this.context.lineTo(point.x + shift, point.y + shift);
          }
        }, this);
        this.context.closePath();
        if (options.fill) {
          this.context.fillStyle = options.fill;
          this.context.fill();
        }
        if (options.stroke) {
          if (options.stroke_width) {
            this.context.lineWidth = options.stroke_width;
          }
          this.context.strokeStyle = options.stroke;
          this.context.stroke();
        }
      },
    
      polygon: function (points, options) {
        points = points || [];
        if (points.length > 0) {
          points = concat.call(points, points[0]);
        }
        return this.path(points, options);
      },
    
      square: function (center, size, options) {
        var radius;
        if (!center) {
          center = new gyudon.Coord(0, 0);
        }
        if (!size) {
          size = 1;
        }
        radius = size / 2;
        return this.rect(new gyudon.Frame(center.x - radius, center.y - radius, size, size), options);
      },
    
      rect: function (frame, options) {
        var left, top, right, bottom;
        if (!frame) {
          frame = new gyudon.Frame(0, 0, 1, 1);
        }
        left = frame.origin.x;
        top = frame.origin.y;
        right = frame.origin.x + frame.size.width;
        bottom = frame.origin.y + frame.size.height;
        return this.polygon([
          new gyudon.Coord(left, top),
          new gyudon.Coord(right, top),
          new gyudon.Coord(right, bottom),
          new gyudon.Coord(left, bottom)
        ], options);
      },
    
      circle: function (center, radius, options) {
        var shift;
        if (!options) {
          options = {};
        }
        if (!center) {
          center = new gyudon.Coord(0, 0);
        }
        if (!radius) {
          radius = 1;
        }
        shift = options.shift !== false ? this.shift : 0;

        this.context.beginPath();
        this.context.arc(center.x + shift, center.y + shift, radius, 0, gyudon.Math.TWO_PI, false);
        this.context.closePath();
        if (options.fill) {
          this.context.fillStyle = options.fill;
          this.context.fill();
        }
        if (options.stroke) {
          if (options.stroke_width) {
            this.context.lineWidth = options.stroke_width;
          }
          this.context.strokeStyle = options.stroke;
          this.context.stroke();
        }
      },
    
      text: function (str, coord, options) {
        var baseline, textalign, shift;
        if (!this.text_support) {
          return;
        }
        if (!options) {
          options = {};
        }
        if (!coord) {
          coord = new gyudon.Coord(0, 0);
        }
    
        baseline = options.baseline || 'top';
        textalign = options.align || 'left';
    
        this.context.textBaseline = baseline;
        this.context.textAlign = textalign;
    
        shift = options.shift !== false ? this.shift : 0;
    
        if (options.font) {
          this.context.font = options.font;
        }
        if (options.fill) {
          this.context.fillStyle = options.fill;
          this.context.fillText(str, coord.x + shift, coord.y + shift);
        }
        if (options.stroke) {
          this.context.strokeStyle = options.stroke;
          this.context.strokeText(str, coord.x + shift, coord.y + shift);
        }
      },
    
      image: function (image, coord, options) {
        var size, clip, shift;
        if (!options) {
          options = {};
        }
        coord = coord || new gyudon.Coord(0, 0);
        size = options.size || new gyudon.Size(0, 0);
        clip = options.clip || new gyudon.Frame(0, 0, 0, 0);
        shift = options.shift !== false ? this.shift : 0;

        if (size.width > 0 && size.height > 0 &&
            clip.width > 0 && clip.height > 0) {
          this.context.drawImage(image, clip.origin.x, clip.origin.y, clip.size.width, clip.size.height, coord.origin.x + shift, coord.origin.y + shift, size.width, size.height);
        } else if (size.width > 0 && size.height > 0) {
          this.context.drawImage(image, coord.x + shift, coord.y + shift, size.width, size.height);
        } else {
          this.context.drawImage(image, coord.x + shift, coord.y + shift);
          size = new gyudon.Size(image.width, image.height);
        }

        //TODO
        //var image_data = this.context.getImageData(coord.x + shift, coord.y + shift, size.width, size.height);
        //for (var i = 0, l = image_data.data.length; i < l; i += 4) {
        //  image_data.data[i+3] = options.alpha;
        //}
        //this.context.putImageData(data, coord.x + shift, coord.y + shift);
      },
    
      gradient: function (line, colours, options) {
        var shift, gradient, last;
        if (!options) {
          options = {};
        }
        shift = options && options.shift !== false ? this.shift : 0;

        gradient = this.context.createLinearGradient(
          line.start.x + shift,
          line.start.y + shift,
          line.end.x + shift,
          line.end.y + shift
        );
    
        if (isArray(colours)) {
          last = colours.length - 1;
          each(colours, function (colour, i) {
            var position = last < 1 ? 0 : 1 / last * i;
            gradient.addColorStop(position, colour);
          });
        } else {
          each(colours, function (position, colour) {
            gradient.addColorStop(position, colour);
          });
        }
        return gradient;
      },
    
      pattern: function (image, type) {
        return this.context.createPattern(image, type);
      },
    
      rotate: function (radians) {
        this.context.rotate(radians);
      }
    
    })
  });


  extend(gyudon, {
    BindManager: gyudon.Object.extend('gyudon.BindManager', {
      init: function (element) {
        var that = this,
          bind_types = ['over', 'out', 'down', 'upinside', 'upoutside', 'moveinside', 'moveoutside', 'dragstart', 'dragmove', 'dragend'],
          native_types = ['mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout'];

        this.el = element;

        this.binds = {};
        each(bind_types, function (type) {
          this.binds[type] = [];
        }, this);

        this.waiting = {
          over: [],
          out: [],
          upinside: [],
          upoutside: [],
          dragstart: [],
          dragmove: [],
          dragend: []
        };

        this.native_handlers = {};

        each(native_types, function (type) {
          this.native_handlers[type] = [];

          gyudon.DOMEvent.addListener(this.el, type, this.createDOMEvent(type));
        }, this);

        this.enable = true;
      },

      destroy: function () {
        return this.unbindAll().cleanDOMEvents();
      },

      createDOMEvent: function (type) {
        var that = this,
          handler = function (e) {
            that.processDOMEvent(type, e);
          };

        this.native_handlers[type].push(handler);

        return handler;
      },

      processDOMEvent: function (type, e) {
        if (this.enable) {
          this.normaliseEventPos(e);

          if (type === 'mousedown') {
            this.trigger_down(e);
          } else if (type === 'mouseup') {
            this.trigger_upinside(e);
            this.trigger_upoutside(e);
            this.trigger_dragend(e);
          } else if (type === 'mouseover' || type === 'mousemove') {
            this.trigger_moveoutside(e);
            this.trigger_out(e);
            this.trigger_moveinside(e);
            this.trigger_over(e);
            this.trigger_dragmove(e);
            this.trigger_dragstart(e);
          } else if (type === 'mouseout') {
            this.triggerCallbacks(this.waiting.out, 'out', e);
            this.waiting.out = [];
            this.trigger_dragend(e);
          }
        }
        return this;
      },

      cleanDOMEvents: function () {
        each(this.native_handlers, function (handlers, type) {
          each(handlers, function (handler, i) {
            gyudon.DOMEvent.removeListener(this.el, type, handler);
            delete handlers[i];
            handler = null;
          }, this);
          handlers = null;
          delete this.native_handlers[type];
        }, this);
        delete this.el;
        delete this.native_handlers;

        return this;
      },

      trigger_down: function (e, down) {
        var drag;

        if (down) {
          this.waiting.upinside = this.itemsWithTypes(down, 'upinside');
          this.waiting.upoutside = this.itemsWithTypes(down, 'upoutside');

          this.waiting.dragstart = this.itemsWithTypes(down, ['dragstart', 'dragmove', 'dragend']);
        } else {
          down = this.getItemsContainingPos(this.binds.down, e.pos);

          this.waiting.upinside = this.getItemsContainingPos(this.binds.upinside, e.pos);
          this.waiting.upoutside = this.getItemsContainingPos(this.binds.upoutside, e.pos);

          drag = uniqueArray(this.binds.dragstart.concat(this.binds.dragmove, this.binds.dragend));
          this.waiting.dragstart = this.getItemsContainingPos(drag, e.pos);
        }
        this.waiting.dragmove = [];
        this.waiting.dragend = [];

        this.triggerCallbacks(down, 'down', e);
        return this;
      },

      trigger_upinside: function (e, upinside) {
        if (!upinside) {
          upinside = this.getItemsContainingPos(this.waiting.upinside, e.pos);
        } else {
          this.waiting.upoutside = [];
        }
        this.waiting.upinside = [];
        this.triggerCallbacks(upinside, 'upinside', e);
        return this;
      },

      trigger_upoutside: function (e, upoutside) {
        if (!upoutside) {
        upoutside = this.getItemsContainingPos(this.waiting.upoutside, e.pos, true);
        } else {
          this.waiting.upinside = [];
        }
        this.waiting.upoutside = [];
        this.triggerCallbacks(upoutside, 'upoutside', e);
        return this;
      },

      trigger_dragstart: function (e, dragstart) {
        if (!dragstart) {
          dragstart = this.waiting.dragstart;
        }
        if (dragstart.length) {
          this.waiting.dragend = dragstart;
          this.waiting.dragmove = dragstart;
          this.triggerCallbacks(dragstart, 'dragstart', e);
          this.waiting.dragstart = [];
        }
        return this;
      },

      trigger_dragmove: function (e, dragmove) {
        this.triggerCallbacks(dragmove || this.waiting.dragmove, 'dragmove', e);
        return this;
      },

      trigger_dragend: function (e, dragend) {
        this.triggerCallbacks(dragend || this.waiting.dragend, 'dragend', e);
        this.waiting.dragstart = [];
        this.waiting.dragmove = [];
        this.waiting.dragend = [];
        return this;
      },

      trigger_over: function (e, over) {
        if (!over) {
          over = this.binds.over.concat(this.binds.out, this.binds.moveinside, this.binds.moveoutside);
          over = arrayExcluding(uniqueArray(over), this.waiting.out);
          over = this.getItemsContainingPos(over, e.pos);
        }
        this.waiting.out = uniqueArray(this.waiting.out.concat(over));
        this.triggerCallbacks(over, 'over', e);
        return this;
      },

      trigger_out: function (e, out) {
        if (!out) {
          out = this.getItemsContainingPos(this.waiting.out, e.pos, true);
        }
        this.waiting.out = arrayExcluding(this.waiting.out, out);
        this.triggerCallbacks(out, 'out', e);
        return this;
      },

      trigger_moveinside: function (e, moveinside) {
        this.triggerCallbacks(moveinside || this.waiting.out, 'moveinside', e);
        return this;
      },

      trigger_moveoutside: function (e, moveoutside) {
        if (!moveoutside) {
          moveoutside = arrayExcluding(this.binds.moveoutside, this.waiting.out);
        }
        this.triggerCallbacks(moveoutside, 'moveoutside', e);
        return this;
      },

      itemsWithTypes: function (from, types) {
        var items = [];
        if (!isArray(types)) {
          types = [types];
        }
        each(types, function (type) {
          each(from, function (item) {
            if (item.binds[type].length > 0 && indexOf.call(items, item) < 0) {
              push.call(items, item);
            }
          });
        });
        return items;
      },

      getItemsContainingPos: function (from, pos, outside) {
        var items = [], contains;
        each(from, function (item) {
          if (
            item.hidden || // Don't trigger hidden items
            !item.binds_enabled || // Don't trigger disabled items
            indexOf.call(items, item) >= 0 // Don't count items twice
          ) {
            return; // continue
          }
          contains = item.containsGlobalPoint(pos);
          if ((!outside && contains) || (outside && !contains)) {
            push.call(items, item);
          }
        });
        return items;
      },

      triggerCallbacks: function (items, type, e) {
        var is_drag = type.search('drag') === 0;
        each(items, function (item) {
          if (!is_drag || item.dragable) {
            if (item.dragable) {
              item.triggerDragCallback(e, type);
            }
            each(item.binds[type], function (bind) {
              bind.call(item, e);
            });
          }
        });
        return this;
      },

      normaliseEventPos: function (e) {
        var x, y, offset = domElementPos(this.el);

        if (e.clientX || e.clientY) {
          x = e.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
          y = e.clientY + document.documentElement.scrollTop + document.body.scrollTop;
        } else if (e.pageX || e.pageY) {
          x = e.pageX;
          y = e.pageY;
        } else if (e.x || e.y) { //TODO - Test browser compatibility
          x = e.x;
          y = e.y;
        }
        e.pos = new gyudon.Coord(x - offset.x, y - offset.y);
        return e.pos;
      },

      bind: function (item, type, callback) {
        if (!hasOwn.call(this.binds, type)) {
          this.binds[type] = [];
        }
        if (!hasOwn.call(item.binds, type)) {
          item.binds[type] = [];
        }
        if (indexOf.call(this.binds[type], item) < 0) {
          push.call(this.binds[type], item);
        }
        push.call(item.binds[type], callback);
        item.needs_global_pos = true;
        return this;
      },

      trigger: function (items, type, e) {
        if (!isArray(items)) {
          items = [items];
        }
        if (typeof this['trigger_' + type] === 'function') {
          this['trigger_' + type](e, items);
        }
        return this;
      },

      unbindAll: function () {
        return this.unbindType(keys(this.binds));
      },

      unbindType: function (types) {
        if (!isArray(types)) {
          types = [types];
        }
        each(types, function (type) {
          each(this.binds[type], function (item) {
            item.needs_global_pos = false;
            item.binds[type] = [];
          });
          this.binds[type] = [];
        }, this);
        return this;
      },

      unbindItem: function (item) {
        each(this.binds, function (items, type) {
          this.unbindItemOfType(item, type);
        }, this);
        return this;
      },

      unbindItemOfType: function (item, types) {
        item.needs_global_pos = false;
        if (!isArray(types)) {
          types = [types];
        }
        each (types, function (type) {
          var i;
          item.binds[type] = [];
          if (hasOwn.call(this.binds, type)) {
            i = indexOf.call(this.binds[type], item);
            if (i >= 0) {
              splice.call(this.binds[type], i, 1);
            }
          }
        }, this);
        return this;
      }
    })
  });


  extend(gyudon, {
    Container: gyudon.Object.extend('gyudon.Container', {
      init: function () {
        this.items = [];
        this.needs_recalc = true;
        this.global_pos = null;
        this.needs_global_pos = false;
        this.delegate = null;
        this.animations = {};
        this.waiting_actions = [];
        this.binds = {
          down: [],
          upinside: [],
          upoutside: [],
          over: [],
          out: [],
          moveinside: [],
          moveoutside: [],
          dragstart: [],
          dragmove: [],
          dragend: []
        };
        this.binds_enabled = true;
      },

      destroy: function () {
        this.stopAnimations();
        this.unbind();
        if (this.items) {
          each(this.items, function (item, i) {
            item.destroy();
            item = null;
            delete this.items[i];
          }, this);
          delete this.items;
        }
        this.delegate = null;
      },

      queueAction: function (method, args) {
        push.call(this.waiting_actions, {method: method, args: args});
        return this;
      },

      setDelegate: function (delegate) {
        this.delegate = delegate;
        each(this.waiting_actions, function (action) {
          this[action.method].apply(this, action.args);
        }, this);
        this.waiting_actions = [];
        this.needsRedraw();
        return this;
      },

      getRootDelegate: function () {
        if (this.delegate && this.delegate.getRootDelegate) {
          return this.delegate.getRootDelegate();
        }
        return false;
      },

      updateCursor: function (type) {
        if (this.delegate && this.delegate.updateCursor) {
          this.delegate.updateCursor(type);
        }
        return this;
      },

      sendRedrawNotice: function () {
        if (this.delegate && this.delegate.sendRedrawNotice) {
          this.delegate.sendRedrawNotice();
        }
        return this;
      },

      needsRedraw: function () {
        this.needs_recalc = true;
        this.sendRedrawNotice();
        return this;
      },

      containsPos: function () {
        return false;
      },
    
      animate: function (duration, animation, data, complete) {
        var a, animation_id, d, c, f;
        if (!animation.isKindOf(gyudon.Animation)) {
          return false;
        }
        a = animation;
        animation_id = a._getId();
        d = data;
        c = complete;
        f = function (callback) {
          var i;
          if (typeof a.instance === 'function') {
            a.instance.call(this, callback.count, callback.steps, d);
          }
          if (callback.count >= callback.steps) {
            if (typeof a.complete === 'function') {
              a.complete.call(this, callback.count, callback.steps, d);
            }
            if (typeof c === 'function') {
              c.call(this, callback.count, callback.steps, d);
            }
            if (hasOwn.call(this.animations, animation_id)) {
              i = indexOf.call(this.animations[animation_id], callback);
              if (i >= 0) {
                splice.call(this.animations[animation_id], i, 1);
              }
            }
          }
          this.needsRedraw();
        };
        this.stopAnimations(animation_id); //TODO
        if (duration < 1) {
          f.call(this, {steps: 1, count: 1});
        } else {
          if (!hasOwn.call(this.animations, animation_id)) {
            this.animations[animation_id] = [];
          }
          push.call(this.animations[animation_id], gyudon.Timer.add(this, f, duration));
        }
        return this;
      },

      getAnimationsOfType: function (types, recursive) {
        var animations = [], id, subs;
        if (!isArray(types)) {
          types = [types];
        }
        each(types, function (type) {
          id = hasId(type) ? type._getId() : type;
          if (hasOwn.call(this.animations, id)) {
            each(this.animations[id], function (a) {
              push.call(animations, a);
              if (recursive) {
                each(this.items, function (item) {
                  subs = item.getAnimationsOfType(types, recursive);
                  animations = concat.call(animations, subs);
                });
              }
            }, this);
          }
        }, this);
        return animations;
      },

      getAnimationTypes: function () {
        return keys(this.animations);
      },
    
      restartAnimations: function (types, recursive) {
        if (!types) {
          types = this.getAnimationTypes();
        }
        each(this.getAnimationsOfType(types, recursive), function (a) {
          a.restart();
        });
        return this;
      },
    
      pauseAnimations: function (types, recursive) {
        if (!types) {
          types = this.getAnimationTypes();
        }
        each(this.getAnimationsOfType(types, recursive), function (a) {
          a.pause();
        });
        return this;
      },
    
      stopAnimations: function (types, recursive) {
        var id;
        if (!types) {
          types = this.getAnimationTypes();
        } else if (!isArray(types)) {
          types = [types];
        }
        each(types, function (type) {
          id = hasId(type) ? type._getId() : type;
          if (hasOwn.call(this.animations, id)) {
            each(this.animations[id], function (a) {
              //TODO - Should the complete callback be called before removing?
              if (a) {
                a.remove();
              }
              a = null;
              delete this.animations[id][a];
              if (recursive) {
                each(this.items, function (item) {
                  item.stopAnimations(types, recursive);
                });
              }
            }, this);
            this.animations[id] = [];
          }
        }, this);
        return this;
      },

      bind: function (type, callback) {
        return this.bindItem(this, type, callback);
      },

      bindItem: function (item, type, callback) {
        if (this.delegate) {
          this.delegate.bindItem(item, type, callback);
        }
        return this;
      },

      unbind: function (type) {
        return this.unbindItem(this, type);
      },

      unbindItem: function (item, type) {
        if (this.delegate) {
          this.delegate.unbindItem(item, type);
        }
        return this;
      },

      trigger: function (type, e) {
        return this.triggerItem(this, type, e);
      },

      triggerItem: function (item, type, e) {
        if (this.delegate) {
          this.delegate.triggerItem(item, type, e);
        }
        return this;
      },

      enableBinds: function (recursive) {
        this.binds_enabled = true;
        if (recursive) {
          each(this.items, function (item) {
            item.enableBinds(recursive);
          }, this);
        }
        this.needsRedraw();
        return this;
      },

      disableBinds: function (recursive) {
        this.binds_enabled = false;
        if (recursive) {
          each(this.items, function (item) {
            item.disableBinds(recursive);
          }, this);
        }
        this.needsRedraw();
        return this;
      },

      bindsEnabled: function () {
        return this.binds_enabled && this.delegate && this.delegate.bindsEnabled();
      },

      addItem: function (item) {
        return this.addItemAtIndex(item, this.items.length);
      },

      addItemAtIndex: function (item, index) {
        if (index > this.items.length) {
          return false;
        }
        splice.call(this.items, index, 0, item);
        item.setDelegate(this);
        this.needsRedraw();
        return this;
      },
    
      itemAtIndex: function (index) {
        return index >= 0 && index < this.items.length ? this.items[index] : false;
      },
    
      itemWithTag: function (tag) {
        var found = false;
        each(this.items, function (item) {
          if (item.tag === tag) {
            found = item;
            return false;
          }
        });
        return found;
      },
    
      itemsWithTag: function (tag) {
        var items = [];
        each(this.items, function (item) {
          if (item.tag === tag) {
            push.call(items, item);
          }
        });
        return items;
      },
    
      itemIndex: function (item) {
        var i = indexOf.call(this.items, item);
        return i < 0 ? false : i;
      },

      itemIndexPath: function (item) {
        var path = false,
          index = this.itemIndex(item);
        if (index !== false) {
          return [index];
        }
        each(this.items, function (v, i) {
          path = v.itemIndexPath(item);
          if (path !== false) {
            splice.call(path, 0, i);
            return false;
          }
        }, this);
        return path;
      },

      itemHasHigherZ: function (a, b) {
        return this.pathHasHigherZ(this.itemIndexPath(a), this.itemIndexPath(b));
      },

      pathHasHigherZ: function (path_a, path_b) {
        var i, l;

        if (!path_a || !path_b) {
          return false;
        }

        l = path_a.length < path_b.length ? path_a.length : path_b.length;

        for (i = 0; i < l; i += 1) {
          if (path_a[i] > path_b[i]) {
            return true;
          }
          if (path_a[i] < path_b[i]) {
            return false;
          }
        }
        return path_a.length > path_b.length ? true : false;
      },

      itemWithHighestZ: function (items) {
        var highest, path, item;
        each(items, function (v, i) {
          path = this.itemIndexPath(v);
          if (i === 0) {
            highest = path;
            item = v;
            return;
          }
          if (this.pathHasHigherZ(path, highest)) {
            highest = path;
            item = v;
          }
        }, this);
        return item;
      },

      itemsOfType: function (types) {
        var items = [];
        if (!isArray(types)) {
          types = [types];
        }
        each(this.items, function (item) {
          each(types, function (type) {
            if (item.isKindOf(type)) {
              push.call(items, item);
              return false;
            }
          });
        });
        return items;
      },
    
      itemIndexWithTag: function (tag) {
        var index = null;
        each(this.items, function (item, i) {
          if (item.tag === tag) {
            index = i;
            return false;
          }
        });
        return index;
      },
    
      itemExists: function (item) {
        return this.itemIndex(item) === false ? false : true;
      },
    
      itemWithTagExists: function (tag) {
        return this.itemWithTag(tag) === false ? false : true;
      },
    
      itemAtIndexExists: function (index) {
        return index === null || this.itemAtIndex(index) === false ? false : true;
      },
    
      removeItem: function (item, preserve) {
        return this.removeItemAtIndex(this.itemIndex(item), preserve);
      },
    
      removeItemAtIndex: function (index, preserve) {
        var item = this.itemAtIndex(index);
        if (item) {
          item.stopAnimations(null, true);
          if (!preserve) {
            item.unbind();
            each(shallowClone(item.items), function (child) {
              item.removeItem(child, preserve);
            }, this);
          }
          splice.call(this.items, index, 1);
          delete item.delegate;
          this.needsRedraw();
        }
        return this;
      },
    
      removeItemWithTag: function (tag, preserve) {
        return this.removeItemAtIndex(this.itemIndexWithTag(tag), preserve);
      },

      removeItemsOfType: function (types, preserve) {
        return this.removeItems(this.itemsOfType(types), preserve);
      },
    
      removeAllItems: function (preserve) {
        return this.removeItems(this.items, preserve);
      },
    
      removeItems: function (items, preserve) {
        each(shallowClone(items), function (item) {
          this.removeItem(item, preserve);
        }, this);
        this.needsRedraw();
        return this;
      },

      removeFromParent: function (preserve) {
        if (this.delegate) {
          this.delegate.removeItem(this, preserve);
        }
        return this;
      },
    
      moveItemForward: function (item) {
        return this.moveItemAtIndexForward(this.itemIndex(item));
      },
    
      moveItemWithTagForward: function (tag) {
        return this.moveItemAtIndexForward(this.itemIndexWithTag(tag));
      },
    
      moveItemAtIndexForward: function (index) {
        if (!this.itemAtIndexExists(index)) {
          return false;
        }
        if (index < this.items.length - 1) {
          splice.call(this.items, index + 1, 0, splice.call(this.items, index, 1)[0]);
          this.needsRedraw();
        }
        return true;
      },
    
      moveItemBack: function (item) {
        return this.moveItemAtIndexBack(this.itemIndex(item));
      },
    
      moveItemWithTagBack: function (tag) {
        return this.moveItemAtIndexBack(this.itemIndexWithTag(tag));
      },
    
      moveItemAtIndexBack: function (index) {
        if (!this.itemAtIndexExists(index)) {
          return false;
        }
        if (index > 0) {
          splice.call(this.items, index - 1, 0, splice.call(this.items, index, 1)[0]);
          this.needsRedraw();
        }
        return true;
      },
    
      moveItemToBack: function (item) {
        return this.moveItemAtIndexToBack(this.itemIndex(item));
      },
    
      moveItemWithTagToBack: function (tag) {
        return this.moveItemAtIndexToBack(this.itemIndexWithTag(tag));
      },
    
      moveItemAtIndexToBack: function (index) {
        if (!this.itemAtIndexExists(index)) {
          return false;
        }
        splice.call(this.items, 0, 0, splice.call(this.items, index, 1)[0]);
        this.needsRedraw();
        return true;
      },
    
      moveItemToFront: function (item) {
        return this.moveItemAtIndexToFront(this.itemIndex(item));
      },
    
      moveItemWithTagToFront: function (tag) {
        return this.moveItemAtIndexToFront(this.itemIndexWithTag(tag));
      },
    
      moveItemAtIndexToFront: function (index) {
        var to_index;
        if (!this.itemAtIndexExists(index)) {
          return false;
        }
        to_index = this.items.length - 1;
        splice.call(this.items, to_index, 0, splice.call(this.items, index, 1)[0]);
        this.needsRedraw();
        return true;
      },
    
      moveItemToIndex: function (item, to_index) {
        return this.moveItemAtIndexToIndex(this.itemIndex(item), to_index);
      },
    
      moveItemWithTagToIndex: function (tag, to_index) {
        return this.moveItemAtIndexToIndex(this.itemIndexWithTag(tag), to_index);
      },
    
      moveItemAtIndexToIndex: function (index, to_index) {
        if (!this.itemAtIndexExists(index) || to_index >= this.items.length) {
          return false;
        }
        splice.call(this.items, to_index, 0, splice.call(this.items, index, 1)[0]);
        this.needsRedraw();
        return true;
      }
    })
  });


  extend(gyudon, {
    Manager: gyudon.Container.extend('gyudon.Manager', {
    
      init: function (width, height) {
        gyudon.Manager._super.prototype.init.call(this);
        this.width = width;
        this.height = height;
        this.canvas = new gyudon.Canvas(width, height);
        this.e = this.canvas.e;
        this.timer_callback = null;
        this.background = null;
        this.show_fps = true;
        this.fps = [];
        this.zoom = 1;
        this.offset = new gyudon.Coord(0, 0);
        this.bind_manager = new gyudon.BindManager(this.e);
      },

      _drawItem: function (container, move, global_pos, recalc_all, alpha) {
        each(container.items, function (item) {
          var current_global_pos, current_alpha, did_recalc = false, rotated_origin, rotated_move;
          if (item.hidden) {
            return;
          }
          this.canvas.context.save();
          if (container === this && item.fix_to_canvas) {
            this.canvas.context.scale(1 / this.zoom, 1 / this.zoom);
            this.canvas.context.translate(-this.offset.x, -this.offset.y);
            current_global_pos = new gyudon.GlobalPos(0, 0, 0, 1);
            if (recalc_all || (item.needs_global_pos && (!item.global_pos || item.needs_recalc))) {
              item.global_pos = current_global_pos;
              did_recalc = true;
            }
          } else {
            if (recalc_all || !item.global_pos || item.needs_recalc) {
              rotated_origin = gyudon.Math.rotatePoint(
                item.frame.origin,
                item.rotate,
                item.pivot
              );

              rotated_move = gyudon.Math.rotatePoint(
                new gyudon.Coord(
                  item.move.x + rotated_origin.x,
                  item.move.y + rotated_origin.y
                ),
                global_pos.angle,
                new gyudon.Coord(0, 0)
              );

              current_global_pos = new gyudon.GlobalPos(
                rotated_move.x + global_pos.origin.x,
                rotated_move.y + global_pos.origin.y,
                item.rotate + global_pos.angle,
                this.zoom
              );
              item.global_pos = new gyudon.GlobalPos(
                current_global_pos.origin.x * this.zoom + this.offset.x,
                current_global_pos.origin.y * this.zoom + this.offset.y,
                current_global_pos.angle,
                this.zoom
              );
              did_recalc = true;
            }
          }
          if (!current_global_pos) {
            current_global_pos = new gyudon.GlobalPos(
              (item.global_pos.origin.x - this.offset.x) / this.zoom,
              (item.global_pos.origin.y - this.offset.y) / this.zoom,
              item.global_pos.angle,
              this.zoom
            );
          }

          //TODO - image alpha for IE
          //if (this.items[i].is(gyudon.Item.Image)) {
          //  this.canvas.alpha(1);
          //} else {
          //}

          current_alpha = alpha * item.alpha;
          this.canvas.alpha(current_alpha);

          this.canvas.context.translate(
            item.pivot.x + item.move.x + move.x,
            item.pivot.y + item.move.y + move.y
          );
          this.canvas.rotate(item.rotate);
          this.canvas.context.translate(
            -item.pivot.x,
            -item.pivot.y
          );

          item.draw(this.canvas);

          this.canvas.context.translate(
            -(item.move.x + move.x),
            -(item.move.y + move.y)
          );
          this._drawItem(
            item,
            new gyudon.Coord(
              move.x + item.move.x,
              move.y + item.move.y
            ),
            current_global_pos,
            recalc_all || item.needs_recalc || did_recalc,
            current_alpha
          );
          item.needs_recalc = false;
          this.canvas.context.restore();
        }, this);
      },
    
      draw: function () {
        var past_sec, to_delete = [], global_pos;
        if (this.needs_redraw) {
          this.needs_redraw = false;
          this.canvas.clear();
          if (this.background !== null) {
            this.canvas.rect(
              new gyudon.Frame(0, 0, this.canvas.width, this.canvas.height),
              {fill: this.background, stroke: false}
            );
          }
          if (this.show_fps) {
            push.call(this.fps, (new Date()).getTime());
            past_sec = this.fps[this.fps.length - 1] - 1000;
            to_delete = [];
            each(this.fps, function (fps, i) {
              if (fps < past_sec) {
                push.call(to_delete, i);
              }
            });
            removeElements(this.fps, to_delete);
            this.canvas.text(
              this.fps.length + ' fps',
              new gyudon.Coord(700, 700),
              {align: 'right', baseline: 'bottom'}
            );
          }
          this.canvas.context.translate(this.offset.x, this.offset.y);
          this.canvas.context.scale(this.zoom, this.zoom);

          global_pos = new gyudon.GlobalPos(0, 0, 0, this.zoom);

          this._drawItem(
            this,
            new gyudon.Coord(0, 0),
            global_pos,
            this.needs_recalc,
            1
          );
          this.needs_recalc = false;
        }
      },

      getRootDelegate: function () {
        return this;
      },

      updateCursor: function (type) {
        this.e.style.cursor = type;
      },

      sendRedrawNotice: function () {
        this.needs_redraw = true;
        return this;
      },
    
      start: function () {
        if (!this.timer_callback) {
          this.timer_callback = gyudon.Timer.add(this, this.draw);
        } else {
          this.timer_callback.restart();
        }
        this.restartAnimations();
        each(this.items, function (item) {
          item.restartAnimations();
        }, this);
        return this;
      },
    
      stop: function () {
        if (this.timer_callback) {
          this.timer_callback.pause();
        }
        this.pauseAnimations();
        each(this.items, function (item) {
          item.pauseAnimations();
        });
        return this;
      },

      destroy: function () {
        this.stopAnimations();
        gyudon.Timer.destroy();
        this.bind_manager.destroy();
        this.canvas.destroy();
        delete this.canvas;
        delete this.e;
        delete this.bind_manager;
      },
    
      wait: function (duration, func, context) {
        return gyudon.Timer.add(this, function (callback) {
          if (callback.count >= callback.steps) {
            func.call((context || this));
          }
        }, duration);
      },

      bindItem: function (item, type, callback) {
        this.bind_manager.bind(item, type, callback);
        return this;
      },

      unbindItem: function (item, type) {
        if (type) {
          this.bind_manager.unbindItemOfType(item, type);
        } else {
          this.bind_manager.unbindItem(item);
        }
        return this;
      },

      trigger: function (type, e) {
        this.bind_manager.trigger(this.items, type, e);
        return this;
      },

      triggerItem: function (item, type, e) {
        this.bind_manager.trigger(item, type, e);
        return this;
      },

      removeFromParent: function () {},

      setEnableBinds: function (enable) {
        this.bind_manager.enable = !!enable;
      },

      bindsEnabled: function () {
        return this.binds_enabled;
      },

      containsPos: function () {
        return true;
      },
    
      setShift: function (shift) {
        this.canvas.shift = shift;
        this.needsRedraw();
        return this;
      },
    
      setBackground: function (background) {
        this.background = background;
        this.needsRedraw();
        return this;
      },
    
      clearBackground: function () {
        this.background = null;
        this.needsRedraw();
        return this;
      },

      setZoom: function (zoom) {
        this.zoom = zoom;
        this.needsRedraw();
        return this;
      },

      setZoomBy: function (zoom) {
        return this.setZoom(this.zoom + zoom);
      },

      setOffset: function (offset) {
        this.offset = new gyudon.Coord(offset.x, offset.y);
        this.needsRedraw();
        return this;
      },

      setOffsetBy: function (offset) {
        return this.setOffset(new gyudon.Coord(this.offset.x + offset.x, this.offset.y + offset.y));
      },

      zoomTo: function (duration, zoom, complete) {
        return this.animate(
          duration,
          new gyudon.Animation.ZoomTo(),
          {
            start: this.zoom,
            end: zoom
          },
          complete
        );
      },

      zoomBy: function (duration, diff, complete) {
        return this.zoomTo(duration, this.zoom + diff, complete);
      },

      offsetTo: function (duration, offset, complete) {
        return this.animate(
          duration,
          new gyudon.Animation.OffsetTo(),
          {
            start: new gyudon.Coord(this.offset.x, this.offset.y),
            end: new gyudon.Coord(offset.x, offset.y)
          },
          complete
        );
      },

      offsetBy: function (duration, diff, complete) {
        return this.offsetTo(
          duration,
          new gyudon.Coord(
            this.offset.x + diff.x,
            this.offset.y + diff.y
          ),
          complete
        );
      }
    
    })
  });

  //gyudon.Manager.serialise = function (items) {
  //  return '';//TODO
  //};

  //gyudon.Manager.unserialise = function (str) {
  //  return [];//TODO
  //};


  extend(gyudon, {
    Item: gyudon.Container.extend('gyudon.Item', {
    
      init: function (options) {
        gyudon.Item._super.prototype.init.call(this);

        options = options || {};

        addDefaults(options, {
          dragable: false,
          stroke: false,
          fill: false,
          shift: null,
          scale: new gyudon.Size(1, 1),
          rotate: 0,
          pivot: new gyudon.Coord(0, 0),
          move: new gyudon.Coord(0, 0),
          frame: new gyudon.Frame(0, 0, 1, 1),
          alpha: 1,
          hidden: false,
          tag: null,
          stroke_width: 1,
          fix_to_canvas: false,
          bubbles: false
        });
  
        options.move = new gyudon.Coord(
          options.frame.origin.x + options.move.x,
          options.frame.origin.y + options.move.y
        );
  
        options.frame = new gyudon.Frame(
          0,
          0,
          options.frame.size.width * options.scale.width,
          options.frame.size.height * options.scale.height
        );

        if (options.points) {
          each(options.points, function (point) {
            point.x *= options.scale.width;
            point.y *= options.scale.height;
          });
        }

        delete options.scale;
  
        each(options, function (v, key) {
          if (typeof this[key] === 'undefined') {
            this[key] = v;
          }
        }, this);

        this.setDragable(this.dragable);
  
        if (!this.stroke && !this.fill) {
          this.stroke = new gyudon.Colour(0, 0, 0);
        }
      },
  
      getFrame: function () {
        return new gyudon.Frame(this.move.x, this.move.y, this.frame.size.width, this.frame.size.height);
      },

      setDragable: function (dragable) {
        if (!this.delegate) {
          this.queueAction('setDragable', [dragable]);
          return this;
        }
        this.dragable = !!dragable;
        if (this.dragable) {
          this.bind('down', this.triggerDragCallback);
          this.bind('dragstart', this.triggerDragCallback);
          this.bind('dragmove', this.triggerDragCallback);
          this.bind('over', this.triggerDragCallback);
          this.bind('moveinside', this.triggerDragCallback);
          this.bind('out', this.triggerDragCallback);
        //} else {
          //TODO - unbind
        }
        this.needsRedraw();
        return this;
      },

      triggerDragCallback: function (e, type) {
        if (type === 'down') {
          this.down_pos = new gyudon.Coord(e.pos.x, e.pos.y);
          this.down_move = new gyudon.Coord(this.move.x, this.move.y);
        } else if (type === 'dragstart' || type === 'dragmove') {
          this.moveTo(0, new gyudon.Coord(
            (e.pos.x - this.down_pos.x) / this.global_pos.zoom + this.down_move.x,
            (e.pos.y - this.down_pos.y) / this.global_pos.zoom + this.down_move.y
          ));
        } else if (type === 'over' || type === 'moveinside') {
          this.updateCursor('pointer');
        } else if (type === 'out') {
          this.updateCursor('default');
        }
        return this;
      },
    
      setRotate: function (rotate) {
        this.rotate = rotate;
        this.needsRedraw();
        return this;
      },
    
      setRotateBy: function (rotate) {
        this.rotate += rotate;
        this.needsRedraw();
        return this;
      },

      setPivot: function (pivot) {
        this.pivot = pivot;
        this.needsRedraw();
        return this;
      },
    
      setAlpha: function (alpha) {
        this.alpha = alpha;
        this.needsRedraw();
        return this;
      },
    
      setFill: function (fill) {
        this.fill = fill;
        this.needsRedraw();
        return this;
      },
    
      setSize: function (size) {
        this.frame.size = new gyudon.Size(size.width, size.height);
        this.updatePoints();
        this.needsRedraw();
        return this;
      },

      updatePoints: function () {
        var bounded_frame, ratio;

        if (this.points) {
          bounded_frame = gyudon.Math.boundedFrame(this.points);
          ratio = new gyudon.Size(
            bounded_frame.size.width / this.frame.size.width,
            bounded_frame.size.height / this.frame.size.height
          );
          each(this.points, function (point) {
            point.x = (point.x - bounded_frame.origin.x) / ratio.width;
            point.y = (point.y - bounded_frame.origin.y) / ratio.height;
          }, this);
        }

        return this;
      },
    
      draw: function () {},

      containsGlobalPoint: function (global) {
        if (!this.global_pos) {
          return false;
        }
        var local = gyudon.Math.globalPointToLocal(global, this.global_pos);
        return this.containsLocalPoint(local);
      },

      containsLocalPoint: function (local) {
        return gyudon.Math.isBoundByFrame(
          local,
          new gyudon.Frame(
            this.frame.origin.x,
            this.frame.origin.y,
            this.frame.size.width,
            this.frame.size.height
          )
        );
      },
    
      show: function () {
        this.hidden = false;
        this.needsRedraw();
        return this;
      },
    
      hide: function () {
        this.hidden = true;
        this.needsRedraw();
        return this;
      },

      moveTo: function (duration, point, complete) {
        return this.animate(
          duration,
          new gyudon.Animation.MoveTo(),
          {
            start: new gyudon.Coord(this.move.x, this.move.y),
            end: new gyudon.Coord(point.x, point.y)
          },
          complete
        );
      },

      moveBy: function (duration, dist, complete) {
        return this.moveTo(
          duration,
          new gyudon.Coord(
            this.move.x + dist.x,
            this.move.y + dist.y
          ),
          complete
        );
      },

      fadeTo: function (duration, alpha, complete) {
        return this.animate(
          duration,
          new gyudon.Animation.FadeTo(),
          {
            start: this.alpha,
            end: alpha 
          },
          complete
        );
      },
    
      fadeBy: function (duration, diff, complete) {
        return this.fadeTo(duration, this.alpha + diff, complete);
      },
    
      fadeIn: function (duration, complete) {
        return this.fadeTo(duration, 1, complete);
      },
    
      fadeOut: function (duration, complete) {
        return this.fadeTo(duration, 0, complete);
      },
    
      scaleTo: function (duration, scale, complete) {
        return this.animate(
          duration,
          new gyudon.Animation.ScaleTo(),
          {
            start: new gyudon.Size(this.frame.size.width, this.frame.size.height),
            end: scale 
          },
          complete
        );
      },
    
      scaleBy: function (duration, diff, complete) {
        return this.scaleTo(
          duration,
          new gyudon.Size(
            this.frame.size.width * diff.width,
            this.frame.size.height * diff.height
          ),
          complete
        );
      },
    
      rotateTo: function (duration, rotate, complete) {
        return this.animate(
          duration,
          new gyudon.Animation.RotateTo(),
          {
            start: this.rotate,
            end: rotate
          },
          function (count, steps, d) {
            this.rotate = gyudon.Math.normalise(this.rotate, gyudon.Math.TWO_PI);
            if (typeof complete === 'function') {
              complete.call(this, count, steps, d);
            }
          }
        );
      },
    
      rotateBy: function (duration, diff, complete) {
        return this.rotateTo(duration, this.rotate + diff, complete);
      }
    
    })

  });


  extend(gyudon.Item, {
    Polygon: gyudon.Item.extend('gyudon.Item.Polygon', {
    
      init: function (options) {
        var points, i, interior, angle, points_generated = false,
          width, height, x, y, radius, bounded_frame;

        options = options || {};

        addDefaults(options, {
          points: []
        });

        if (!options.frame) {
          if (options.size) {
            width = options.size.width;
            height = options.size.height;
          } else {
            width = 0;
            height = 0;
          }
          if (options.center) {
            x = options.center.x - width / 2;
            y = options.center.y - height / 2;
            //options.pivot = options.center;
          } else {
            x = 0;
            y = 0;
          }
          options.frame = new gyudon.Frame(x, y, width, height);
        }

        if (typeof options.points === 'number') {
          points_generated = true;

          points = [];

          interior = 360 / options.points;

          radius = options.frame.size.width / 2;
  
          for (i = 0; i < options.points; i += 1) {
            angle = (90 - interior * i) / 180 * Math.PI;

            push.call(points, new gyudon.Coord(
              radius * gyudon.Math.cos(angle) + radius,
              -radius * gyudon.Math.sin(angle) + radius
            ));
          }

          options.points = points;
        }
  
        bounded_frame = gyudon.Math.boundedFrame(options.points);

        each(options.points, function (v) {
          v.x -= bounded_frame.origin.x;
          v.y -= bounded_frame.origin.y;
        });

        options.frame.origin.x += bounded_frame.origin.x;
        options.frame.origin.y += bounded_frame.origin.y;

        options.frame.size = bounded_frame.size;
  
        gyudon.Item.prototype.init.call(this, options);
      },

      draw: function (canvas) {
        canvas.polygon(
          this.points,
          {
            fill: this.fill,
            stroke: this.stroke,
            stroke_width: this.stroke_width,
            shift: this.shift
          }
        );
      },

      containsLocalPoint: function (local) {
        var prev, odd = false;
        if (!gyudon.Item.prototype.containsLocalPoint.call(this, local)) {
          return false;
        }
        each(this.points, function (point, i) {
          prev = this.points[(i === 0 ? this.points.length : i) - 1];
          if (((point.y <= local.y && local.y < prev.y) ||
              (prev.y <= local.y && local.y < point.y)) &&
              (local.x >= point.x || local.x >= prev.x) &&
              local.x > point.x + (local.y - point.y) / (prev.y - point.y) * (prev.x - point.x)) {
            odd = !odd;
          }
        }, this);
        return odd;
      }
    })
  });

  extend(gyudon.Item, {
    Rect: gyudon.Item.Polygon.extend('gyudon.Item.Rect', {
    
      init: function (options) {
        options = options || {};

        options.points = [
          new gyudon.Coord(0, 0),
          new gyudon.Coord(options.frame.size.width, 0),
          new gyudon.Coord(options.frame.size.width, options.frame.size.height),
          new gyudon.Coord(0, options.frame.size.height)
        ];

        gyudon.Item.Polygon.prototype.init.call(this, options);
      }
    }),
    
    Image: gyudon.Item.extend('gyudon.Item.Image', {
    
      init: function (options) {
        var that = this, has_frame, onload, src;
        options = options || {};

        addDefaults(options, {
          src: null,
          scale: new gyudon.Size(1, 1),
          clip: new gyudon.Frame(0, 0, 0, 0)
        });

        has_frame = !!options.frame;

        src = options.src;
        delete options.src;

        this.loaded = false;
        this.image  = new Image();

        if (typeof options.onload === 'function') {
          onload = options.onload;
        }
        delete options.onload;

        // this.image.onload doesn't get called until this.image.src is populated below
        this.image.onload = function () {
          that.loaded = true;
          that.needsRedraw();

          if (!has_frame) {
            that.frame.size = new gyudon.Size(
              that.image.width * that.frame.size.width,
              that.image.height * that.frame.size.height
            );
          }

          if (onload) {
            onload.call(that);
            onload = null;
          }

          that.image.onload = null;
          that.image.onerror = null;
          that = null;
        };

        if (typeof options.onerror === 'function') {
          this.image.onerror = options.onerror;
        }
        delete options.onerror;

        gyudon.Item.prototype.init.call(this, options);

        if (typeof src === 'string') {
          this.image.src = src;
        }

        src = null;
        options = null;
      },
    
      draw: function (canvas) {
        if (this.loaded) {
          canvas.image(
            this.image,
            this.frame.origin,
            {
              size: this.frame.size,
              clip: this.clip,
              shift: this.shift,
              alpha: this.alpha //TODO - image alpha on IE
            }
          );
        }
      },

      setSrc: function (src, onload, onerror) {
        var that = this;

        this.loaded = false;
        this.image = new Image();
        this.image.onload = function () {
          that.loaded = true;
          that.needsRedraw();

          if (typeof onload === 'function') {
            onload.call(that);
          }
          onload = null;

          that.image.onload = null;
          that.image.onerror = null;
          that = null;
        };
        if (typeof onerror === 'function') {
          this.image.onerror = onerror;
        }

        this.image.src = src;

        onerror = null;
        src = null;

        return this;
      },

      destroy: function () {
        if (typeof this.image === 'object') {
          this.image.onerror = null;
          this.image.onload = null;
        }
        delete this.image;
        gyudon.Item.prototype.destroy.call(this);
      }
    
    }),
    
    Circle: gyudon.Item.extend('gyudon.Item.Circle', {
    
      init: function (options) {
        options = options || {};

        addDefaults.call(options, {
          radius: 1,
          center: new gyudon.Coord(0, 0)
        });
  
        if (hasOwn.call(options, 'frame')) {
          delete options.radius;
          delete options.center;
        } else {
          options.frame = new gyudon.Frame(
            options.center.x - options.radius,
            options.center.y - options.radius,
            options.radius * 2,
            options.radius * 2
          );
        }

        if (options.center_pivot && options.radius) {
          options.frame.origin.x += options.radius;
          options.frame.origin.y += options.radius;
        }
  
        gyudon.Item.prototype.init.call(this, options);
      },

      getRadius: function () {
        return this.frame.size.width / 2;
      },

      getCenter: function () {
        var radius = this.getRadius();
        return new gyudon.Coord(radius, radius);
      },
    
      draw: function (canvas) {
        canvas.circle(
          this.getCenter(),
          this.getRadius(),
          {
            fill: this.fill,
            stroke: this.stroke,
            stroke_width: this.stroke_width,
            shift: this.shift
          }
        );
      },

      containsLocalPoint: function (local) {
        var radius = this.getRadius(),
          center = this.getCenter();
        return gyudon.Math.distance(center, local) <= radius;
      }
    
    }),

    Lines: gyudon.Item.extend('gyudon.Item.Lines', {
    
      init: function (options) {
        var points = [];

        options = options || {};

        addDefaults(options, {
          lines: []
        });
  
        each(options.lines, function (v) {
          push.call(points, v.start);
          push.call(points, v.end);
        });
  
        options.frame = gyudon.Math.boundedFrame(points);
  
        gyudon.Item.prototype.init.call(this, options);
      },
    
      draw: function (canvas) {
        canvas.lines(
          this.lines,
          {
            stroke: this.stroke,
            stroke_width: this.stroke_width,
            shift: this.shift
          }
        );
      }
    
    }),
  
    Text: gyudon.Item.extend('gyudon.Item.Text', {
    
      init: function (options) {
        options = options || {};

        addDefaults(options, {
          text: '',
          coord: new gyudon.Coord(0, 0),
          font: 'normal 12px sans-serif',
          baseline: 'top',
          align: 'left'
        });
  
        options.frame = new gyudon.Frame(options.coord.x, options.coord.y, 1, 1);

        delete options.coord;
  
        gyudon.Item.prototype.init.call(this, options);
      },

      setText: function (text) {
        this.text = text;
        this.needsRedraw();
        return this;
      },
    
      draw: function (canvas) {
        canvas.text(
          this.text,
          this.frame.origin,
          {
            align: this.align,
            baseline: this.baseline,
            font: this.font,
            fill: this.fill,
            stroke: this.stroke,
            stroke_width: this.stroke_width,
            shift: this.shift
          }
        );
      }
    
    })
  });

  window.gyudon = gyudon; // Provide window with a reference to gyudon

}(window));
