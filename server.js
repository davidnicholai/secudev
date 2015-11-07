'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose'),
	chalk = require('chalk');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
var db = mongoose.connect(config.db, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});

// Prepare folders
if (!fs.existsSync('backups')) {
  fs.mkdirSync('backups', function(err) {
    if (err) {
      console.error(chalk.red('Error occured while creating backups folder. ' + err));
    }
  });
}

if (!fs.existsSync('public/static')) {
  fs.mkdirSync('public/static', function(err) {
    if (err) {
      console.error(chalk.red('Error occured while creating public/static folder. ' + err));
    } else {
      if (!fs.existsSync('public/static/images')) {
        fs.mkdirSync('public/static/images', function(err) {
          if (err) {
            console.error(chalk.red('Error occured while creating public/static/images folder. ' + err));
          }
        });
      }      
    }
  });
}

if (!fs.existsSync('public/static/images')) {
  fs.mkdirSync('public/static/images', function(err) {
    if (err) {
      console.error(chalk.red('Error occured while creating public/static/images folder. ' + err));
    }
  });
}

// Init the express application
var app = require('./config/express')(db);

// Bootstrap passport config
require('./config/passport')();

// Start the app by listening on <port>
app.listen(config.port);

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('MEAN.JS application started on port ' + config.port);