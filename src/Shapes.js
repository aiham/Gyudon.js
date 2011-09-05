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
