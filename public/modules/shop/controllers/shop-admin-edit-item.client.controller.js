'use strict';

// Shops controller
angular.module('shop').controller('ShopAdminEditItemController', ['$scope', '$stateParams', '$timeout', '$window', 'Authentication', 'FileUploader', '$location', '$http',
  function($scope, $stateParams, $timeout, $window, Authentication, FileUploader, $location, $http) {
    $scope.authentication = Authentication;

    $scope.isNotReady = true;
    $scope.cannotDelete = false;

    if ($scope.authentication.user.roles !== 'admin') {
      $location.path('/#!/profile');
    }

    $scope.fetchItemInfo = function () {
      $http.get('/items/' + $stateParams.itemID).success(function (response) {
        $scope.item = response;
        $scope.item.image = $scope.item.image;
        $scope.fileName = $scope.item.image;
      });
    };

    $scope.submit = function () {
      $scope.error = null;

      var item = {
        name: this.item.name,
        description: this.item.description,
        price: this.item.price,
        image: $scope.fileName
      };

      $http.put('/items/' + $stateParams.itemID, item).success(function (response) {
        $location.path('/#!/shop/' + $stateParams.itemID);
      }).error(function (response) {
        $scope.error = response.message;
      });

    };

    $scope.delete = function () {
      $scope.cannotDelete = true;
      $http.delete('/items/' + $stateParams.itemID).success(function (response) {
        $scope.error = 'Successfully deleted this item';
        $location.path('/shop');
      });
    };

    // Start of File Upload

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: '/items/image'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;
      $scope.isNotReady = false; // Means that system is ready to Submit the item since there is already an image uploaded
      $scope.fileName = response.fileName;

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadImage = function () {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
    };
  
  }
]);