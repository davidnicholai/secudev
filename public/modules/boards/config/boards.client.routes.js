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
		state('searchBoard', {
			url: '/boards/search',
			templateUrl: 'modules/boards/views/search-board.client.view.html'
		}).
		state('backupBoard', {
			url: '/boards/backup',
			templateUrl: 'modules/boards/views/backup-board.client.view.html'
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