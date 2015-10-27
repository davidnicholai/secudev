'use strict';

angular.module('users').controller('ProfileController', ['$scope', '$location', 'Authentication', '$http', '$stateParams', 'Boards', '$window',
  function($scope, $location, Authentication, $http, $stateParams, Boards, $window) {
    $scope.authentication = Authentication;

    // If user is not signed in then redirect to signin page
    if (!$scope.authentication.user) $location.path('/signin');

    if ($scope.authentication.user) {
      if ($scope.authentication.user.gender === 'male')
        $scope.gender = 'M';
      else if ($scope.authentication.user.gender === 'female')
        $scope.gender = 'F';
    }

    //

    $scope.loadProfile = function() {
      $http.get('/users/' + $stateParams.username).success(function(response) {
        $scope.user = response;

        if ($scope.user.gender === 'male') {
          $scope.othergender = 'M';
        }
        else if ($scope.user.gender === 'female')
          $scope.othergender = 'F';
      });
    };



    $scope.searchPost = function() {
      console.log($scope.search.message);
    };
  }
]);