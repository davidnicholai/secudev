'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', '$http', '$location',
  function($scope, Authentication, Menus, $http, $location) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');

    $scope.toggleCollapsibleMenu = function() {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function() {
      $scope.isCollapsed = false;
    });

    $scope.signout = function() {
      $http.post('/auth/signout').success(function() {
        $location.path('/');
      });
    };
  }
]);