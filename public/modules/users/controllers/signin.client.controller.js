'use strict';

angular.module('users').controller('SigninController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

    // $scope.cannotSignin = false;
		$scope.signin = function() {
      $scope.cannotSignin = true;

			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
        $scope.authentication.user = response;
        $scope.cannotSignin = false;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
        $scope.error = response.message;
        $scope.cannotSignin = false;
			});
		};

	}
]);