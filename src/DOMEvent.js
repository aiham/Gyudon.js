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
