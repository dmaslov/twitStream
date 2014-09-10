(function(angular){
  'use strict';

  angular
    .module('twitStream')
    .controller('FavoritesController', FavoritesController);

  FavoritesController.$injector = [
    '$scope',
    '$timeout',
    '$location',
    'Storage'
  ];

  function FavoritesController($scope, $timeout, $location, Storage){
    var vm = this;

    $scope.$location = $location; //To know which tab is active
    $scope.controller = 'FavoritesController';

    vm.removedFromFavorites = false; //Shows/hides alerts
    vm.tweetIndex = null; //A clicked tweet index.
    vm.favoritesList = false;
    vm.q = ''; //Filter

    vm.getAllFromFavorites = function(){
      var storageData = Storage.getFromFavorites();
      vm.favoritesList = (angular.equals([], storageData)) ? false: storageData;
    };

    vm.removeFromFavorites = function(tweet){
      vm.tweetIndex = vm.favoritesList.indexOf(tweet);
      Storage.remove(tweet.idStr);
    };

    vm.removeAllFromFavorites = function(){
      /* istanbul ignore else */
      if(!angular.equals([], vm.favoritesList) && vm.favoritesList){
        Storage.removeAll();
      }
    };

    /* istanbul ignore else */
    if(typeof $scope.$$listeners['favorites.removed'] === 'undefined'){
      $scope.$on('favorites.removed', function(event, response){
        /* istanbul ignore else */
        if(response.status.type === 'ok'){
          vm.favoritesList.splice(vm.tweetIndex, 1);
        }
        /* istanbul ignore else */
        if(angular.equals([], vm.favoritesList)){
          vm.favoritesList = false;
        }
        vm.removedFromFavorites = true;
        $scope.favoritesResponse = response.status;
        /* istanbul ignore next */
        $timeout(function(){
          vm.removedFromFavorites = false;
        }, 1500);
      });
    }

    /* istanbul ignore else */
    if(typeof $scope.$$listeners['favorites.removedAll'] === 'undefined'){
      $scope.$on('favorites.removedAll', function(event, response){
        /* istanbul ignore else */
        if(response.status.type === 'ok'){
          vm.favoritesList = false;
        }
        vm.removedFromFavorites = true;
        $scope.favoritesResponse = response.status;
        /* istanbul ignore next */
        $timeout(function(){
          vm.removedFromFavorites = false;
        }, 1500);
      });
    }
  }

})(angular);
