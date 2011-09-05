(function (window) {

  'use strict';

<?php import('Util'); ?>

  extend(gyudon, {
    strict: false,

    restorePrevious: function () {
      window.gyudon = _gyudon;
      return this;
    },

    errors: [],

    destroy: function () {
      this.Timer.destroy();
      delete this.Timer;
    },

    version: <?php echo $version; ?> 
  });

<?php

import(array(
  'Object', 'Math', 'Timer', 'Support', 'DOMEvent',
  'BasicTypes', 'Animation', 'Colour', 'Canvas',
  'BindManager', 'Container', 'Manager', 'Item', 'Shapes'
));

?>

  window.gyudon = gyudon; // Provide window with a reference to gyudon

}(window));
