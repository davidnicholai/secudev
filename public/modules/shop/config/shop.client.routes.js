'use strict';

//Setting up route
angular.module('shop').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.
    state('editShop', {
      url: '/shop',
      templateUrl: 'modules/shop/views/view-shop.client.view.html'
    }).
    state('manageShop', {
      url: '/shop/manage',
      templateUrl: 'modules/shop/views/manage-shop.client.view.html'
    }).
    state('viewCart', {
      url: '/shop/cart',
      templateUrl: 'modules/shop/views/view-cart.client.view.html'
    }).
    state('confirmCart', {
      url: '/shop/cart/confirm',
      templateUrl: 'modules/shop/views/confirm-cart.client.view.html'
    }).
    state('viewItem', {
      url: '/shop/:itemID',
      templateUrl: 'modules/shop/views/view-item.client.view.html'
    }).
    state('addItem', {
      url: '/shop/manage/add',
      templateUrl: 'modules/shop/views/shop-admin-add-item.client.view.html'
    }).
    state('editItem', {
      url: '/shop/manage/edit/:itemID',
      templateUrl: 'modules/shop/views/shop-admin-edit-item.client.view.html'
    });
  }
]);