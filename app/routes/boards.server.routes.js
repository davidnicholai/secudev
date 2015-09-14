'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var boards = require('../../app/controllers/boards.server.controller');

	// Boards Routes
	app.route('/boards')
		.get(users.requiresLogin, boards.list)
		.post(users.requiresLogin, boards.create);

	app.route('/boards/count')
		.get(users.requiresLogin, boards.getCount);
	
	app.route('/boards/page/:pageNo')
		.get(users.requiresLogin, boards.limitedList);

	app.route('/boards/:boardId')
		.get(users.requiresLogin, boards.read)
		.put(users.requiresLogin, boards.hasAuthorization, boards.update)
		.delete(users.requiresLogin, boards.hasAuthorization, boards.delete);

	// Finish by binding the Board middleware
	app.param('boardId', boards.boardByID);
};
