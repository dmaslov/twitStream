describe('Controllers Tests:', function(){
    describe('StreamController', function(){
        'use strict';

        var $scope,
            StreamController,
            StreamStatus,
            Socket,
            Storage,
            $controller,
            $rootScope,
            timerCallback;

        beforeEach(function(){
            module('twitStream');
            module('twitStreamMock'); //dirty trick

            inject(function($injector){
                $rootScope = $injector.get('$rootScope');
                $scope = $rootScope.$new();
                StreamStatus = $injector.get('StreamStatus');
                Socket = $injector.get('Socket');
                Storage = $injector.get('Storage');
                $controller = $injector.get('$controller');
                StreamController = $controller('StreamController', {'$scope': $scope});

                timerCallback = jasmine.createSpy("timerCallback");
                jasmine.clock().install();
            });
        });

        afterEach(function(){
            $scope = null;
            StreamStatus = {};
            StreamController = null;
            Socket = null;
            Storage = null;
            timerCallback = null;
            jasmine.clock().uninstall();
        });

        it('should be inited', function(){
            expect(StreamController).toBeDefined();
        });

        it('should have search method', function(){
            expect(angular.isFunction(StreamController.search)).toBe(true);
        });

        it('should have toggleHint method', function(){
            expect(angular.isFunction(StreamController.toggleHint)).toBe(true);
        });

        it('should have addToFavorites method', function(){
            expect(angular.isFunction(StreamController.addToFavorites)).toBe(true);
        });

        it('should have isFavorited method', function(){
            expect(angular.isFunction(StreamController.isFavorited)).toBe(true);
        });

        it('should have startAlert method', function(){
            expect(angular.isFunction(StreamController.startAlert)).toBe(true);
        });

        it('should have stopAlert method', function(){
            expect(angular.isFunction(StreamController.stopAlert)).toBe(true);
        });

        it('should have $location variable', function(){
            expect($scope.$location).not.toBe(undefined);
        });

        it('should have controller variable', function(){
            expect($scope.controller).not.toBe(undefined);
        });

        it('should have socketInited variable', function(){
            expect(StreamController.socketInited).toBe(false);
        });

        it('should have loading variable', function(){
            expect(StreamController.loading).toBe(false);
        });

        it('should have showHint variable', function(){
            expect(StreamController.showHint).toBe(false);
        });

        it('should have hasResults variable', function(){
            expect(StreamController.hasResults).toBe(false);
        });

        it('should have addedToFavorites variable', function(){
            expect($scope.addedToFavorites).toBe(false);
        });

        it('should have socketId variable', function(){
            expect(StreamController.socketId).toBe(undefined);
        });

        it('should have results variable', function(){
            expect(StreamController.results instanceof Array).toBe(true);
        });

        it('should have alert variable', function(){
            expect($scope.alert).toEqual({active: false, activeFor: 0});
        });

        it('should track `favorites.added` event', function(){
            $rootScope.$broadcast('favorites.added', {status: responseTypes.success});

            expect($scope.addedToFavorites).toBe(true);
            expect($scope.favoritesResponse).toBe(responseTypes.success);

            setTimeout(function(){
                $scope.addedToFavorites = false;
                timerCallback();
            }, 1500);

            expect(timerCallback).not.toHaveBeenCalled();
            expect($scope.addedToFavorites).toBe(true);

            jasmine.clock().tick(1501);
            expect(timerCallback).toHaveBeenCalled();
            expect($scope.addedToFavorites).toBe(false);
        });

        it('should track `socket.updates` event', function(){
            $rootScope.$broadcast('socket.updates', {data: tweetObj});

            expect(StreamController.hasResults).toBe(true);
            expect(StreamController.loading).toBe(false);
            expect(StreamController.results[0] instanceof Object).toBe(true);
            expect(StreamController.results[0].user.name).toEqual(tweetObj.user.name);
            expect(StreamStatus.get('loading')).toBe(false);
            expect($scope.alert).toEqual({active: false});
        });

        it('should track `socket.connected` event', function(){
            var socketId = 'AOZEVLxiaqWkXsnajCpX';
            $rootScope.$broadcast('socket.connected', {socketId: socketId});

            expect(StreamController.socketInited).toBe(true);
            expect(StreamController.socketId).toEqual(socketId);
            expect(StreamStatus.get('socketInited')).toBe(true);
            expect(StreamStatus.get('socketId')).toEqual(socketId);
        });

        it('should track `socket.disconnected` event', function(){
            $rootScope.$broadcast('socket.disconnected');

            expect(StreamController.socketInited).toBe(false);
            expect(StreamStatus.get('socketInited')).toBe(false);
        });

        it('should track `twitter.connected` event', function(){
            $rootScope.$broadcast('twitter.connected');

            expect($scope.alert).toEqual({active: false});
        });

        it('should track `twitter.reconnecting` event', function(){
            var waitSeconds = 3;
            $rootScope.$broadcast('twitter.reconnecting', {waitSec: waitSeconds});

            expect($scope.alert).toEqual({active: true, activeFor: waitSeconds});

            setInterval(function() {
                if(waitSeconds >= 1){
                    $scope.alert.activeFor = waitSeconds--;

                }else{
                    $scope.alert = {
                        active: false,
                        activeFor: 1
                    };
                }
                timerCallback();
            }, 1000);

            expect(timerCallback).not.toHaveBeenCalled();

            jasmine.clock().tick(1000);
            expect(timerCallback.calls.count()).toEqual(1);
            expect($scope.alert).toEqual({active: true, activeFor: 3});

            jasmine.clock().tick(1000);
            expect(timerCallback.calls.count()).toEqual(2);
            expect($scope.alert).toEqual({active: true, activeFor: 2});

            jasmine.clock().tick(1000);
            expect(timerCallback.calls.count()).toEqual(3);
            expect($scope.alert).toEqual({active: true, activeFor: 1});

            jasmine.clock().tick(1000);
            expect(timerCallback.calls.count()).toEqual(4);
            expect($scope.alert).toEqual({active: false, activeFor: 1});
        });

        it('should not connect to socket if track keywords are missing', function(){
            StreamController.search();
            expect(StreamController.loading).toBe(false);
            expect(StreamController.channels).toBeUndefined();
            expect(StreamStatus.get('channels')).toBeUndefined();
            expect(Socket.getId()).toEqual(''); // shouldn't call Socket.connect(), should return empty string in this case
        });

        it('should connect to socket if track keywords present', function(){
            var responseChannels = [];
            //emit action calls in service, check the response here
            Socket.on('addChanel', function(data){
                responseChannels = data.params;
            });

            StreamController.channels = 'Hello,World';
            StreamController.search();

            expect(responseChannels).toEqual(StreamController.channels.split(',')); //string to array conversion
            expect(Socket.getId().length).toBeGreaterThan(0); // should call Socket.connect(), should return not empty string in this case
            expect(StreamStatus.get('channels')).toEqual(StreamController.channels); //saved as string
            expect(StreamController.loading).toBe(true);
            expect(StreamStatus.get('showHint')).toBe(false);
            expect(StreamStatus.get('hasResults')).toBe(true);
            expect(StreamStatus.get('connected')).toBe(true);
            expect(StreamStatus.get('results')).toEqual(StreamController.results);
        });

        it('should toggle search hint', function(){
            var showHint = StreamController.showHint;
            StreamController.toggleHint();
            expect(StreamController.showHint).toBe(!showHint);
        });

        it('should add tweets to Favorites', function(){
            StreamController.channels = 'Hello,World';
            StreamController.search();

            expect(tweetObj.addedTimestamp).toBeUndefined();

            StreamController.addToFavorites(tweetObj);
            var response = Storage.getResponse();

            expect(tweetObj.addedTimestamp).toBeDefined();
            expect(tweetObj.addedTimestamp).toBeLessThan(Date.now());
            expect(response).toEqual(responseTypes.success);
        });

        it('should check is specific tweet stored', function(){
            StreamController.addToFavorites(tweetObj);
            var isFavirited = StreamController.isFavorited(tweetObj.idStr);
            expect(isFavirited).toBe(true);
        });

        it('should stop alerting on $destroy', function(){
            expect($scope.alert.active).toBe(false);
            StreamController.startAlert(60);
            expect($scope.alert.active).toBe(true);
            $scope.$destroy();
            expect($scope.alert.active).toBe(false);
        });
    });


    describe('FavoritesController', function(){
        'use strict';

        var $scope,
            $rootScope,
            Storage,
            $controller,
            FavoritesController,
            key,
            timerCallback;

        beforeEach(function(){
            module('twitStream');

            inject(function($injector){
                $rootScope = $injector.get('$rootScope');
                $scope = $rootScope.$new();
                Storage = $injector.get('Storage');
                $controller = $injector.get('$controller');
                FavoritesController = $controller('FavoritesController', {'$scope': $scope});
                key = Math.random().toString(36).slice(2);

                timerCallback = jasmine.createSpy("timerCallback");
                jasmine.clock().install();
            });
        });

        afterEach(function(){
            $scope = null;
            FavoritesController = null;
            Storage = null;
            key = null;
            timerCallback = null;
            jasmine.clock().uninstall();
        });

        it('should be inited', function(){
            expect(FavoritesController).toBeDefined();
        });

        it('should have getAllFromFavorites method', function(){
            expect(angular.isFunction(FavoritesController.getAllFromFavorites)).toBe(true);
        });

        it('should have removeFromFavorites method', function(){
            expect(angular.isFunction(FavoritesController.removeFromFavorites)).toBe(true);
        });

        it('should have removeAllFromFavorites method', function(){
            expect(angular.isFunction(FavoritesController.removeAllFromFavorites)).toBe(true);
        });

        it('should have $location variable', function(){
            expect($scope.$location).not.toBe(undefined);
        });

        it('should have controller variable', function(){
            expect($scope.controller).not.toBe(undefined);
        });

        it('should have tweetIndex variable', function(){
            expect(FavoritesController.tweetIndex).toBe(null);
        });

        it('should have favoritesList variable', function(){
            expect(FavoritesController.favoritesList).toBe(false);
        });

        it('should have removedFromFavorites variable', function(){
            expect(FavoritesController.removedFromFavorites).toBe(false);
        });

        it('should have q variable', function(){
            expect(FavoritesController.q).toEqual('');
        });

        it('should get all from Favorites', function(){
            expect(FavoritesController.favoritesList).toBe(false);

            Storage.addToFavorites(key, tweetObj); //store data
            FavoritesController.getAllFromFavorites(); //get all data

            var tweet = FavoritesController.favoritesList[0];

            expect(FavoritesController.favoritesList instanceof Array).toBe(true);
            expect(tweet instanceof Object).toBe(true);
            expect(typeof tweet.user).not.toBeUndefined();
            expect(tweet.user).toEqual(tweetObj.user);

        });

        it('should remove all from Favorites', function(){
            expect(FavoritesController.favoritesList).toBe(false);

            Storage.addToFavorites(key, tweetObj); //store data
            FavoritesController.getAllFromFavorites(); //get all data and fill FavoritesController.favoritesList under the hood
            expect(FavoritesController.favoritesList).not.toBe(false);

            FavoritesController.removeAllFromFavorites(); //remove all data
            FavoritesController.getAllFromFavorites(); //get all data again and fill FavoritesController.favoritesList under the hood
            expect(FavoritesController.favoritesList).toBe(false);
        });

        it('should remove specific tweet from Favorites', function(){
            expect(FavoritesController.favoritesList).toBe(false);

            Storage.addToFavorites(key, tweetObj); //store data
            FavoritesController.getAllFromFavorites(); //get all data and fill FavoritesController.favoritesList under the hood
            expect(FavoritesController.favoritesList).not.toBe(false);

            FavoritesController.removeFromFavorites(FavoritesController.favoritesList[0]); //remove specific data
            expect(FavoritesController.tweetIndex).not.toBe(null); //removed from ng-repeat loop
            var _return = Storage.getFromFavorites();
            expect(_return).toEqual([]); //return [] if no data

        });

        it('should track `favorites.removed` event and clear FavoritesController.favoritesList variable', function(){
            Storage.addToFavorites(key, tweetObj); //store data
            FavoritesController.getAllFromFavorites(); //get all data and fill FavoritesController.favoritesList under the hood
            FavoritesController.removeFromFavorites(FavoritesController.favoritesList[0]); //remove specific data

            expect(FavoritesController.favoritesList).toBe(false);
            expect(FavoritesController.removedFromFavorites).toBe(true);
            expect($scope.favoritesResponse).toEqual(responseTypes.deleteSuccess);
            expect(FavoritesController.removedFromFavorites).toBe(true);

            setTimeout(function(){
                FavoritesController.removedFromFavorites = false;
                timerCallback();
            }, 1500);

            expect(timerCallback).not.toHaveBeenCalled();
            expect(FavoritesController.removedFromFavorites).toBe(true);

            jasmine.clock().tick(1501);
            expect(timerCallback).toHaveBeenCalled();
            expect(FavoritesController.removedFromFavorites).toBe(false);
        });

        it('should track `favorites.removedAll` event and clear FavoritesController.favoritesList variable', function(){
            Storage.addToFavorites(key, tweetObj); //store data
            FavoritesController.getAllFromFavorites(); //get all data and fill FavoritesController.favoritesList under the hood
            FavoritesController.removeAllFromFavorites(FavoritesController.favoritesList[0]); //remove specific data

            expect(FavoritesController.favoritesList).toBe(false);
            expect(FavoritesController.removedFromFavorites).toBe(true);
            expect($scope.favoritesResponse).toEqual(responseTypes.deleteAllSuccess);
            expect(FavoritesController.removedFromFavorites).toBe(true);

            setTimeout(function(){
                FavoritesController.removedFromFavorites = false;
                timerCallback();
            }, 1500);

            expect(timerCallback).not.toHaveBeenCalled();
            expect(FavoritesController.removedFromFavorites).toBe(true);

            jasmine.clock().tick(1501);
            expect(timerCallback).toHaveBeenCalled();
            expect(FavoritesController.removedFromFavorites).toBe(false);
        });
    });
});
