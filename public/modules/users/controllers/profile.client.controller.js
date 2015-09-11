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
				console.log(response);
				$scope.user = response;

				if ($scope.user.gender === 'male') {
					$scope.othergender = 'M';
				}
				else if ($scope.user.gender === 'female')
					$scope.othergender = 'F';
			});
		};

		//
		$scope.createBoard = function() {
			// Create new Board object
			var board = new Boards ({
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
	}
]);