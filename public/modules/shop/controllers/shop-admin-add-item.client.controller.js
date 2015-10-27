'use strict';

// Shops controller
angular.module('shop').controller('ShopAdminAddItemController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader', '$location', '$http',
  function($scope, $timeout, $window, Authentication, FileUploader, $location, $http) {
    $scope.authentication = Authentication;

    $scope.isNotReady = true;

    if ($scope.authentication.user.roles !== 'admin') {
      $location.path('/profile');
    }

    $scope.submit = function () {
      $scope.error = null;

      var item = {
        name: this.name,
        description: this.description,
        price: this.price,
        image: $scope.fileName
      };

      $http.post('/items', item).success(function (response) {
        $location.path('/shop/manage');
      }).error(function (response) {
        $scope.error = response.message;
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