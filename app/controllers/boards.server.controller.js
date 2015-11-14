'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Board = mongoose.model('Board'),
  User = mongoose.model('User'),
  Item = mongoose.model('Item'),
  _ = require('lodash'),
  sanitizeHTML = require('sanitize-html'),
  fs = require('fs');

exports.getOtherUserPostsCount = function (req, res) {
  User.findOne({username: req.params.username}, function (errUser, user) {
    if (errUser) return res.status(400).send({message: 'An error occured while getting your user info'});
    
    Board.count({user: user._id}, function (err, count) {
      if (err) return res.status(400).send({message: 'An error occured while getting your posts count'});

      var badge = 0;
      if (count >= 3 && count <= 4) {
        badge = 1;
      } else if (count >= 5 && count <= 9) {
        badge = 2;
      } else if (count >= 10) {
        badge = 3;
      }
      res.send({'postBadge': badge});
    }); // Closing of Board.count()

  }); // Closing of User.findOne()
};

exports.getUserPostsCount = function (req, res) {
  Board.count({user: req.user._id}, function (err, count) {
    if (err) return res.status(400).send({message: 'An error occured while getting your posts count'});

    var badge = 0;
    if (count >= 3 && count <= 4) {
      badge = 1;
    } else if (count >= 5 && count <= 9) {
      badge = 2;
    } else if (count >= 10) {
      badge = 3;
    }
    res.send({'postBadge': badge});
  });
};

exports.downloadFile = function(req, res) {
  // In C:\meanjs\secudev-case1\backups\<CSV files>
  // Make sure the 'backups' folder already exists
  var fileName = 'backups/' + req.params.fileName;
  res.download(fileName);
};

exports.backup = function(req, res) {
  var d = new Date();
  var fileName = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() + '-' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds();
  Board.findAndStreamCsv()
      .pipe(fs.createWriteStream('backups/backup-' + fileName + '.csv'));

  res.status(200).send('OK');
};

exports.getBackupList = function(req, res) {
  fs.readdir('backups', function (error, fileList) {
    if (error) {
      res.status(400).send({message: 'An error occurred while reading the backup directory'});
    } else {
      res.jsonp({files: fileList});
    }
  });  
};

function validateQuery(query) {
  var error = null;
  for (var i in query.advancedOptions) {
    if (query.advancedOptions[i].type === 'username') {
      if (!query.advancedOptions[i].text.match(/^[A-Za-z0-9 ]+$/))
        error = 'Please fix your username query';
    } else if (query.advancedOptions[i].type === '>= date') {
      if (!query.advancedOptions[i].text.match('[0-9][0-9]/[0-9][0-9]/[0-9][0-9][0-9][0-9]'))
        error = 'Please fix your >= date query';
    } else if (query.advancedOptions[i].type === '<= date') {
      if (!query.advancedOptions[i].text.match('[0-9][0-9]/[0-9][0-9]/[0-9][0-9][0-9][0-9]'))
        error = 'Please fix your <= date query';
    } else if (query.advancedOptions[i].type === 'between 2 dates') {
      if (!query.advancedOptions[i].text.match('[0-9][0-9]/[0-9][0-9]/[0-9][0-9][0-9][0-9] to [0-9][0-9]/[0-9][0-9]/[0-9][0-9][0-9][0-9]'))
        error = 'Please fix your between 2 dates query';
      else {
        var dateOne = query.advancedOptions[i].text.substring(0, 10);
        var dateTwo = query.advancedOptions[i].text.substring(14, 24);

        if (new Date(dateOne) > new Date(dateTwo))
          error = 'Your \'from\' date is larger than \'to\' date';
      }
    }
  }

  return error;
}

function getAndOrs(query) {
  var andOptions = [];
  var orOptions = [];
  for (var i in query.advancedOptions) {
    if (query.advancedOptions[i].operand === 'AND') {
      if (query.advancedOptions[i].type === 'username')
        andOptions.push({user: query.advancedOptions[i].text});
      else if (query.advancedOptions[i].type === '<= date')
        andOptions.push({created: { $lte: query.advancedOptions[i].text} } );      
      else if (query.advancedOptions[i].type === '>= date')
        andOptions.push({created: { $gte: query.advancedOptions[i].text} } );      
      else if (query.advancedOptions[i].type === 'between 2 dates') {        
        var dateOne = query.advancedOptions[i].text.substring(0, 10);
        var dateTwo = query.advancedOptions[i].text.substring(14, 24);
        andOptions.push({created: { $gte: dateOne, $lte: dateTwo } } );
      }
    } else if (query.advancedOptions[i].operand === 'OR') {
      if (query.advancedOptions[i].type === 'username')
        orOptions.push({user: query.advancedOptions[i].text});
      else if (query.advancedOptions[i].type === '<= date')
        orOptions.push({created: { $lte: query.advancedOptions[i].text} } );      
      else if (query.advancedOptions[i].type === '>= date')
        orOptions.push({created: { $gte: query.advancedOptions[i].text} } );      
      else if (query.advancedOptions[i].type === 'between 2 dates') {        
        var dateOneOr = query.advancedOptions[i].text.substring(0, 10);
        var dateTwoOr = query.advancedOptions[i].text.substring(14, 24);
        orOptions.push({created: { $gte: dateOneOr, $lte: dateTwoOr } } );
      }
    }
  }

  // To prevent the program from crashing
  if (andOptions.length === 0)
    andOptions.push({});
  if (orOptions.length === 0)
    orOptions.push({});

  return {ands: andOptions, ors: orOptions};
}

