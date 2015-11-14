'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Cart = mongoose.model('Cart'),
    User = mongoose.model('User'),
    Item = mongoose.model('Item'),
    Transaction = mongoose.model('Transaction'),
    _ = require('lodash'),
    paypal = require('paypal-rest-sdk'),
    ipn = require('paypal-ipn');

exports.processQuickDonate = function (req, res) {
  res.sendStatus(200);
  
  // console.log('LOG:' + JSON.parse(req.body));
  ipn.verify(req.body, {'allow_sandbox': true}, function (err, msg) {
    if (err) console.log('IPN ERROR: ' + err);
    else {
      if (req.body.payment_status === 'Completed') {
        console.log('Hurray! He completed his payment_status.');

        User.findOne( {_id: req.body.transaction_subject}, function (errUser, user) {
          if (errUser) console.log('USER ERROR: ' + errUser);
          else {
            var transaction = new Transaction();
            transaction.isQuickDonation = true;
            transaction.status = 'paid';
            transaction.user = user._id;
            transaction.totalPrice = req.body.payment_gross;
            transaction.save(function (errTransaction) {
              if (errTransaction) console.log('TRANSACTION ERROR: ' + errTransaction);
              else console.log('Successfully saved donation!');
            });
          }
        }); // Closing of User.findOne()
      } // Closing if (req.body.payment_status === 'Completed')
    } // Closing of else
  }); // CLosing of ipn.verify()
};

exports.getOtherUserTransactions = function (req, res) {
  User.findOne({username: req.params.username}, function (errUser, user) {
    if (errUser) return res.status(400).send({message: 'An error occured while getting your user info'});

    Transaction.find( {user: user._id, status: 'paid'}, { _id: 0, datePaid: 0, user: 0, paymentId: 0, created: 0, status: 0, __v: 0 }, function (err, transactions) {
      if (err) return res.status(400).send({ message: 'An error occured while retrieving your transactions' });
      
      var donationTotal = 0;
      var itemIds = [];
      for (var i = 0; i < transactions.length; i++) { // Collect id of user of each transaction
        if (transactions[i].isQuickDonation === true) {
          donationTotal += transactions[i].totalPrice;
        }
        for (var j = 0; j < transactions[i].order.length; j++) {
          itemIds.push(transactions[i].order[j].item);
        }
      }

      Item.find( { _id: { $in: itemIds } }, function (errItems, items) {
        if (errItems) return res.status(400).send({ message: 'An error occured while retrieving items ordered' });

        var totalPrice = 0;
        for (var itemIdx = 0; itemIdx < items.length; itemIdx++) {
          for (var transIdx = 0; transIdx < transactions.length; transIdx++) {
            for (var orderIdx = 0; orderIdx < transactions[transIdx].order.length; orderIdx++) {
              if ( (items[itemIdx]._id.toString() === transactions[transIdx].order[orderIdx].item.toString()) &&
                  items[itemIdx].name.indexOf('Donation') < 1) {
                // transactions[transIdx].order[orderIdx].itemPrice = items[itemIdx].price;
                // transactions[transIdx].order[orderIdx].itemName = items[itemIdx].name;
                totalPrice += items[itemIdx].price * transactions[transIdx].order[orderIdx].quantity;
              } else if  ( (items[itemIdx]._id.toString() === transactions[transIdx].order[orderIdx].item.toString()) &&
                  items[itemIdx].name.indexOf('Donation') > 0) {
                donationTotal += items[itemIdx].price * transactions[transIdx].order[orderIdx].quantity;
              }
            }
          }
        } // Closing of intense for loop

        var shopBadge = 0,
          donationBadge = 0;
        if (totalPrice >= 5 && totalPrice <= 19) {
          shopBadge = 1;
        } else if (totalPrice >= 20 && totalPrice <= 99) {
          shopBadge = 2;
        } else if (totalPrice >= 100) {
          shopBadge = 3;
        }

        if (donationTotal >= 5 && donationTotal <= 19) {
         donationBadge = 1;
        } else if (donationTotal >= 20 && donationTotal <= 99) {
         donationBadge = 2;
        } else if (donationTotal >= 100) {
         donationBadge = 3;
        }

        res.send({'shopBadge': shopBadge, 'donationBadge': donationBadge});
      });
    });

    // res.jsonp(transactions);
  });
};

