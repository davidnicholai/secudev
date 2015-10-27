'use strict';

//Shops service used to communicate Shops REST endpoints
angular.module('shop').factory('Shop', ['$resource',
  function($resource) {
    return $resource('shop/:shopId', { shopId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);