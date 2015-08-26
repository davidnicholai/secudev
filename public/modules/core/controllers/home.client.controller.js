'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		$scope.isAdmin = false;
		$scope.isUser = false;
		if ($scope.authentication.user) 
			if ($scope.authentication.user.roles[0] === 'admin') {
				$scope.isAdmin = true;
				$scope.isUser = true;
			} else
				$scope.isUser = true;
	}
]);