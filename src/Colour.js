  extend(gyudon, {
    Colour: gyudon.Object.extend('gyudon.Colour', {
      init: function (r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = typeof a === 'undefined' ? 1 : a;
      },
    
      toHex: function () {
        return '#' +
          this.r.toString(16) +
          this.g.toString(16) +
          this.b.toString(16);
      },
    
      toRgb: function () {
        return 'rgb(' +
          this.r + ',' +
          this.g + ',' +
          this.b + ')';
      },
    
      toRgba: function () {
        return 'rgba(' +
          this.r + ',' +
          this.g + ',' +
          this.b + ',' +
          this.a + ')';
      }
    })
  });
    
  gyudon.Colour.parseStr = function (str) {
    var r = 0, g = 0, b = 0, a = 1, digits;
  
    if (str.charAt(0) === '#') {
      str = str.substring(1, 7);
      r = parseInt(str.substring(0, 2), 16);
      g = parseInt(str.substring(2, 4), 16);
      b = parseInt(str.substring(4, 6), 16);
    } else {
      digits = rgbaTest.exec(str);
      
      if (digits) {
        r = parseInt(digits[1], 10);
        g = parseInt(digits[2], 10);
        b = parseInt(digits[3], 10);
        a = parseFloat(digits[4] === '' ? 1 : digits[4]);
      }
    }
  
    return new gyudon.Colour(r, g, b, a);
  };