exports.getUserTransactions = function (req, res) {
  Transaction.find( {user: req.user._id, status: 'paid'}, { _id: 0, datePaid: 0, user: 0, paymentId: 0, created: 0, status: 0, __v: 0 }, function (err, transactions) {
    if (err) return res.status(400).send({ message: 'An error occured while retrieving your transactions' });
    var donationTotal = 0;
    
    var itemIds = [];
    for (var i = 0; i < transactions.length; i++) { // Collect id of user of each transaction
      if (transactions[i].isQuickDonation === true) {
        donationTotal += transactions[i].totalPrice;
      }

      for (var j = 0; j < transactions[i].order.length; j++) {
        itemIds.push(transactions[i].order[j].item);
      }
    }

    Item.find( { _id: { $in: itemIds } }, function (errItems, items) {
      if (errItems) return res.status(400).send({ message: 'An error occured while retrieving items ordered' });

      var totalPrice = 0;
      for (var itemIdx = 0; itemIdx < items.length; itemIdx++) {
        for (var transIdx = 0; transIdx < transactions.length; transIdx++) {
          for (var orderIdx = 0; orderIdx < transactions[transIdx].order.length; orderIdx++) {
            if ( (items[itemIdx]._id.toString() === transactions[transIdx].order[orderIdx].item.toString()) &&
                items[itemIdx].name.indexOf('Donation') < 1) {
              // transactions[transIdx].order[orderIdx].itemPrice = items[itemIdx].price;
              // transactions[transIdx].order[orderIdx].itemName = items[itemIdx].name;
              totalPrice += items[itemIdx].price * transactions[transIdx].order[orderIdx].quantity;
            } else if  ( (items[itemIdx]._id.toString() === transactions[transIdx].order[orderIdx].item.toString()) &&
                items[itemIdx].name.indexOf('Donation') > 0) {
              donationTotal += items[itemIdx].price * transactions[transIdx].order[orderIdx].quantity;
            }
          }
          
          
        }
      } // Closing of intense for loop

      var shopBadge = 0,
        donationBadge = 0;
      if (totalPrice >= 5 && totalPrice <= 19) {
        shopBadge = 1;
      } else if (totalPrice >= 20 && totalPrice <= 99) {
        shopBadge = 2;
      } else if (totalPrice >= 100) {
        shopBadge = 3;
      }

      if (donationTotal >= 5 && donationTotal <= 19) {
       donationBadge = 1;
      } else if (donationTotal >= 20 && donationTotal <= 99) {
       donationBadge = 2;
      } else if (donationTotal >= 100) {
       donationBadge = 3;
      }

      res.send({'shopBadge': shopBadge, 'donationBadge': donationBadge});
    });

    // res.jsonp(transactions);
  });
};

exports.getTransactionsDateRange = function (req, res) {
  var newDateTo = req.body.dateTo,
    newDateFrom = req.body.dateFrom;

  Transaction.find( { created: {$gte: newDateTo, $lte: newDateFrom} } ).sort('-created').lean().exec(function (err, transactions) {
    if (err || !transactions) return res.status(400).send({ message: 'An error occured while retrieving your transaction' });

    var userIds = [];
    var itemIds = [];
    for (var i = 0; i < transactions.length; i++) { // Collect id of user of each transaction
      userIds.push(transactions[i].user);
      for (var j = 0; j < transactions[i].order.length; j++) {
        itemIds.push(transactions[i].order[j].item);
      }
    }

    User.find( { _id: { $in: userIds } } ).exec(function (err, users) {
      if (err || !users) return res.status(400).send({ message: 'An error occured while retrieving the users' });

      for (var userIdx = 0; userIdx < users.length; userIdx++) {
        for (var transIdx = 0; transIdx < transactions.length; transIdx++) {
          if (users[userIdx]._id.toString() === transactions[transIdx].user.toString()) {
            transactions[transIdx].username = users[userIdx].username;
            transactions[transIdx].displayName = users[userIdx].firstName + ' ' + users[userIdx].lastName;
          }
        }
      }

      Item.find( { _id: {$in: itemIds} } ).exec(function (err, items) {
        for (var itemIdx = 0; itemIdx < items.length; itemIdx++) {
          for (var transIdx = 0; transIdx < transactions.length; transIdx++) {
            for (var orderIdx = 0; orderIdx < transactions[transIdx].order.length; orderIdx++) {
              if (items[itemIdx]._id.toString() === transactions[transIdx].order[orderIdx].item.toString()) {
                transactions[transIdx].order[orderIdx].itemPrice = items[itemIdx].price;
                transactions[transIdx].order[orderIdx].itemName = items[itemIdx].name;
              }
            }
          }
        } // Closing of intense for loop

        res.send(transactions);
      });
    
    });

  });
};

