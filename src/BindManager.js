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
