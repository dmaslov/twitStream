//'use strict';

App
.controller('IndexController',
    [
        '$location',
        '$scope',
        'Socket',
        'Tweet',
        function($location, $scope, Socket, Tweet){
            $scope.socketInited = false; // prevent reconnect on every submit action
            $scope.loading = false;      // show/hide loader
            $scope.showHint = false;     // show/hide hint
            $scope.hasResults = false;   // show/hide results
            $scope.results = [];         // results array

            $scope.search = function(){
                console.log($scope);
                if($scope.channels){
                    $scope.loading = true;

                    if(!$scope.socketInited){
                        Socket.connect();

                        $scope.$on('socket.updates', function () {
                            $scope.$apply(function(){
                                $scope.hasResults = true;
                                $scope.loading = false;
                                $scope.results.unshift({tweet: Tweet.parse(Socket.response)});
                            });
                        });

                        $scope.$on('socket.connected', function () {
                            $scope.socketInited = true;
                        });

                        $scope.$on('socket.disconnected', function () {
                            $scope.socketInited = false;
                        });
                    }

                    var channels = $scope.channels.split(',');
                    //$scope.results = [];
                    Socket.emit(channels);
                }
            };

            $scope.toggleHint = function(){
                $scope.showHint = !$scope.showHint;
            };
        }
    ]
)
.controller('StorageController',
    [
        '$location',
        '$scope',
        function(loc, scope){
        }
    ]
);
