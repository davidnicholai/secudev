'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$location',
	function($scope, Authentication, $location) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		if ($scope.authentication) $location.path('/profile'); // If user is logged in, bring him to his profile
	}
]);