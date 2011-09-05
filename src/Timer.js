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
