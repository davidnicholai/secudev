'use strict';

// Configuring the Articles module
angular.module('boards').run(['Menus',
  function(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Forums', 'boards', 'boards');
    // Menus.addSubMenuItem('topbar', 'boards', 'View Boards', 'boards');
    // Menus.addSubMenuItem('topbar', 'boards', 'Search Boards', 'boards/search');
  }
]);