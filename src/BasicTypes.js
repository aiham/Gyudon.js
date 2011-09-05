  extend(gyudon, {
    Coord: gyudon.Object.extend('gyudon.Coord', {
      init: function (x, y) {
        this.x = x;
        this.y = y;
      }
    }),
    
    Size: gyudon.Object.extend('gyudon.Size', {
      init: function (width, height) {
        this.width  = width;
        this.height = height;
      }
    }),
    
    Line: gyudon.Object.extend('gyudon.Line', {
      init: function (x1, y1, x2, y2) {
        this.start = new gyudon.Coord(x1, y1);
        this.end = new gyudon.Coord(x2, y2);
      }
    }),
    
    Frame: gyudon.Object.extend('gyudon.Frame', {
      init: function (x, y, width, height) {
        this.origin = new gyudon.Coord(x, y);
        this.size = new gyudon.Size(width, height);
      }
    }),

    GlobalPos: gyudon.Object.extend('gyudon.GlobalPos', {
      init: function (x, y, angle, zoom) {
        this.origin = new gyudon.Coord(x, y);
        this.angle = angle;
        this.zoom = zoom;
      }
    }),

    Gradient: gyudon.Object.extend('gyudon.Gradient', {//TODO
      init: function (line, colours) {
        this.line = line;
        this.colours = colours;
      }
    })
  });
