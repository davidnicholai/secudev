'use strict';

module.exports = function(app) {
  var users = require('../../app/controllers/users.server.controller');
  var boards = require('../../app/controllers/boards.server.controller');

  // Boards Routes
  app.route('/boards')
    .get(users.requiresLogin, boards.list)
    .post(users.requiresLogin, boards.create);

  app.route('/boards/user')
    .get(users.requiresLogin, boards.getUserPostsCount);

  app.route('/boards/user/:username')
    .get(users.requiresLogin, boards.getOtherUserPostsCount);

  app.route('/boards/count')
    .get(users.requiresLogin, boards.getCount);

  app.route('/boards/search')
    .post(users.requiresLogin, boards.search);

  app.route('/boards/backup')
    .get(users.requiresLogin, users.requiresAdmin, boards.getBackupList)
    .post(users.requiresLogin, users.requiresAdmin, boards.backup);

  app.route('/boards/backup/:fileName')
    .get(users.requiresLogin, users.requiresAdmin, boards.downloadFile);

  app.route('/boards/page/:pageNo')
    .get(users.requiresLogin, boards.limitedList);

  app.route('/boards/:boardId')
    .get(users.requiresLogin, boards.read)
    .put(users.requiresLogin, boards.hasAuthorization, boards.update)
    .delete(users.requiresLogin, boards.hasAuthorization, boards.delete);

  // Finish by binding the Board middleware
  app.param('boardId', boards.boardByID);
};
