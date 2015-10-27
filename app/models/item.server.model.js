'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Item Schema
 */
var ItemSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill item name',
    trim: true
  },
  description: {
    type: String,
    default: '',
    required: 'Please fill item description',
    trim: true
  },
  price: {
    type: Number,
    default: 0.00,
    trim: true
  },
  image: {
    type: String,
    default: '',
    required: 'No image specified',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Item', ItemSchema);