'use strict';

// Shops controller
angular.module('shop').controller('CartController', ['$scope', '$stateParams', 'Authentication', '$http', '$window', '$location',
  function($scope, $stateParams, Authentication, $http, $window, $location) {
    $scope.chkOutBtn = 'Checkout';
    $scope.getCart = function () {
      $http.get('/carts').success(function (response) {
        $scope.orderInfo = response;

        $scope.totalPrice = 0;
        for (var i = 0; i < $scope.orderInfo.content.length; i++) {
          $scope.totalPrice += $scope.orderInfo.content[i].quantity * $scope.orderInfo.content[i].itemInfo.price;
        }

        if ($scope.orderInfo.content.length > 0) {
          $scope.noItems = false;
          $scope.cannotCheckout = false;
        } else {
          $scope.noItems = true;
        }
      }).error(function (response) {
        if (response.message === 'Cart does not exist')
          $scope.noItems = true;
      });
    };

    $scope.cannotCheckout = true;

    $scope.removeFromCart = function (item) {
      $http.put('/carts', item).success(function (response) {
        $window.location.reload();
      });
    };

    $scope.checkout = function () {
      $scope.cannotCheckout = true;
      $scope.chkOutBtn = 'Contacting Paypal...';
    };

    // Method below is for confirm-cart.client.controller

    $scope.executeTransaction = function () {
      $scope.purchaseStatus = 'Processing your transaction...';
      
      var queries = $location.search();
      $http.post('/carts/checkout/transaction', queries).success(function (response) {
        $scope.purchaseStatus = 'Purchase successful. Thank you for shopping!';
      }).error(function (response) {
        $scope.purchaseStatus = 'Oh no, an error occured! ' + response.message;
      });
    };

    // Method below is for cancel-cart.client.controller

    $scope.cancelTransaction = function () {
      $scope.cancelStatus = 'Cancelling your transaction...';
      
      $http.post('/carts/checkout/cancel').success(function (response) {
        $scope.cancelStatus = 'Purchase cancelled. We hope to see you soon!';
      }).error(function (response) {
        $scope.cancelStatus = 'Oh no, an error occured! ' + response.message;
      });
    };

  }
]);