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

      containsGlobalPoint: function () {
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
