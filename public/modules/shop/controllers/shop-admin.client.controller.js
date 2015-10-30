'use strict';

// Shops controller
angular.module('shop').controller('ShopAdminController', ['$scope', '$stateParams', '$location', 'Authentication', 'Shop', '$http',
  function($scope, $stateParams, $location, Authentication, Shop, $http) {
    $scope.authentication = Authentication;

    if ($scope.authentication.user.roles !== 'admin') {
      $location.path('/profile');
    }

    $scope.getTransactions = function () {
      $http.get('/transactions').success(function (response) {
        $scope.transactions = response;
        console.log($scope.transactions);

        for (var i = 0; i < $scope.transactions.length; i++) {
          $scope.transactions[i].totalPrice = 0;
          for (var j = 0; j < $scope.transactions[i].order.length; j++) {
            $scope.transactions[i].totalPrice += $scope.transactions[i].order[j].itemPrice * $scope.transactions[i].order[j].quantity;
          }
        }
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    
  }
]);