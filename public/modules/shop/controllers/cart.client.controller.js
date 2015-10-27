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

    // Below are methods for confirm-cart.client.view.html

    $scope.getTransaction = function () {
      var queries = $location.search();

      $http.get('/carts/checkout/transaction/' + queries.paymentId).success(function (response) {
        console.log('SUCCESS' + JSON.stringify(response));
      }).error(function (response) {
        console.log('ERROR: ' + JSON.stringify(response));
      });
    };

    $scope.confirmTransaction = function () {
      var queries = $location.search();
      $http.post('/carts/checkout/transaction', queries).success(function (response) {
        console.log('SUCCESS' + JSON.stringify(response));
      }).error(function (response) {
        console.log('ERROR: ' + JSON.stringify(response));
      });
    };

  }
]);