exports.getTransactions = function (req, res) {
  Transaction.find().sort('-created').lean().exec(function (err, transactions) {
    if (err || !transactions) return res.status(400).send({ message: 'An error occured while retrieving your transaction' });

    var userIds = [];
    var itemIds = [];
    for (var i = 0; i < transactions.length; i++) { // Collect id of user of each transaction
      userIds.push(transactions[i].user);
      for (var j = 0; j < transactions[i].order.length; j++) {
        itemIds.push(transactions[i].order[j].item);
      }
    }

    User.find( { _id: { $in: userIds } } ).exec(function (err, users) {
      if (err || !users) return res.status(400).send({ message: 'An error occured while retrieving the users' });

      for (var userIdx = 0; userIdx < users.length; userIdx++) {
        for (var transIdx = 0; transIdx < transactions.length; transIdx++) {
          if (users[userIdx]._id.toString() === transactions[transIdx].user.toString()) {
            transactions[transIdx].username = users[userIdx].username;
            transactions[transIdx].displayName = users[userIdx].firstName + ' ' + users[userIdx].lastName;
          }
        }
      }

      Item.find( { _id: {$in: itemIds} } ).exec(function (err, items) {
        for (var itemIdx = 0; itemIdx < items.length; itemIdx++) {
          for (var transIdx = 0; transIdx < transactions.length; transIdx++) {
            for (var orderIdx = 0; orderIdx < transactions[transIdx].order.length; orderIdx++) {
              if (items[itemIdx]._id.toString() === transactions[transIdx].order[orderIdx].item.toString()) {
                transactions[transIdx].order[orderIdx].itemPrice = items[itemIdx].price;
                transactions[transIdx].order[orderIdx].itemName = items[itemIdx].name;
              }
            }
          }
        } // Closing of intense for loop

        res.send(transactions);
      });
    
    });

  });
};

exports.cancelTransaction = function (req, res) {
  Transaction.findOne( { user: req.user._id }, function (err, transaction) {
    if (err || !transaction) return res.status(400).send({ message: 'An error occured while retrieving your transaction' });

    transaction.status = 'cancelled';
    transaction.save(function (err) {
      if (err) return res.status(400).send({ message: 'An error occured while saving your cancelled transaction' });
      res.send({ message: 'Successfully cancelled transaction. Hope to see you soon!' });
    });
  });
};

exports.executeTransaction = function (req, res) {
  Transaction.findOne( { paymentId : req.body.paymentId }, function (err, transaction) {
    if (err || !transaction) return res.status(400).send({ message: 'An error occured while retrieving your transaction' });

    var payer = {
      payer_id: req.body.PayerID
    };

    paypal.payment.execute(transaction.paymentId, payer, {}, function (err, response) {
      if (err) return res.status(400).send({ message: 'An error occured while executing your transaction' });

      transaction.status = 'paid';
      transaction.save(function (err) {
        if (err) return res.status(400).send({ message: 'An error occured while saving your transaction' });

        Cart.findOne( {user: req.user._id }, function (err, cart) {
          if (err || !cart) return res.status(400).send({ message: 'An error occured while retrieving your cart' });
          cart.content = [];
          cart.save(function (err) {
            if (err) return res.status(400).send({ message: 'An error occured while saving your cart' });
            res.send({ message: 'Successfully performed payment' });
          }); // Closing of cart.save()
        }); // Closing of Cart.findOne()        
      }); // Closing of transaction.save()
    }); // Closing of paypal.payment.execute()

  });
};

