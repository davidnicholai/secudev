'use strict';

// Boards controller
angular.module('boards').controller('BoardsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Boards',
	function($scope, $stateParams, $location, Authentication, Boards) {
		$scope.authentication = Authentication;

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
				$scope.error = errorResponse.data;
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