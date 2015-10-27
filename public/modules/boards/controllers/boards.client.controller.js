'use strict';

// Boards controller
angular.module('boards').controller('BoardsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Boards', '$http', '$window',
  function($scope, $stateParams, $location, Authentication, Boards, $http, $window) {
    $scope.authentication = Authentication;

    $scope.options = [];
    $scope.advancedOptions = ['username', '>= date', '<= date', 'between 2 dates'];
    $scope.operands = ['OR', 'AND'];
    $scope.addOption = function() {
      var lastIndex = $scope.options.length;
      $scope.options[lastIndex] = {};
      $scope.options[lastIndex].index = lastIndex; // Need this to identify which one will be removed
      $scope.options[lastIndex].type = $scope.advancedOptions[0];
      $scope.options[lastIndex].operand = $scope.operands[0];
      $scope.options[lastIndex].text = '';
    };

    $scope.removeOption = function(option) {
      $scope.options.splice(option.index, 1);

      for (var i = 0; i < $scope.options.length; i++) { // Update the indices of options
        $scope.options[i].index = i;
      }
    };

    $scope.startSearch = function() {
      var query = {
        mainQuery: $scope.mainQuery,
        advancedOptions: $scope.options
      };
      $http.post('/boards/search', query).success(function(response) {
        $scope.error = null;
        $scope.boards = response;
        if ($scope.boards.length === 0)
          $scope.error = 'No hits';
      }).error(function(response) {
        $scope.error = response.message;
      });
    };


    $scope.createBoard = function() {
      // Create new Board object
      var board = new Boards ({
        id: $scope.authentication.user._id,
        message: this.message
      });

      // Redirect after save
      board.$save(function(response) {        
        $window.location.reload();
        // Clear form fields
        $scope.message = '';
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });

    };

    // Remove existing Board
    $scope.removeBoard = function(boardId) {
      $http.delete('/boards/' + boardId).success(function(response) {
        $window.location.reload();
      }).error(function(err) {
        alert(err);
      });
    };

    //

    $scope.currentPage = 1;
    $scope.maxSize = 5;

    $http.get('/boards/count').success(function(response) {
        $scope.totalItems = response.count;
    });

    $scope.setPage = function(pageNo) {
      $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function() {
      $scope.loadMessages();
    };

    $scope.loadMessages = function() {
      $http.get('/boards/page/' + $scope.currentPage).success(function(response) {
        $scope.boards = response;
      });
    };

    //

    // Create new Board
    $scope.create = function() {
      // Create new Board object
      var board = new Boards ({
        message: this.message
      });

      // Redirect after save
      board.$save(function(response) {
        $location.path('boards/' + response._id);

        // Clear form fields
        $scope.message = '';
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Board
    $scope.remove = function(board) {
      if ( board ) { 
        board.$remove();

        for (var i in $scope.boards) {
          if ($scope.boards [i] === board) {
            $scope.boards.splice(i, 1);
          }
        }
      } else {
        $scope.board.$remove(function() {
          $location.path('boards');
        });
      }
    };

    // Update existing Board
    $scope.update = function() {
      var board = $scope.board;

      board.$update(function() {
        $location.path('boards/' + board._id);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Boards
    $scope.find = function() {
      $scope.boards = Boards.query();
    };

    // Find existing Board
    $scope.findOne = function() {
      $scope.board = Boards.get({ 
        boardId: $stateParams.boardId
      });
    };
  }
]);