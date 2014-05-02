//'use strict';

App
.controller('StreamController',
    [
        '$location',
        '$scope',
        'Socket',
        'Tweet',
        'StreamStatus',
        function($location, $scope, Socket, Tweet, StreamStatus){
            $scope.socketInited = StreamStatus.socketInited || false; // prevent reconnect on every submit action
            $scope.loading = StreamStatus.loading || false;      // show/hide loader
            $scope.showHint = StreamStatus.showHint || false;     // show/hide hint
            $scope.hasResults = StreamStatus.hasResults || false;   // show/hide results
            $scope.results = StreamStatus.results || [];         // results array

            $scope.search = function(){
                var streamOn = StreamStatus.connected || false;
                $scope.channels = $scope.channels || StreamStatus.channels;

                if($scope.channels){
                    $scope.loading = true;

                    if(!$scope.socketInited || streamOn){
                        if(!streamOn){
                            Socket.connect();
                        }

                        if(typeof $scope.$$listeners['socket.updates'] == 'undefined'){
                            $scope.$on('socket.updates', function () {
                                $scope.$apply(function(){
                                    $scope.hasResults = true;
                                    $scope.loading = false;
                                    $scope.results.unshift({tweet: Tweet.parse(Socket.response)});
                                });
                            });
                        }

                        if(typeof $scope.$$listeners['socket.updates'] == 'undefined'){
                            $scope.$on('socket.connected', function () {
                                $scope.socketInited = true;
                            });
                        }

                        if(typeof $scope.$$listeners['socket.updates'] == 'undefined'){
                            $scope.$on('socket.disconnected', function () {
                                $scope.socketInited = false;
                            });
                        }
                    }

                    var channels = $scope.channels.split(',');
                    Socket.emit(channels);

                    storeStatus();
                }
            };

            var storeStatus = function(){
                //store $scope variables in separated object. Need to restore $scope when redirect
                StreamStatus.socketInited = $scope.socketInited;
                StreamStatus.loading = $scope.loading;
                StreamStatus.showHint = false;
                StreamStatus.hasResults = true;
                StreamStatus.channels = $scope.channels;
                StreamStatus.results = $scope.results;
                StreamStatus.connected = true;
            };

            $scope.toggleHint = function(){
                $scope.showHint = !$scope.showHint;
            };
        }
    ]
)
.controller('FavoritesController',
    [
        '$location',
        '$scope',
        function(loc, scope){
            //not implemented yet..
        }
    ]
);
