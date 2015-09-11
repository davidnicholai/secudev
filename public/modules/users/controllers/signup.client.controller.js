'use strict';

angular.module('users').controller('SignupController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		$scope.isAdmin = false;

		if ($scope.authentication.user) {
			if ($scope.authentication.user.roles === 'admin') {
				$scope.isAdmin = true;
			}
		}

		$scope.signup = function() {			
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.hasGender = false;

		$scope.checkGender = function() {
			if ($scope.credentials.gender === 'male') {
				$scope.salutations = ['Mr', 'Sir', 'Senior', 'Count'];
				$scope.credentials.salutation = $scope.salutations[0];
				$scope.hasGender = true;
			} else if ($scope.credentials.gender === 'female') {
				$scope.salutations = ['Miss', 'Ms', 'Mrs', 'Madame', 'Seniora'];
				$scope.credentials.salutation = $scope.salutations[0];
				$scope.hasGender = true;
			}
		};


	}
]);