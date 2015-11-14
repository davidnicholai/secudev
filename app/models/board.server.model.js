'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  mongooseToCsv = require('mongoose-to-csv'),
  Schema = mongoose.Schema;

/**
 * Board Schema
 */
var BoardSchema = new Schema({
  message: {
    type: String,
    default: '',
    required: 'Please fill Board message',
    trim: true
  },
  attachedItems: [
    {
      item: {
        type: Schema.ObjectId,
        ref: 'Item'
      }
    }
  ],
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

BoardSchema.plugin(mongooseToCsv, {
  headers: 'User Created Message',
  constraints: {
    'User': 'user',
    'Created': 'created',
    'Message': 'message'
  }
});

mongoose.model('Board', BoardSchema);