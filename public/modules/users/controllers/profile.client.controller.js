'use strict';

angular.module('users').controller('ProfileController', ['$scope', '$location', 'Authentication',
	function($scope, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is not signed in then redirect to signin page
		if (!$scope.authentication.user) $location.path('/signin');
	}
]);