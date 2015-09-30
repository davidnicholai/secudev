'use strict';

// Boards controller
angular.module('boards').controller('BoardsAdminController', ['$scope', '$location', 'Authentication', 'Boards', '$http', '$window',
  function($scope, $location, Authentication, Boards, $http, $window) {
    $scope.authentication = Authentication;

    // if ($scope.authentication.user.roles !== 'admin') $location.path('/');

    $scope.getBackups = function() {
      $http.get('/boards/backup').success(function(response) {
        $scope.files = response;
      });
    };

    $scope.backupPosts = function() {
      $http.post('/boards/backup').success(function(response) {
        $window.location.reload();
      }).error(function(response) {
        console.log(response.message);
      });
    };

    $scope.download = function(fileName) {
      $http.get('/boards/backup/' + fileName).success(function(response) {
        console.log(response);
        var element = angular.element('<a/>');
        element.attr({
          href: 'data:application/csv,' + encodeURIComponent(response),
          target: '_blank',
          download: fileName
        })[0].click();
      });
    };
    
  }
]);