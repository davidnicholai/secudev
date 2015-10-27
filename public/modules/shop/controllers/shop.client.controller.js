'use strict';

// Shops controller
angular.module('shop').controller('ShopController', ['$scope', '$stateParams', '$location', 'Authentication', 'Shop', '$http',
  function($scope, $stateParams, $location, Authentication, Shop, $http) {
    $scope.authentication = Authentication;

    if (!$scope.authentication.user) $location.path('/signin');

    if ($scope.authentication.user.roles === 'admin')
      $scope.isAdmin = true;

    $scope.find = function () {
      $http.get('/items').success(function (response) {
        $scope.items = response;
      });
    };

    $scope.findItem = function () {
      $http.get('/items/' + $stateParams.itemID).success(function (response) {
        $scope.item = response;
      });
    };

    $scope.addToCart = function () {
      $scope.success = null;
      $scope.error = null;

      var order = {
        item: $scope.item,
        quantity: $scope.quantity
      };

      $http.post('/carts', order).success(function (response) {
        $scope.success = response.message;
        $location.path('/shop/cart');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

  }
]);