exports.getTransaction = function (req, res) {
  Transaction.findOne( { paymentId : req.params.paymentId }, function (err, transaction) {
    if (err || !transaction) return res.status(400).send({ message: 'An error occured while retrieving your transaction' });

    res.json(transaction);
  });
};

exports.checkout = function (req, res) {
  var totalPrice = 0;

  Cart.findOne({ user: req.user._id }).lean().exec(function (err, cart) {
    if (err) {
      return res.status(400).send({
        message: 'Failed to load Cart'
      });
    } else if (!cart) {
      return res.status(400).send({
        message: 'Cart does not exist'
      });
    } else if (cart) {
      var itemIds = [];
      for (var i = 0; i < cart.content.length; i++) {
        itemIds.push(cart.content[i].item);
      }

      Item.find( { _id: { $in: itemIds } } ).lean().exec(function (err, items) {
        if (err) {
          return res.status(400).send({
            message: 'Item not found'
          });
        }

        for (var j = 0; j < cart.content.length; j++)
          for (var k = 0; k < items.length; k++)
            if (cart.content[j].item.toString() === items[k]._id.toString())
              cart.content[j].itemInfo = items[k];

        for (var idx = 0; idx < cart.content.length; idx++)
          totalPrice += cart.content[idx].itemInfo.price * cart.content[idx].quantity;

        paypal.configure({
          'host': 'api.sandbox.paypal.com',
          'port': '',
          'client_id': 'ATyYbJ3d4N-YauTExji9RlkJuF3-rzhAcDHAv0VraepSxpuWq0TBkZa6dxjgGC1hcRwQK5BorV14fItx',
          'client_secret': 'EKOUGLXGTHd6t5Xjk8S2l9ei5ultHi4jRPfNbLkeuuw4eY9nOqVnSRahnT3V9XHee43CB74V7O-aOeNt'
        });

        var paypalPayment = {
          'intent': 'sale',
          'payer': { 'payment_method': 'paypal' },
          'redirect_urls': {},
          'transactions': [{
            'amount': {
              'currency': 'USD'
            }
          }]
        };

        paypalPayment.transactions[0].amount.total = totalPrice;
        // paypalPayment.redirect_urls.return_url = 'https://104.236.16.2/#!/shop/cart/confirm';
        // paypalPayment.redirect_urls.cancel_url = 'https://104.236.16.2/#!/shop/cart';
        paypalPayment.redirect_urls.return_url = 'http://localhost:3000/#!/shop/cart/confirm';
        paypalPayment.redirect_urls.cancel_url = 'http://localhost:3000/#!/shop/cart/cancel';
        paypalPayment.transactions[0].description = 'Total Price: $' + totalPrice;
        
        paypal.payment.create(paypalPayment, {}, function (err, response) {
          if (err) { // Render order-failure.server.view.html
            res.render('order-failure', { message: [{desc: 'Payment API call failed. Please navigate back to the page.', type: 'error'}]});
          }

          if (response) {
            var link = response.links;
            console.log('LINKS:' + JSON.stringify(link));

            var transaction = new Transaction();
            transaction.paymentId = response.id;
            transaction.totalPrice = totalPrice;
            transaction.user = cart.user;
            transaction.status = 'not paid';
            transaction.datePaid = new Date();

            for (var i = 0; i < cart.content.length; i++) {
              transaction.order.push({item: cart.content[i].item, quantity: cart.content[i].quantity});
            }

            transaction.save(function (err) {
              if (err) {
                return res.status(400).send({ message: 'Error while saving transaction' });
              } else {
                for (var i = 0; i < link.length; i++) {
                  if (link[i].rel === 'approval_url') {
                    // res.redirect(link[i].href);
                    res.send(link[i].href);
                  }
                }
              }
            });
          }
        }); // Closing brace of paypal.payment.create()
      
      });
    }

  });

};

exports.removeFromCart = function (req, res) {
  Cart.findOne({ user: req.user._id }, function (err, cart) {
    if (err) {
      return res.status(400).send({
        message: err
      });
    } else {
      var newContent = cart.content;
      for (var i = 0; i < newContent.length; i++) {
        if (req.body.item.toString() === newContent[i].item.toString())
          newContent.splice(i, 1);
        continue;
      }

      Cart.update( { user: req.user._id }, { content: newContent }, function (err2, updatedCart) {
        if (err) {
          return res.status(400).send({
            message: err2
          });
        }

        res.json(updatedCart);
      }); 
    }
  });

};

