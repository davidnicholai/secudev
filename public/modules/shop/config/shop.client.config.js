'use strict';

// Configuring the Articles module
angular.module('shop').run(['Menus',
  function(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Shop', 'shop', '/shop');
  }
]);