function compileQueries(mainQuery, queries) {
  var str = '';
  str += '{\"message\": \"/' + mainQuery + '/i\"';

  if (queries.length > 0) {
    str += ', ';
  }

  for (var i = 0; i < queries.length; i++) {
    if (queries[i].operand === 'AND') {
      str += '\"$and\" : [';
    } else if (queries[i].operand === 'OR') {
      str += '\"$or\" : [';
    }

    str += '{\"' + queries[i].type + '\" : \"' + queries[i].text + '\"}';
    if (i+1 < queries.length)
      str += ',';
  }

  for (var j = 0; j < queries.length; j++)
    str += ']';

  str += '}';

  str = JSON.parse(str);
  str.message = new RegExp(mainQuery, 'i');
  return str;
}

exports.search = function(req, res) {
  var query = req.body;

  var error = validateQuery(query);
  if (error) res.status(400).send({message:error});
  else {
    // var newQuery = compileQueries(query.mainQuery, query.advancedOptions);
    var usernames = [];

    for (var i in query.advancedOptions) {
      if (query.advancedOptions[i].type === 'username') {
        usernames.push(query.advancedOptions[i].text);
      }
    }

    User.find({username: { $in: usernames}}).exec(function(err, users) {
      if (err) {
        return res.status(400).send({message: 'Could not find user'});
      } else {
        var userIds = [];
        for (var index in users) {
          userIds.push(users[index]._id);
          for (var j = 0; j < query.advancedOptions.length; j++) {
            if (users[index].username === query.advancedOptions[j].text) {
              query.advancedOptions[j].text = users[index]._id + '';
            }
          }
        }

        // Once all IDs have been compiled, perform the actual search.

        var options = getAndOrs(query);
        var word = new RegExp(query.mainQuery, 'i');

        Board
          .find(
            // newQuery
            {
              message: word,
              $or: options.ors,
              $and: options.ands
            }
          )
          .populate('user', 'username firstName lastName created')
          .sort('-created')
          .exec(function(err, boards) {
            if (err) return res.status(400).send({message: 'Could not find posts'});
            else res.jsonp(boards);
          });
      }
    });
  }
};

exports.getCount = function(req, res) {
  Board.count(function(err, count) {
    if (err)
      return res.status(400).send({
          message:errorHandler.getErrorMessage(err)
        });
    else
      res.jsonp({'count': count});
  });
};

exports.limitedList = function(req, res) {
  var page;
  
  if (!req.params.pageNo)
    page = 1;
  else
    page = req.params.pageNo;
  
  var per_page = 10;

  Board.find({ $query: {}, $orderby: {updated: -1} }).skip((page - 1) * per_page).limit(per_page)
    .populate('user', 'firstName lastName created username')
    .exec(function (err, boards) {
      if (err) {
        return res.status(400).send({
          message:errorHandler.getErrorMessage(err)
        });
      } else {
        var itemIds = [];
        for (var i = 0; i < boards.length; i++)
          for (var j = 0; j < boards[i].attachedItems.length; j++)
            itemIds.push(boards[i].attachedItems[j]._id);

        Item.find( {_id: { $in: itemIds}}, function (err, items) {
          if (err) {
            return res.status(400).send({message:errorHandler.getErrorMessage(err)});
          } else {
            for (var i = 0; i < boards.length; i++) {
              for (var j = 0; j < boards[i].attachedItems.length; j++){
                for (var k = 0; k < items.length; k++) {
                  if (items[k]._id.toString() === boards[i].attachedItems[j]._id.toString()) {
                    boards[i].attachedItems[j] = items[k];
                  }
                }
              }
            }

            res.json(boards);
          }
        });
      }

    });
};

/**
 * Create a Board
 */
exports.create = function(req, res) {
  if (req.body.id !== req.user.id) {
    return res.status(400).send({
      message: 'Different user detected. Please refresh the page.'
    });
  }

  if (!req.body.message || req.body.message.length < 1) {
    return res.status(400).send({
      message: 'Your message is not valid.'
    });    
  }

  var cleanMessage = sanitizeHTML(req.body.message, {
    allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'img' ],
    allowedAttributes: {
      'a': [ 'href' ],
      'img': [ 'src' ]
    }
  });
  req.body.message = cleanMessage; // Sanitize the html tags inputted by the user.
  
  var board = new Board(req.body);
  board.user = req.user;

  board.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(board);
    }
  });
};

/**
 * Show the current Board
 */
exports.read = function(req, res) {
  res.jsonp(req.board);
};

/**
 * Update a Board
 */
exports.update = function(req, res) {
  var cleanMessage = sanitizeHTML(req.body.message, {
    allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'img' ],
    allowedAttributes: {
      'a': [ 'href' ],
      'img': [ 'src' ]
    }
  });
  req.body.message = cleanMessage; // Sanitize the html tags inputted by the user.
  // End of sanitation.

  var board = req.board;
  req.body.updated = Date.now();

  board = _.extend(board, req.body);

  board.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(board);
    }
  });
};

/**
 * Delete an Board
 */
exports.delete = function(req, res) {
  var board = req.board ;

  board.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(board);
    }
  });
};

/**
 * List of Boards
 */
exports.list = function(req, res) { 
  Board.find().sort('-created').lean().populate('user', 'firstName lastName username created').exec(function(err, boards) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(boards);
    }
  });
};

/**
 * Board middleware
 */
exports.boardByID = function(req, res, next, id) { 
  Board.findById(id).populate('user', 'firstName lastName').exec(function(err, board) {
    if (err) return next(err);
    if (! board) return next(new Error('Failed to load Board ' + id));
    req.board = board ;
    next();
  });
};

/**
 * Board authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  if (req.board.user.id !== req.user.id) {
    if (req.user.roles !== 'admin')
      return res.status(403).send('User is not authorized');      
  }
  next();
};
