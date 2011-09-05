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
