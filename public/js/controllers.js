App
.controller('StreamController',
    [
        '$scope',
        '$location',
        '$timeout',
        'Socket',
        'Tweet',
        'StreamStatus',
        'Storage',
        function($scope, $location, $timeout, Socket, Tweet, StreamStatus, Storage){
            'use strict';

            $scope.$location = $location;
            $scope.socketInited = StreamStatus.get('socketInited') || false; // prevent reconnect on every submit action
            $scope.loading = StreamStatus.get('loading') || false;      // show/hide loader
            $scope.showHint = StreamStatus.get('showHint') || false;     // show/hide hint
            $scope.hasResults = StreamStatus.get('hasResults') || false;   // show/hide results
            $scope.results = StreamStatus.get('results') || [];         // results array
            $scope.addedToFavorites = false; //show/hide added to favorites alert
            $scope.socketId = StreamStatus.get('socketId') || undefined; //used as key for LocalStorage

            /* called on ng-init() and when send keywords */
            $scope.search = function(){
                var streamOn = StreamStatus.get('connected') || false; // if we came from favorites page or redirected from bad url
                $scope.channels = $scope.channels || StreamStatus.get('channels');

                if($scope.channels){
                    $scope.loading = true;

                    if(!$scope.socketInited || streamOn){
                        if(!streamOn){
                            /* connect only once when app starts */
                            Socket.connect();
                        }
                    }

                    var channels = $scope.channels.split(',');
                    Socket.emit(channels);

                    /* save the required variables and then assign them to the $scope if redirect triggered */
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

            $scope.addToFavorites = function(tweet, added){
                if(!added){
                    Storage.addToFavorites($scope.socketId, tweet);
                }
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
                    /* using $apply because have event from non-Angular */
                    $scope.$apply(function(){
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
            $scope.tweetIndex = null; //clicked tweet index
            $scope.favoritesList = false;
            $scope.removedFromFavorites = false; //show/hide alert
            $scope.q = ''; //filter

            $scope.getAllFromFavorites = function(){
                var storageData = Storage.getFromFavorites();
                $scope.favoritesList = (angular.equals([], storageData)) ? false: storageData;
            };

            $scope.removeFromFavorites = function(index, tweetId){
                $scope.tweetIndex = index;
                Storage.remove(tweetId);
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
