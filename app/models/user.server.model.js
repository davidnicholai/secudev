'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

var validateMaxLength = function(property) {
	if (this.provider !== 'local')
		return false;
	if (property.length >= 51)
		return false;
	if (property.length <= 0)
		return false;
	
	return true;
};

var validateGender = function(gender) {
	if (gender === 'male' || gender === 'female') {
		return true;
	}

	return false;
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
	return (this.provider !== 'local' || (password && password.length > 6 && password.length < 51));
};

var validateBirthday = function(birthday) {
	var age = (new Date().getYear()) - birthday.getYear();
	return (this.provider !== 'local' || age > 18);
};

var validateUsername = function(username) {
	if (this.provider !== 'local')
		return false;
	else if (username.length <= 0)
		return false;
	else if (username.length >= 51)
		return false;
	else if (!username.match(/^[A-Za-z0-9_]+$/))
		return false;

	return true;

};

/**
 * User Schema
 */
var UserSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		default: '',
		validate: [validateMaxLength, 'Please fill in your first name and it should not be longer than 50 characters.']
	},
	lastName: {
		type: String,
		trim: true,
		default: '',
		validate: [validateMaxLength, 'Please fill in your last name and it should not be longer than 50 characters.']
	},
	gender: {
		type: [{
			type: String,
			enum: ['male', 'female']
		}],
		validate: [validateGender, 'Please input your gender.']
	},
	salutation: {
		type: String,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please input your salutation.']
	},
	birthday: {
		type: Date,
		trim: true,
		validate: [validateBirthday, 'Only ages 18 and older are allowed to register.']
	},
	// email: {
	// 	type: String,
	// 	trim: true,
	// 	default: '',
	// 	validate: [validateLocalStrategyProperty, 'Please fill in your email'],
	// 	match: [/.+\@.+\..+/, 'Please fill a valid email address']
	// },
	username: {
		type: String,
		unique: 'testing error message',
		required: 'Please fill in a username',
		trim: true,
		validate: [validateUsername, 'Your username is either existing or longer than 50 characters. Should also be alphanumeric.']
	},
	password: {
		type: String,
		default: '',
		validate: [validateLocalStrategyPassword, 'Password should be more than 6 characters and not longer than 50 characters.']
	},
	description: {
		type: String,
		default: ''
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		required: 'Provider is required'
	},
	providerData: {},
	additionalProvidersData: {},
	roles: {
		type: [{
			type: String,
			enum: ['user', 'admin']
		}],
		default: ['user']
	},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},
	/* For reset password */
	resetPasswordToken: {
		type: String
	},
	resetPasswordExpires: {
		type: Date
	}
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
	if (this.password && this.password.length > 6) {
		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);
	}

	next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
	} else {
		return password;
	}
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
	var _this = this;
	var possibleUsername = username + (suffix || '');

	_this.findOne({
		username: possibleUsername
	}, function(err, user) {
		if (!err) {
			if (!user) {
				callback(possibleUsername);
			} else {
				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

mongoose.model('User', UserSchema);