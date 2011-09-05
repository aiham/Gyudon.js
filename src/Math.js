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
