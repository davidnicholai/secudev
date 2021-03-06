'use strict';

// Shops controller
angular.module('shop').controller('ShopController', ['$scope', '$stateParams', '$location', 'Authentication', 'Shop', '$http', '$window',
  function($scope, $stateParams, $location, Authentication, Shop, $http, $window) {
    $scope.authentication = Authentication;

    if (!$scope.authentication.user)
      $location.path('/signin');

    if ($scope.authentication.user.roles === 'admin')
      $scope.isAdmin = true;

    $scope.find = function () {
      $http.get('/items').success(function (response) {
        $scope.items = response;
      });
    };

    $scope.findItem = function () {
      $scope.cannotAdd = true;
      $scope.findSuccess = null;
      $scope.findError = null;
      $http.get('/items/' + $stateParams.itemID).success(function (response) {
        $scope.item = response;
        $scope.cannotAdd = false;
        $scope.findSuccess = true;
        $scope.findError = null;
      }).error(function (response) {
        $scope.findError = response.message;
      });
    };

    $scope.addToCart = function () {
      $scope.success = null;
      $scope.error = null;
      $scope.cannotAdd = true;

      var order = {
        item: $scope.item,
        quantity: $scope.quantity
      };

      $http.post('/carts', order).success(function (response) {
        $scope.success = response.message;
        $scope.cannotAdd = false;
        $location.path('/shop/cart');
      }).error(function (response) {
        $scope.error = response.message;
        $scope.cannotAdd = false;
      });
    };

  }
]);