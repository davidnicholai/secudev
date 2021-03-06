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

        if ($scope.transactions.length < 1)
          $scope.error = 'No hits';

        for (var i = 0; i < $scope.transactions.length; i++) {
          for (var j = 0; j < $scope.transactions[i].order.length; j++) {
            if (!$scope.transactions[i].order[j].itemName)
              $scope.transactions[i].order[j].itemName = '[deleted item]';
          } 
        }
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    $scope.searchTransactions = function () {
      var searchQueries = {
        dateTo: $scope.dateTo,
        dateFrom: $scope.dateFrom
      };

      $http.post('/transactions', searchQueries).success(function (response) {
        $scope.transactions = response;

        if ($scope.transactions.length < 1)
          $scope.error = 'No hits';

        for (var i = 0; i < $scope.transactions.length; i++) {
          for (var j = 0; j < $scope.transactions[i].order.length; j++) {
            if (!$scope.transactions[i].order[j].itemName)
              $scope.transactions[i].order[j].itemName = '[deleted item]';
          } 
        }
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    
  }
]);