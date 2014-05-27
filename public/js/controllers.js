App
.controller('StreamController',
    [
        '$scope',
        '$location',
        '$timeout',
        '$interval',
        'Socket',
        'Tweet',
        'StreamStatus',
        'Storage',
        function($scope, $location, $timeout, $interval, Socket, Tweet, StreamStatus, Storage){
            'use strict';

            $scope.$location = $location;
            $scope.socketInited = StreamStatus.get('socketInited') || false; // Prevents from reconnection for every submit action.
            $scope.loading = StreamStatus.get('loading') || false;      // Shows/hides loader.
            $scope.showHint = StreamStatus.get('showHint') || false;     // Shows/hides hint
            $scope.hasResults = StreamStatus.get('hasResults') || false;   // Shows/hides results
            $scope.results = StreamStatus.get('results') || [];         // results array
            $scope.addedToFavorites = false; //show/hide added to favorites alert
            $scope.socketId = StreamStatus.get('socketId') || undefined; //Used as a key for the LocalStorage.
            $scope.alert = {
                active: false,
                activeFor: 0
            };
            var stop;//interval variable

            /* Called on ng-init() and when keywords for tracking are sent. */
            $scope.search = function(){
                var streamOn = StreamStatus.get('connected') || false; // If we came from the 'Favorites' page or there was a redirection from some non-existing URL to the 'Stream' page.
                $scope.channels = $scope.channels || StreamStatus.get('channels');

                if($scope.channels){
                    $scope.loading = true;

                    if(!$scope.socketInited || streamOn){
                        if(!streamOn){
                            /* Connects just once when the app starts. */
                            Socket.connect();
                        }
                    }

                    var channels = $scope.channels.split(',');
                    Socket.emit('addChanel', channels);

                    /* Save the required variables and then assign them to $scope if there was a redirection. */
                    StreamStatus.set('channels', $scope.channels);
                    StreamStatus.set('showHint', false);
                    StreamStatus.set('hasResults', true);
                    StreamStatus.set('results', $scope.results);
                    StreamStatus.set('connected', true);
                }
            };

            $scope.toggleHint = function(){
                $scope.showHint = !$scope.showHint;
            };

            $scope.addToFavorites = function(tweet){
                tweet.addedTimestamp = Date.now();
                Storage.addToFavorites($scope.socketId, tweet);
            };

            $scope.isFavorited = function(tweetId){
                var added = Storage.isStored(tweetId);
                return added;
            };

            //creates countdown while alert will be shown and fill alert variable
            $scope.startAlert = function(waitSec){
                if(angular.isDefined(stop)){
                    return;
                }
                $scope.alert = {
                    active: true,
                    activeFor: waitSec
                };

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
            $scope.stopAlert = function(){
                if(angular.isDefined(stop)){
                    $interval.cancel(stop);
                    stop = undefined;
                }
                $scope.alert = {active: false};
            };

            if(typeof $scope.$$listeners['favorites.added'] == 'undefined'){
                $scope.$on('favorites.added', function(event, response){
                    $scope.addedToFavorites = true;
                    $scope.favoritesResponse = response.status;
                    $timeout(function(){
                        $scope.addedToFavorites = false;
                    }, 1500);
                });
            }

            if(typeof $scope.$$listeners['socket.updates'] == 'undefined'){
                $scope.$on('socket.updates', function(event, response){
                    /* $apply is used because of a non-Angular event. */
                    $scope.$apply(function(){
                        $scope.stopAlert(); //forcibly dismiss "wait" alert
                        $scope.hasResults = true;
                        $scope.loading = false;
                        $scope.results.unshift(Tweet.parse(response.data));

                        StreamStatus.set('loading', false);
                    });
                });
            }

            if(typeof $scope.$$listeners['socket.connected'] == 'undefined'){
                $scope.$on('socket.connected', function(event, response){
                    $scope.socketInited = true;
                    $scope.socketId = response.socketId;

                    StreamStatus.set('socketInited', true);
                    StreamStatus.set('socketId', response.socketId);
                });
            }

            if(typeof $scope.$$listeners['socket.disconnected'] == 'undefined'){
                $scope.$on('socket.disconnected', function(){
                    $scope.socketInited = false;

                    StreamStatus.set('socketInited', false);
                });
            }

            if(typeof $scope.$$listeners['twitter.connected'] == 'undefined'){
                // Need this becouse Twitter has exceeded connection limit for user
                // Hide Alert message
                $scope.$on('twitter.connected', function(){
                    $scope.stopAlert();
                });
            }

            if(typeof $scope.$$listeners['twitter.reconnecting'] == 'undefined'){
                // Need this becouse Twitter has exceeded connection limit for user
                // Show Alert message for responsed interval
                $scope.$on('twitter.reconnecting', function(event, response){
                    $scope.startAlert(response.waitSec);
                });
            }

            $scope.$on('$destroy', function(){
                $scope.stopAlert();
            });
        }
    ]
)
.controller('FavoritesController',
    [
        '$scope',
        '$location',
        '$timeout',
        'Storage',
        function($scope, $location, $timeout, Storage){
            'use strict';

            $scope.$location = $location;
            $scope.tweetIndex = null; //A clicked tweet index.
            $scope.favoritesList = false;
            $scope.removedFromFavorites = false; //Shows/hides alerts
            $scope.q = ''; //Filter

            $scope.getAllFromFavorites = function(){
                var storageData = Storage.getFromFavorites();
                $scope.favoritesList = (angular.equals([], storageData)) ? false: storageData;
            };

            $scope.removeFromFavorites = function(tweet){
                $scope.tweetIndex = $scope.favoritesList.indexOf(tweet);
                Storage.remove(tweet.idStr);
            };

            $scope.removeAllFromFavorites = function(){
                if(!angular.equals([], $scope.favoritesList) && $scope.favoritesList){
                    Storage.removeAll();
                }
            };

            if(typeof $scope.$$listeners['favorites.removed'] == 'undefined'){
                $scope.$on('favorites.removed', function(event, response){
                    if(response.status.type === 'ok'){
                        $scope.favoritesList.splice($scope.tweetIndex, 1);
                    }
                    if(angular.equals([], $scope.favoritesList)){
                        $scope.favoritesList = false;
                    }
                    $scope.removedFromFavorites = true;
                    $scope.favoritesResponse = response.status;
                    $timeout(function(){
                        $scope.removedFromFavorites = false;
                    }, 1500);
                });
            }

            if(typeof $scope.$$listeners['favorites.removedAll'] == 'undefined'){
                $scope.$on('favorites.removedAll', function(event, response){
                    if(response.status.type === 'ok'){
                        $scope.favoritesList = false;
                    }
                    $scope.removedFromFavorites = true;
                    $scope.favoritesResponse = response.status;
                    $timeout(function(){
                        $scope.removedFromFavorites = false;
                    }, 1500);
                });
            }
        }
    ]
);
