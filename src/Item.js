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
