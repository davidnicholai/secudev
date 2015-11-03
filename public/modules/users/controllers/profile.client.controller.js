'use strict';

angular.module('users').controller('ProfileController', ['$scope', '$location', 'Authentication', '$http', '$stateParams', 'Boards', '$window',
  function($scope, $location, Authentication, $http, $stateParams, Boards, $window) {
    $scope.authentication = Authentication;

    // If user is not signed in then redirect to signin page
    if (!$scope.authentication.user) $location.path('/signin');

    if ($scope.authentication.user) {
      if ($scope.authentication.user.gender === 'male')
        $scope.gender = 'M';
      else if ($scope.authentication.user.gender === 'female')
        $scope.gender = 'F';
    }

    $scope.loadOtherProfile = function () {
      $http.get('/users/' + $stateParams.username).success(function(response) {
        $scope.user = response;

        if ($scope.user.gender === 'male') {
          $scope.othergender = 'M';
        } else if ($scope.user.gender === 'female')
          $scope.othergender = 'F';

        $http.get('/boards/user/' + $stateParams.username).success(function (response) {
          $scope.postBadgeCount = response.postBadge;
          
          if (response.postBadge === 1) {
            $scope.postBadge = 'Participant Badge';
          } else if (response.postBadge === 2) {
            $scope.postBadge = 'Chatter Badge';
          } else if (response.postBadge === 3) {
            $scope.postBadge = 'Socialite Badge';
          }

          updateTotalBadge();
        });

        $http.get('/transactions/user/' + $stateParams.username).success(function (response) {
          $scope.shopBadgeCount = response.shopBadge;
          $scope.donationBadgeCount = response.donationBadge;

          if (response.shopBadge === 1) {
            $scope.shopBadge = 'Shopper Badge';
          } else if (response.shopBadge === 2) {
            $scope.shopBadge = 'Promoter Badge';
          } else if (response.shopBadge === 3) {
            $scope.shopBadge = 'Elite Badge';
          }

          if (response.donationBadge === 1) {
            $scope.donationBadge = 'Supporter Badge';
          } else if (response.donationBadge === 2) {
            $scope.donationBadge = 'Contributor Badge';
          } else if (response.donationBadge === 3) {
            $scope.donationBadge = 'Pillar Badge';
          }

          updateTotalBadge();
        });
      });
    };

    //

    $scope.loadProfile = function () {

      $http.get('/boards/user').success(function (response) {
        $scope.postBadgeCount = response.postBadge;
        
        if (response.postBadge === 1) {
          $scope.postBadge = 'Participant Badge';
        } else if (response.postBadge === 2) {
          $scope.postBadge = 'Chatter Badge';
        } else if (response.postBadge === 3) {
          $scope.postBadge = 'Socialite Badge';
        }

        updateTotalBadge();
      });

      $http.get('/transactions/user').success(function (response) {
        $scope.shopBadgeCount = response.shopBadge;
        $scope.donationBadgeCount = response.donationBadge;

        if (response.shopBadge === 1) {
          $scope.shopBadge = 'Shopper Badge';
        } else if (response.shopBadge === 2) {
          $scope.shopBadge = 'Promoter Badge';
        } else if (response.shopBadge === 3) {
          $scope.shopBadge = 'Elite Badge';
        }

        if (response.donationBadge === 1) {
          $scope.donationBadge = 'Supporter Badge';
        } else if (response.donationBadge === 2) {
          $scope.donationBadge = 'Contributor Badge';
        } else if (response.donationBadge === 3) {
          $scope.donationBadge = 'Pillar Badge';
        }

        updateTotalBadge();
      });   
    };

    function updateTotalBadge() {
      if ($scope.postBadgeCount >= 1 && $scope.shopBadgeCount >= 1 && $scope.donationBadgeCount >= 1) {
        $scope.badgeCollection = 'Explorer Badge';
        if ($scope.donationBadgeCount >= 2 && $scope.shopBadgeCount >= 2) {
          $scope.badgeCollection = 'Backer Badge';
        }
      }

      if ($scope.postBadgeCount === 3 && $scope.shopBadgeCount === 3 && $scope.donationBadgeCount === 3) {
        $scope.badgeCollection = 'Evangelist Badge';
      }
    }

  }
]);