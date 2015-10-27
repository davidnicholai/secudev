'use strict';

module.exports = function(app) {
  var users = require('../../app/controllers/users.server.controller');
  var items = require('../../app/controllers/items.server.controller');

  // Items Routes
  app.route('/items/image')
    .post(users.requiresLogin, users.requiresAdmin, items.uploadImage);

  app.route('/items')
    .get(items.list)
    .post(users.requiresLogin, items.create);

  app.route('/items/:itemId')
    .get(items.read)
    .put(users.requiresLogin, users.requiresAdmin, items.update)
    .delete(users.requiresLogin, users.requiresAdmin, items.delete);

  // Finish by binding the Item middleware
  app.param('itemId', items.itemByID);
};
