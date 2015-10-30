'use strict';

module.exports = function(app) {
  var users = require('../../app/controllers/users.server.controller');
  var carts = require('../../app/controllers/carts.server.controller');

  // carts.init();
  // Boards Routes
  app.route('/carts')
    .get(users.requiresLogin, carts.viewCart)
    .post(users.requiresLogin, carts.addToCart)
    .put(users.requiresLogin, carts.removeFromCart);

  app.route('/carts/checkout')
    .get(users.requiresLogin, carts.checkout);

  app.route('/carts/checkout/transaction/:paymentId')
    .get(users.requiresLogin, carts.getTransaction);

  app.route('/carts/checkout/transaction')
    .post(users.requiresLogin, carts.executeTransaction);

  app.route('/carts/checkout/cancel')
    .post(users.requiresLogin, carts.cancelTransaction);

  app.route('/transactions')
    .get(users.requiresLogin, users.requiresAdmin, carts.getTransactions);
  // Finish by binding the Board middleware
  // app.param('boardId', carts.cartByID);
};