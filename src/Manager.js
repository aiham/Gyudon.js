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
