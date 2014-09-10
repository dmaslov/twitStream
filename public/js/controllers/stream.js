(function(angular){
  'use strict';

  angular
    .module('twitStream')
    .controller('StreamController', StreamController);

  StreamController.$inject = [
    '$scope',
    '$timeout',
    '$location',
    '$interval',
    'Socket',
    'Tweet',
    'StreamStatus',
    'Storage'
  ];

  function StreamController($scope, $timeout, $location, $interval, Socket, Tweet, StreamStatus, Storage){
    var vm = this;
    var stop;//interval variable

    $scope.$location = $location; //To know which tab is active
    $scope.controller = 'StreamController';
    $scope.addedToFavorites = false; //show/hide added to favorites alert
    $scope.alert = {
      active: false,
      activeFor: 0
    };

    vm.socketInited = StreamStatus.get('socketInited') || false; // Prevents from reconnection for every submit action.
    vm.loading = StreamStatus.get('loading') || false;      // Shows/hides loader.
    vm.showHint = StreamStatus.get('showHint') || false;     // Shows/hides hint
    vm.hasResults = StreamStatus.get('hasResults') || false;   // Shows/hides results
    vm.results = StreamStatus.get('results') || [];         // results array
    vm.socketId = StreamStatus.get('socketId') || undefined; //Used as a key for the LocalStorage.

    /* Called on ng-init() and when keywords for tracking are sent. */
    vm.search = function(){
      var streamOn = StreamStatus.get('connected') || false; // If we came from the 'Favorites' page or there was a redirection from some non-existing URL to the 'Stream' page.
      vm.channels = vm.channels || StreamStatus.get('channels');

      if(vm.channels){
        vm.loading = true;
        /* istanbul ignore else */
        if(!vm.socketInited || /* istanbul ignore next */ streamOn){
          /* istanbul ignore else */
          if(!streamOn){
            /* Connects just once when the app starts. */
            Socket.connect();
          }
        }

        var channels = vm.channels.split(',');
        Socket.emit('addChanel', channels);

        /* Save the required variables and then assign them to this if there was a redirection. */
        StreamStatus.set('channels', vm.channels);
        StreamStatus.set('showHint', false);
        StreamStatus.set('hasResults', true);
        StreamStatus.set('results', vm.results);
        StreamStatus.set('connected', true);
      }
    };

    vm.toggleHint = function(){
      vm.showHint = !vm.showHint;
    };

    vm.addToFavorites = function(tweet){
      tweet.addedTimestamp = Date.now();
      Storage.addToFavorites(vm.socketId, tweet);
    };

    vm.isFavorited = function(tweetId){
      var added = Storage.isStored(tweetId);
      return added;
    };

    //creates countdown while alert will be shown and fill alert variable
    vm.startAlert = function(waitSec){
      /* istanbul ignore if */
      if(angular.isDefined(stop)){
        return;
      }
      $scope.alert = {
        active: true,
        activeFor: waitSec
      };
      /* istanbul ignore next */
      stop = $interval(function(){
        if(waitSec >= 1){
          $scope.alert.activeFor = waitSec--;
        }
        else{
          $scope.alert = {
            active: false,
            activeFor: 1
          };
        }
      }, 1000);
    };

    // cancel countdown and clear alert variable
    vm.stopAlert = function(){
      if(angular.isDefined(stop)){
        $interval.cancel(stop);
        stop = undefined;
      }
      $scope.alert = {active: false};
    };

    /* istanbul ignore else */
    if(typeof $scope.$$listeners['favorites.added'] === 'undefined'){
      $scope.$on('favorites.added', function(event, response){
        $scope.addedToFavorites = true;
        $scope.favoritesResponse = response.status;
        /* istanbul ignore next */
        $timeout(function(){
          $scope.addedToFavorites = false;
        }, 1500);
      });
    }

    /* istanbul ignore else */
    if(typeof $scope.$$listeners['socket.updates'] === 'undefined'){
      $scope.$on('socket.updates', function(event, response){
        /* $apply is used because of a non-Angular event. */
        $scope.$apply(function(){
          vm.stopAlert(); //forcibly dismiss "wait" alert
          vm.hasResults = true;
          vm.loading = false;
          vm.results.unshift(Tweet.parse(response.data));

          StreamStatus.set('loading', false);
        });
      });
    }

    /* istanbul ignore else */
    if(typeof $scope.$$listeners['socket.connected'] === 'undefined'){
      $scope.$on('socket.connected', function(event, response){
        vm.socketInited = true;
        vm.socketId = response.socketId;

        StreamStatus.set('socketInited', true);
        StreamStatus.set('socketId', response.socketId);
      });
    }

    /* istanbul ignore else */
    if(typeof $scope.$$listeners['socket.disconnected'] === 'undefined'){
      $scope.$on('socket.disconnected', function(){
        vm.socketInited = false;

        StreamStatus.set('socketInited', false);
      });
    }

    /* istanbul ignore else */
    if(typeof $scope.$$listeners['twitter.connected'] === 'undefined'){
      // Need this because Twitter has exceeded connection limit for user
      // Hide Alert message
      $scope.$on('twitter.connected', function(){
        vm.stopAlert();
      });
    }

    /* istanbul ignore else */
    if(typeof $scope.$$listeners['twitter.reconnecting'] === 'undefined'){
      // Need this because Twitter has exceeded connection limit for user
      // Show Alert message for responded interval
      $scope.$on('twitter.reconnecting', function(event, response){
        vm.startAlert(response.waitSec);
      });
    }

    $scope.$on('$destroy', function(){
      vm.stopAlert();
    });
  }

})(angular);
