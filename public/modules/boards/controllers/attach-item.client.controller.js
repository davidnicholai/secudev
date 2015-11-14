'use strict';

// Boards controller
angular.module('boards').controller('AttachItemController', ['$scope', '$stateParams', '$location', 'Boards', 'Authentication', '$http',
  function($scope, $stateParams, $location, Boards, Authentication, $http) {
    $scope.authentication = Authentication;

    if (!$scope.authentication.user)
      $location.path('/signin');

    $scope.initialize = function () {
      $scope.attachedItems = [];
    };

    $scope.getItems = function () {
      $http.get('/items').success(function (response) {
        $scope.items = response;

        $http.get('/items/' + $stateParams.itemId).success(function (response) {
          $scope.attachedItems.push(response);
          $scope.removeItem(response);
          console.log(response);
        }).error(function (response) {
          $scope.error = response;
        });
      }).error(function (response) {
        $scope.error = response;
      });
    };

    $scope.attachItem = function () {
      for(var j in $scope.items) {
        if ($scope.items[j]._id === $scope.selectedItem) {
          $scope.attachedItems.push($scope.items[j]);
          $scope.removeItem($scope.items[j]);
          $scope.selectedItem = $scope.items[0]._id;
        }
      }
    };

    $scope.removeItem = function (data) {
      for (var i in $scope.items) {
        if ($scope.items[i]._id === data._id) {
          $scope.items.splice(i, 1);
          if($scope.items.length >= 1)
            $scope.selectedItem = $scope.items[0]._id;
        }
      }
    };

    $scope.create = function () {
      $scope.success = $scope.error = null;
      $scope.cannotPost = true;
      
      // Create new Board object
      var board = new Boards ({
        id: $scope.authentication.user._id,
        message: this.message,
        attachedItems: $scope.attachedItems
      });

      // Redirect after save
      board.$save(function(response) {
        // Clear form fields
        $scope.message = '';
        $scope.attachedItems = [];

        $location.path('/boards');
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
        $scope.cannotPost = false;
      });
    };

  }
]);