exports.addToCart = function (req, res) {

  if (req.body.quantity < 0 || req.body.quantity.match(/[0-9]+/) === null || req.body.quantity % 1 !== 0) {
    return res.status(400).send({
      message: 'Please input a valid quantity'
    });
  }

  Cart.findOne({ user: req.user._id }, function (err, user) {
    if (err) {
      return res.status(400).send({
        message: err
      });
    } else if (!user) { // If the user doesn't have a cart EVER.
      if (req.body.quantity < 1) {
        return res.status(400).send({
          message: 'Please input a valid quantity'
        });
      }
      
      var cart = new Cart();
      cart.user = req.user;
      cart.content.push({ item: req.body.item._id, quantity: req.body.quantity });

      cart.save(function (err2, cart) {
        if (err) {
          return res.status(400).send({
            message: err2
          });
        } else {
          res.send({
            message: 'Successfully added to cart'
          });
        }
      });
    } else { // If the user already has a cart.
      var alreadyOrdered = false;
      for (var i = 0; i < user.content.length; i++) { // Check if the user already added this item before.
        if (user.content[i].item.toString() === req.body.item._id.toString()) {
          alreadyOrdered = true;
          user.content[i].quantity = req.body.quantity;
          continue; // Stop the loop
        }
      }

      if (alreadyOrdered) { // Since it was already in his cart before, just update that order's quantity
        if (req.body.quantity <= 0) {
          for (var idx = 0; idx < user.content.length; idx++) {
            if (user.content[idx].item.toString() === req.body.item._id.toString()) {
              user.content.splice(idx, 1);
              continue;
            }
          }
        }

        Cart.update({ user: req.user._id }, { content: user.content }, function (err4, cart) {
          if (err) { // Means a user hasn't added anything to his cart ever.
            return res.status(400).send({
              message: err4
            });
          } else {
            res.send({
              message: 'Updated your order\'s quantity'
            });
          }
        });
      } else {
        if (req.body.quantity < 1) {
          return res.status(400).send({
            message: 'Please input a valid quantity'
          });
        }

        Cart.update({ user: req.user._id }, { $push: { content: { item: req.body.item._id, quantity: req.body.quantity } } }, function (err3, cart) {
          if (err) { // Means a user hasn't added anything to his cart ever.
            return res.status(400).send({
              message: err3
            });
          } else {
            res.send({
              message: 'Successfully added to cart'
            });
          }
        });
      }
    }
  });

};

exports.viewCart = function (req, res) {
  
  Cart.findOne({ user: req.user._id }).lean().exec(function (err, cart) {
    if (err) {
      return res.status(400).send({
        message: 'Failed to load Cart'
      });
    } else if (!cart) {
      return res.status(400).send({
        message: 'Cart does not exist'
      });
    } else if (cart) {
      var itemIds = [];
      for (var i = 0; i < cart.content.length; i++) {
        itemIds.push(cart.content[i].item);
      }

      Item.find( { _id: { $in: itemIds } } ).exec(function (err, items) {
        if (err) {
          return res.status(400).send({
            message: 'Item not found'
          });
        }

        for (var j = 0; j < cart.content.length; j++) {
          for (var k = 0; k < items.length; k++) {
            if (cart.content[j].item.toString() === items[k]._id.toString()) {
              cart.content[j].itemInfo = items[k];
            }
          }
        }

        res.send(cart);
      
      });
    }

  });

};

exports.init = function () {
  paypal.configure({
    'host': 'api.sandbox.paypal.com',
    'port': '',
    'client_id': 'ATyYbJ3d4N-YauTExji9RlkJuF3-rzhAcDHAv0VraepSxpuWq0TBkZa6dxjgGC1hcRwQK5BorV14fItx',
    'client_secret': 'EKOUGLXGTHd6t5Xjk8S2l9ei5ultHi4jRPfNbLkeuuw4eY9nOqVnSRahnT3V9XHee43CB74V7O-aOeNt'
  });
};