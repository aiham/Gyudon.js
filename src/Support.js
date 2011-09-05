  extend(gyudon, {
    Support: {
      canvas: function () {
        if (!hasOwn.call(gyudon.Support, '_canvas')) {
          gyudon.Support._canvas = false;//TODO
        }
        return gyudon.Support._canvas;
      },
      text: function () {
        if (!hasOwn.call(gyudon.Support, '_text')) {
          gyudon.Support._text = false;//TODO
        }
        return gyudon.Support._text;
      },
      imageAlpha: function () {
        if (!hasOwn.call(gyudon.Support, '_image_alpha')) {
          gyudon.Support._image_alpha = false;//TODO
        }
        return gyudon.Support._image_alpha;
      }
    }

  });
