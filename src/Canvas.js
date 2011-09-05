  extend(gyudon, {
    Canvas: gyudon.Object.extend('gyudon.Canvas', {
    
      init: function (width, height, shift) {
        var dummy_canvas = document.createElement('canvas');
        this.canvas_support = typeof dummy_canvas.getContext === 'function';
        this.text_support = this.canvas_support && typeof dummy_canvas.getContext('2d').fillText === 'function';
    
        this.width = width;
        this.height = height;
        this.shift = typeof shift === 'undefined' ? 0.5 : shift;
        this.e = document.createElement('canvas');
        this.e.setAttribute('width', this.width);
        this.e.setAttribute('height', this.height);
        if (typeof window.G_vmlCanvasManager !== 'undefined') {
          this.e.display = false;
          document.body.appendChild(this.e);
          this.e = window.G_vmlCanvasManager.initElement(this.e);
          this.context = this.e.getContext('2d');
          this.e = document.body.removeChild(this.e);
        } else {
          this.context = this.e.getContext('2d');
        }
        dummy_canvas = null;
      },

      destroy: function () {
        delete this.e;
        delete this.context;
      },
    
      alpha: function (alpha) {
        if (!alpha) {
          alpha = 0;
        }
        this.context.globalAlpha = alpha;
      },
    
      clear: function () {
        this.context.clearRect(0, 0, this.width, this.height);
      },
    
      line: function (start, end, options) {
        var shift;
        if (!start) {
          start = new gyudon.Coord(0, 0);
        }
        if (!end) {
          end = new gyudon.Coord(0, 0);
        }
        if (!options) {
          options = {};
        }
        shift = options.shift !== false ? this.shift : 0;
        this.context.moveTo(start.x + shift, start.y + shift);
        this.context.lineTo(end.x + shift, end.y + shift);
      },
    
      lines: function (lines, options) {
        if (!lines) {
          lines = [];
        }
        if (!options) {
          options = {};
        }
        this.context.beginPath();
        each(lines, function (line) {
          this.line(line.start, line.end, options);
        }, this);
        this.context.closePath();
        if (options.stroke_width) {
          this.context.lineWidth = options.stroke_width;
        }
        this.context.strokeStyle = options.stroke;
        this.context.stroke();
      },
    
      path: function (points, options) {
        var shift;
        if (!points) {
          points = [];
        }
        if (!options) {
          options = {};
        }
        shift = options.shift !== false ? this.shift : 0;

        this.context.beginPath();
        each(points, function (point, i) {
          if (i === 0) {
            this.context.moveTo(point.x + shift, point.y + shift);
          } else {
            this.context.lineTo(point.x + shift, point.y + shift);
          }
        }, this);
        this.context.closePath();
        if (options.fill) {
          this.context.fillStyle = options.fill;
          this.context.fill();
        }
        if (options.stroke) {
          if (options.stroke_width) {
            this.context.lineWidth = options.stroke_width;
          }
          this.context.strokeStyle = options.stroke;
          this.context.stroke();
        }
      },
    
      polygon: function (points, options) {
        points = points || [];
        if (points.length > 0) {
          points = concat.call(points, points[0]);
        }
        return this.path(points, options);
      },
    
      square: function (center, size, options) {
        var radius;
        if (!center) {
          center = new gyudon.Coord(0, 0);
        }
        if (!size) {
          size = 1;
        }
        radius = size / 2;
        return this.rect(new gyudon.Frame(center.x - radius, center.y - radius, size, size), options);
      },
    
      rect: function (frame, options) {
        var left, top, right, bottom;
        if (!frame) {
          frame = new gyudon.Frame(0, 0, 1, 1);
        }
        left = frame.origin.x;
        top = frame.origin.y;
        right = frame.origin.x + frame.size.width;
        bottom = frame.origin.y + frame.size.height;
        return this.polygon([
          new gyudon.Coord(left, top),
          new gyudon.Coord(right, top),
          new gyudon.Coord(right, bottom),
          new gyudon.Coord(left, bottom)
        ], options);
      },
    
      circle: function (center, radius, options) {
        var shift;
        if (!options) {
          options = {};
        }
        if (!center) {
          center = new gyudon.Coord(0, 0);
        }
        if (!radius) {
          radius = 1;
        }
        shift = options.shift !== false ? this.shift : 0;

        this.context.beginPath();
        this.context.arc(center.x + shift, center.y + shift, radius, 0, gyudon.Math.TWO_PI, false);
        this.context.closePath();
        if (options.fill) {
          this.context.fillStyle = options.fill;
          this.context.fill();
        }
        if (options.stroke) {
          if (options.stroke_width) {
            this.context.lineWidth = options.stroke_width;
          }
          this.context.strokeStyle = options.stroke;
          this.context.stroke();
        }
      },
    
      text: function (str, coord, options) {
        var baseline, textalign, shift;
        if (!this.text_support) {
          return;
        }
        if (!options) {
          options = {};
        }
        if (!coord) {
          coord = new gyudon.Coord(0, 0);
        }
    
        baseline = options.baseline || 'top';
        textalign = options.align || 'left';
    
        this.context.textBaseline = baseline;
        this.context.textAlign = textalign;
    
        shift = options.shift !== false ? this.shift : 0;
    
        if (options.font) {
          this.context.font = options.font;
        }
        if (options.fill) {
          this.context.fillStyle = options.fill;
          this.context.fillText(str, coord.x + shift, coord.y + shift);
        }
        if (options.stroke) {
          this.context.strokeStyle = options.stroke;
          this.context.strokeText(str, coord.x + shift, coord.y + shift);
        }
      },
    
      image: function (image, coord, options) {
        var size, clip, shift;
        if (!options) {
          options = {};
        }
        coord = coord || new gyudon.Coord(0, 0);
        size = options.size || new gyudon.Size(0, 0);
        clip = options.clip || new gyudon.Frame(0, 0, 0, 0);
        shift = options.shift !== false ? this.shift : 0;

        if (size.width > 0 && size.height > 0 &&
            clip.width > 0 && clip.height > 0) {
          this.context.drawImage(image, clip.origin.x, clip.origin.y, clip.size.width, clip.size.height, coord.origin.x + shift, coord.origin.y + shift, size.width, size.height);
        } else if (size.width > 0 && size.height > 0) {
          this.context.drawImage(image, coord.x + shift, coord.y + shift, size.width, size.height);
        } else {
          this.context.drawImage(image, coord.x + shift, coord.y + shift);
          size = new gyudon.Size(image.width, image.height);
        }

        //TODO
        //var image_data = this.context.getImageData(coord.x + shift, coord.y + shift, size.width, size.height);
        //for (var i = 0, l = image_data.data.length; i < l; i += 4) {
        //  image_data.data[i+3] = options.alpha;
        //}
        //this.context.putImageData(data, coord.x + shift, coord.y + shift);
      },
    
      gradient: function (line, colours, options) {
        var shift, gradient, last;
        if (!options) {
          options = {};
        }
        shift = options && options.shift !== false ? this.shift : 0;

        gradient = this.context.createLinearGradient(
          line.start.x + shift,
          line.start.y + shift,
          line.end.x + shift,
          line.end.y + shift
        );
    
        if (isArray(colours)) {
          last = colours.length - 1;
          each(colours, function (colour, i) {
            var position = last < 1 ? 0 : 1 / last * i;
            gradient.addColorStop(position, colour);
          });
        } else {
          each(colours, function (position, colour) {
            gradient.addColorStop(position, colour);
          });
        }
        return gradient;
      },
    
      pattern: function (image, type) {
        return this.context.createPattern(image, type);
      },
    
      rotate: function (radians) {
        this.context.rotate(radians);
      }
    
    })
  });
