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
