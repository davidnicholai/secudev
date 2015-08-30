'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		// if ($scope.authentication.user) $location.path('/');

		// console.log($scope.authentication.user.roles[0]);
		$scope.isAdmin = false;

		if ($scope.authentication.user) {
			if ($scope.authentication.user.roles[0] === 'admin') {
				$scope.isAdmin = true;
			}
		}

		$scope.signup = function() {
			$scope.credentials.salutation = $scope.credentials.salutation.title;
			
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.hasGender = true;

		$scope.checkGender = function() {
			if ($scope.credentials.gender === 'male') {
				$scope.salutations = [
					{title: 'Mr'},
					{title: 'Sir'},
					{title: 'Senior'},
					{title: 'Count'}
				];

				$scope.credentials.salutation = $scope.salutations[0];
				$scope.hasGender = false;
			} else if ($scope.credentials.gender === 'female') {
				$scope.salutations = [
					{title: 'Miss'},
					{title: 'Ms'},
					{title: 'Mrs'},
					{title: 'Madame'},
					{title: 'Seniora'}
				];
				$scope.credentials.salutation = $scope.salutations[0];
				$scope.hasGender = false;
			}
		};


	}
]);