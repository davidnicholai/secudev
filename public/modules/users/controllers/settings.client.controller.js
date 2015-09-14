'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');
		
		$scope.isAdmin = false;
		if (Authentication.user)
			if (Authentication.user.roles === 'admin')
				$scope.isAdmin = true;

		$scope.credentials = {
			firstName: $scope.user.firstName,
			lastName: $scope.user.lastName,
			roles: $scope.user.roles,
			birthday: $scope.user.birthday.split('T')[0],
			gender: $scope.user.gender,
			salutation: $scope.user.salutation,
			description: $scope.user.description
		};

		$scope.hasGender = false;

		$scope.initializeSalutation = function() {
			if ($scope.credentials.gender === 'male') {
				$scope.salutations = ['Mr', 'Sir', 'Senior', 'Count'];
				$scope.credentials.salutation = $scope.salutations[$scope.salutations.indexOf($scope.credentials.salutation)];
				$scope.hasGender = true;
			} else if ($scope.credentials.gender === 'female') {
				$scope.salutations = ['Miss', 'Ms', 'Mrs', 'Madame', 'Seniora'];
				$scope.credentials.salutation = $scope.salutations[$scope.salutations.indexOf($scope.credentials.salutation)];
				$scope.hasGender = true;
			}
			
		};

		$scope.checkGender = function() {
			if ($scope.credentials.gender === 'male') {
				$scope.salutations = ['Mr', 'Sir', 'Senior', 'Count'];
				$scope.credentials.salutation = $scope.salutations[0];
				$scope.hasGender = true;
			} else if ($scope.credentials.gender === 'female') {
				$scope.salutations = ['Miss', 'Ms', 'Mrs', 'Madame', 'Seniora'	];
				$scope.credentials.salutation = $scope.salutations[0];
				$scope.hasGender = true;
			}
		};

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;	
				var user = new Users($scope.credentials);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
					if (response.message === 'Refresh')
						$location.path('/signin');
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);