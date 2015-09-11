'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Board = mongoose.model('Board'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, board;

/**
 * Board routes tests
 */
describe('Board CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Board
		user.save(function() {
			board = {
				name: 'Board Name'
			};

			done();
		});
	});

	it('should be able to save Board instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Board
				agent.post('/boards')
					.send(board)
					.expect(200)
					.end(function(boardSaveErr, boardSaveRes) {
						// Handle Board save error
						if (boardSaveErr) done(boardSaveErr);

						// Get a list of Boards
						agent.get('/boards')
							.end(function(boardsGetErr, boardsGetRes) {
								// Handle Board save error
								if (boardsGetErr) done(boardsGetErr);

								// Get Boards list
								var boards = boardsGetRes.body;

								// Set assertions
								(boards[0].user._id).should.equal(userId);
								(boards[0].name).should.match('Board Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Board instance if not logged in', function(done) {
		agent.post('/boards')
			.send(board)
			.expect(401)
			.end(function(boardSaveErr, boardSaveRes) {
				// Call the assertion callback
				done(boardSaveErr);
			});
	});

	it('should not be able to save Board instance if no name is provided', function(done) {
		// Invalidate name field
		board.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Board
				agent.post('/boards')
					.send(board)
					.expect(400)
					.end(function(boardSaveErr, boardSaveRes) {
						// Set message assertion
						(boardSaveRes.body.message).should.match('Please fill Board name');
						
						// Handle Board save error
						done(boardSaveErr);
					});
			});
	});

	it('should be able to update Board instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Board
				agent.post('/boards')
					.send(board)
					.expect(200)
					.end(function(boardSaveErr, boardSaveRes) {
						// Handle Board save error
						if (boardSaveErr) done(boardSaveErr);

						// Update Board name
						board.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Board
						agent.put('/boards/' + boardSaveRes.body._id)
							.send(board)
							.expect(200)
							.end(function(boardUpdateErr, boardUpdateRes) {
								// Handle Board update error
								if (boardUpdateErr) done(boardUpdateErr);

								// Set assertions
								(boardUpdateRes.body._id).should.equal(boardSaveRes.body._id);
								(boardUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Boards if not signed in', function(done) {
		// Create new Board model instance
		var boardObj = new Board(board);

		// Save the Board
		boardObj.save(function() {
			// Request Boards
			request(app).get('/boards')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Board if not signed in', function(done) {
		// Create new Board model instance
		var boardObj = new Board(board);

		// Save the Board
		boardObj.save(function() {
			request(app).get('/boards/' + boardObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', board.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Board instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Board
				agent.post('/boards')
					.send(board)
					.expect(200)
					.end(function(boardSaveErr, boardSaveRes) {
						// Handle Board save error
						if (boardSaveErr) done(boardSaveErr);

						// Delete existing Board
						agent.delete('/boards/' + boardSaveRes.body._id)
							.send(board)
							.expect(200)
							.end(function(boardDeleteErr, boardDeleteRes) {
								// Handle Board error error
								if (boardDeleteErr) done(boardDeleteErr);

								// Set assertions
								(boardDeleteRes.body._id).should.equal(boardSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Board instance if not signed in', function(done) {
		// Set Board user 
		board.user = user;

		// Create new Board model instance
		var boardObj = new Board(board);

		// Save the Board
		boardObj.save(function() {
			// Try deleting Board
			request(app).delete('/boards/' + boardObj._id)
			.expect(401)
			.end(function(boardDeleteErr, boardDeleteRes) {
				// Set message assertion
				(boardDeleteRes.body.message).should.match('User is not logged in');

				// Handle Board error error
				done(boardDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Board.remove().exec();
		done();
	});
});