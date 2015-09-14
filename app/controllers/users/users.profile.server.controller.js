'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User');

exports.getUser = function(req, res) {
	User.findOne(
		// Query
		{username: req.params.username},
		// Projection
		{_id : false},
		// Callback
		function(err, user) {
			if (err) return new Error(err);
			if (!user) return new Error('Failed to load User');
			res.json(user);
		});
};

/**
 * Update user details
 */
exports.update = function(req, res) {
	var user = req.user;
	var message = null;
	var logout = false;

	if (user.roles === 'user' && req.body.roles === 'admin') {
		delete req.body.roles;
		return res.status(403).send({
			message: 'Huy bawal \'yan!  Hanggang user ka lang.'
		});
	}

	if (user.roles === 'admin' && req.body.roles === 'user')
		logout = true;

	if (user) {
		user = _.extend(user, req.body);
		user.updated = Date.now(); // Update the 'updated' field with the current date

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				user.password = undefined;
				user.salt = undefined;

				if (logout) {
					req.logout();
					return res.status(200).send({
						message: 'Refresh'
					});
				} else {
					req.login(user, function(err) {
						if (err) {
							res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							res.json(user);
						}
					});
				}
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

/**
 * Send User
 */
exports.me = function(req, res) {
	res.json(req.user || null);
};