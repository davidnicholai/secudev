'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var TransactionSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  paymentId: {
    type: String,
    trim: true,
  },
  order: [{
    item: {
      type: Schema.ObjectId,
      ref: 'Item'
    },
    quantity: {
      type: Number,
      default: 1,
      trim: true
    }
  }],
  paid: {
    type: Boolean,
    default: false,
  },
  datePaid: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Transaction', TransactionSchema);