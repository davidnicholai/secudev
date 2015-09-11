'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Board = mongoose.model('Board'),
	_ = require('lodash');

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
			if (err)
				return res.status(400).send({
					message:errorHandler.getErrorMessage(err)
				});
			else
				res.json(boards);			
		});
};

/**
 * Create a Board
 */
exports.create = function(req, res) {
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
	var board = req.board ;

	board = _.extend(board , req.body);

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
	Board.find().sort('-created').populate('user', 'firstName lastName username created').exec(function(err, boards) {
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