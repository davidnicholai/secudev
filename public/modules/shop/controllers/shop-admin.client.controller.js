'use strict';

// Shops controller
angular.module('shop').controller('ShopAdminController', ['$scope', '$stateParams', '$location', 'Authentication', 'Shop',
  function($scope, $stateParams, $location, Authentication, Shop) {
    $scope.authentication = Authentication;

    if ($scope.authentication.user.roles !== 'admin') {
      $location.path('/profile');
    }

    
  }
]);