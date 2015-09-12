'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'secudev';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('boards');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Configuring the Articles module
angular.module('boards').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		// Menus.addMenuItem('topbar', 'Boards', 'boards', 'dropdown', '/boards(/create)?');
		// Menus.addSubMenuItem('topbar', 'boards', 'List Boards', 'boards');
		// Menus.addSubMenuItem('topbar', 'boards', 'New Board', 'boards/create');
	}
]);
'use strict';

//Setting up route
angular.module('boards').config(['$stateProvider',
	function($stateProvider) {
		// Boards state routing
		$stateProvider.
		state('listBoards', {
			url: '/boards',
			templateUrl: 'modules/boards/views/list-boards.client.view.html'
		}).
		state('createBoard', {
			url: '/boards/create',
			templateUrl: 'modules/boards/views/create-board.client.view.html'
		}).
		state('viewBoard', {
			url: '/boards/:boardId',
			templateUrl: 'modules/boards/views/view-board.client.view.html'
		}).
		state('editBoard', {
			url: '/boards/:boardId/edit',
			templateUrl: 'modules/boards/views/edit-board.client.view.html'
		});
	}
]);
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
'use strict';

//Boards service used to communicate Boards REST endpoints
angular.module('boards').factory('Boards', ['$resource',
	function($resource) {
		return $resource('boards/:boardId', { boardId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);
'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$location',
	function($scope, Authentication, $location) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		if ($scope.authentication) $location.path('/profile'); // If user is logged in, bring him to his profile
	}
]);
'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('view-profile', {
			url: '/profile',
			templateUrl: 'modules/users/views/view-profile.client.view.html'
		}).
		state('view-other-profile', {
			url: '/profile/:username',
			templateUrl: 'modules/users/views/view-other-profile.client.view.html'
		}).
		state('edit-profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
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
					$location.path('/profile');
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
'use strict';

angular.module('users').controller('SigninController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

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

	}
]);
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
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);