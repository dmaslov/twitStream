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
            expect(angular.isFunction($scope.search)).toBe(true);
        });

        it('should have toggleHint method', function(){
            expect(angular.isFunction($scope.toggleHint)).toBe(true);
        });

        it('should have addToFavorites method', function(){
            expect(angular.isFunction($scope.addToFavorites)).toBe(true);
        });

        it('should have isFavorited method', function(){
            expect(angular.isFunction($scope.isFavorited)).toBe(true);
        });

        it('should have startAlert method', function(){
            expect(angular.isFunction($scope.startAlert)).toBe(true);
        });

        it('should have stopAlert method', function(){
            expect(angular.isFunction($scope.stopAlert)).toBe(true);
        });

        it('should have socketInited variable', function(){
            expect($scope.socketInited).toBe(false);
        });

        it('should have loading variable', function(){
            expect($scope.loading).toBe(false);
        });

        it('should have showHint variable', function(){
            expect($scope.showHint).toBe(false);
        });

        it('should have hasResults variable', function(){
            expect($scope.hasResults).toBe(false);
        });

        it('should have addedToFavorites variable', function(){
            expect($scope.addedToFavorites).toBe(false);
        });

        it('should have socketId variable', function(){
            expect($scope.socketId).toBe(undefined);
        });

        it('should have results variable', function(){
            expect($scope.results instanceof Array).toBe(true);
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

            expect($scope.hasResults).toBe(true);
            expect($scope.loading).toBe(false);
            expect($scope.results[0] instanceof Object).toBe(true);
            expect($scope.results[0].user.name).toEqual(tweetObj.user.name);
            expect(StreamStatus.get('loading')).toBe(false);
            expect($scope.alert).toEqual({active: false});
        });

        it('should track `socket.connected` event', function(){
            var socketId = 'AOZEVLxiaqWkXsnajCpX';
            $rootScope.$broadcast('socket.connected', {socketId: socketId});

            expect($scope.socketInited).toBe(true);
            expect($scope.socketId).toEqual(socketId);
            expect(StreamStatus.get('socketInited')).toBe(true);
            expect(StreamStatus.get('socketId')).toEqual(socketId);
        });

        it('should track `socket.disconnected` event', function(){
            $rootScope.$broadcast('socket.disconnected');

            expect($scope.socketInited).toBe(false);
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
            $scope.search();
            expect($scope.loading).toBe(false);
            expect($scope.channels).toBeUndefined();
            expect(StreamStatus.get('channels')).toBeUndefined();
            expect(Socket.getId()).toEqual(''); // shouldn't call Socket.connect(), should return empty string in this case
        });

        it('should connect to socket if track keywords present', function(){
            var responseChannels = [];
            //emit action calls in service, check the response here
            Socket.on('addChanel', function(data){
                responseChannels = data.params;
            });

            $scope.channels = 'Hello,World';
            $scope.search();

            expect(responseChannels).toEqual($scope.channels.split(',')); //string to array conversion
            expect(Socket.getId().length).toBeGreaterThan(0); // should call Socket.connect(), should return not empty string in this case
            expect(StreamStatus.get('channels')).toEqual($scope.channels); //saved as string
            expect($scope.loading).toBe(true);
            expect(StreamStatus.get('showHint')).toBe(false);
            expect(StreamStatus.get('hasResults')).toBe(true);
            expect(StreamStatus.get('connected')).toBe(true);
            expect(StreamStatus.get('results')).toEqual($scope.results);
        });

        it('should toggle search hint', function(){
            var showHint = $scope.showHint;
            $scope.toggleHint();
            expect($scope.showHint).toBe(!showHint);
        });

        it('should add tweets to Favorites', function(){
            $scope.channels = 'Hello,World';
            $scope.search();

            expect(tweetObj.addedTimestamp).toBeUndefined();

            $scope.addToFavorites(tweetObj);
            var response = Storage.getResponse();

            expect(tweetObj.addedTimestamp).toBeDefined();
            expect(tweetObj.addedTimestamp).toBeLessThan(Date.now());
            expect(response).toEqual(responseTypes.success);
        });

        it('should check is specific tweet stored', function(){
            $scope.addToFavorites(tweetObj);
            var isFavirited = $scope.isFavorited(tweetObj.idStr);
            expect(isFavirited).toBe(true);
        });

        it('should stop alerting on $destroy', function(){
            expect($scope.alert.active).toBe(false);
            $scope.startAlert(60);
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
            expect(angular.isFunction($scope.getAllFromFavorites)).toBe(true);
        });

        it('should have removeFromFavorites method', function(){
            expect(angular.isFunction($scope.removeFromFavorites)).toBe(true);
        });

        it('should have removeAllFromFavorites method', function(){
            expect(angular.isFunction($scope.removeAllFromFavorites)).toBe(true);
        });

        it('should have tweetIndex variable', function(){
            expect($scope.tweetIndex).toBe(null);
        });

        it('should have favoritesList variable', function(){
            expect($scope.favoritesList).toBe(false);
        });

        it('should have removedFromFavorites variable', function(){
            expect($scope.removedFromFavorites).toBe(false);
        });

        it('should have q variable', function(){
            expect($scope.q).toEqual('');
        });

        it('should get all from Favorites', function(){
            expect($scope.favoritesList).toBe(false);

            Storage.addToFavorites(key, tweetObj); //store data
            $scope.getAllFromFavorites(); //get all data

            var tweet = $scope.favoritesList[0];

            expect($scope.favoritesList instanceof Array).toBe(true);
            expect(tweet instanceof Object).toBe(true);
            expect(typeof tweet.user).not.toBeUndefined();
            expect(tweet.user).toEqual(tweetObj.user);

        });

        it('should remove all from Favorites', function(){
            expect($scope.favoritesList).toBe(false);

            Storage.addToFavorites(key, tweetObj); //store data
            $scope.getAllFromFavorites(); //get all data and fill $scope.favoritesList under the hood
            expect($scope.favoritesList).not.toBe(false);

            $scope.removeAllFromFavorites(); //remove all data
            $scope.getAllFromFavorites(); //get all data again and fill $scope.favoritesList under the hood
            expect($scope.favoritesList).toBe(false);
        });

        it('should remove specific tweet from Favorites', function(){
            expect($scope.favoritesList).toBe(false);

            Storage.addToFavorites(key, tweetObj); //store data
            $scope.getAllFromFavorites(); //get all data and fill $scope.favoritesList under the hood
            expect($scope.favoritesList).not.toBe(false);

            $scope.removeFromFavorites($scope.favoritesList[0]); //remove specific data
            expect($scope.tweetIndex).not.toBe(null); //removed from ng-repeat loop
            var _return = Storage.getFromFavorites();
            expect(_return).toEqual([]); //return [] if no data

        });

        it('should track `favorites.removed` event and clear $scope.favoritesList variable', function(){
            Storage.addToFavorites(key, tweetObj); //store data
            $scope.getAllFromFavorites(); //get all data and fill $scope.favoritesList under the hood
            $scope.removeFromFavorites($scope.favoritesList[0]); //remove specific data

            expect($scope.favoritesList).toBe(false);
            expect($scope.removedFromFavorites).toBe(true);
            expect($scope.favoritesResponse).toEqual(responseTypes.deleteSuccess);
            expect($scope.removedFromFavorites).toBe(true);

            setTimeout(function(){
                $scope.removedFromFavorites = false;
                timerCallback();
            }, 1500);

            expect(timerCallback).not.toHaveBeenCalled();
            expect($scope.removedFromFavorites).toBe(true);

            jasmine.clock().tick(1501);
            expect(timerCallback).toHaveBeenCalled();
            expect($scope.removedFromFavorites).toBe(false);
        });

        it('should track `favorites.removedAll` event and clear $scope.favoritesList variable', function(){
            Storage.addToFavorites(key, tweetObj); //store data
            $scope.getAllFromFavorites(); //get all data and fill $scope.favoritesList under the hood
            $scope.removeAllFromFavorites($scope.favoritesList[0]); //remove specific data

            expect($scope.favoritesList).toBe(false);
            expect($scope.removedFromFavorites).toBe(true);
            expect($scope.favoritesResponse).toEqual(responseTypes.deleteAllSuccess);
            expect($scope.removedFromFavorites).toBe(true);

            setTimeout(function(){
                $scope.removedFromFavorites = false;
                timerCallback();
            }, 1500);

            expect(timerCallback).not.toHaveBeenCalled();
            expect($scope.removedFromFavorites).toBe(true);

            jasmine.clock().tick(1501);
            expect(timerCallback).toHaveBeenCalled();
            expect($scope.removedFromFavorites).toBe(false);
        });
    });
});
