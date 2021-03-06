'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Item = mongoose.model('Item'),
  _ = require('lodash'),
  fs = require('fs');

exports.uploadImage = function (req, res) {
  var user = req.user;
  var message = null;

  if (user.roles === 'admin') {
    fs.writeFile('public/static/images/' + req.files.file.name, req.files.file.buffer, function (uploadError) {
      if (uploadError) {
        return res.status(400).send({
          message: 'Error occurred while uploading image'
        });
      } else {
        res.send({
          fileName: req.files.file.name
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Create a Item
 */
exports.create = function(req, res) {
  var item = new Item(req.body);

  if (item.price <= 0 || item.price % 1 !== 0) {
    return res.status(400).send({
      message: 'Please input a valid price. Keep in mind we only accept whole numbers.'
    });
  }

  item.price = Number(item.price).toFixed(2);

  item.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(item);
    }
  });
};

/**
 * Show the current Item
 */
exports.read = function(req, res) {
  res.jsonp(req.item);
  // console.log(req.item);
  // Item.findOne({_id: req.params.itemId}, function (errItem, item) {
  //   if (errItem) return res.status(400).send({ message: 'An error occured while attempting to retrieve this item' });
  //   else if (!item) return res.status(400).send({ message: 'Sorry, this item doesn\'t exist in our database' });
  //   else res.jsonp(item);
  // });
};

/**
 * Update a Item
 */
exports.update = function(req, res) {
  var item = req.item;

  item = _.extend(item, req.body);

  item.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(item);
    }
  });
};

/**
 * Delete an Item
 */
exports.delete = function(req, res) {
  var item = req.item ;

  item.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(item);
    }
  });
};

/**
 * List of Items
 */
exports.list = function(req, res) { 
  Item.find().sort('created').populate('user', 'displayName').exec(function(err, items) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(items);
    }
  });
};

/**
 * Item middleware
 */
exports.itemByID = function(req, res, next, id) { 
  Item.findById(id).exec(function(err, item) {
    if (err) return next(err);
    if (!item) return res.status(400).send( {message: 'Sorry, this item doesn\'t exist in our database'} );
    req.item = item;
    next();
  });
};

/**
 * Item authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  if (req.item.user.id !== req.user.id) {
    return res.status(403).send('User is not authorized');
  }
  next();
};
