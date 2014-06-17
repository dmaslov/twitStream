describe('Services Tests:', function(){
    describe('factory: StreamStatus', function(){
        'use strict';

        var StreamStatus;

        beforeEach(function(){
            module('twitStream');

            inject(function($injector) {
                StreamStatus = $injector.get('StreamStatus');
            });
        });

        it('should be initted', function(){
            expect(StreamStatus).toBeDefined();
        });

        it('should have a get method', function(){
            expect(angular.isFunction(StreamStatus.get)).toBe(true);
        });

        it('should have a set method', function(){
            expect(angular.isFunction(StreamStatus.set)).toBe(true);
        });

        it('should return value', function(){
            StreamStatus.set('key', 'value');
            var value = StreamStatus.get('key');
            expect(value).toBe('value');
        });

        it('should return undefined if key doesnt exists', function(){
            StreamStatus.set('key', 'value');
            var value = StreamStatus.get('key2');
            expect(value).toBe(undefined);
        });
    });

    describe('factory: Storage', function(){
        'use strict';

        var Storage,
            key;

        beforeEach(function(){
            module('twitStream');

            inject(function($injector) {
                Storage = $injector.get('Storage');
                key = Math.random().toString(36).slice(2);
            });
        });

        afterEach(function(){
            Storage = null;
            key = null;
        });

        it('should be initted', function(){
            expect(Storage).toBeDefined();
        });

        it('should support LocalStorage', function(){
            expect(Storage.isSupported()).toBe(true);
        });

        it('should add tweets to Favorites', function(){
            Storage.addToFavorites(key, tweetObj);
            var response = Storage.getResponse();

            expect(response).toEqual(responseTypes.success);
        });

        it('should return error message if add tweets to Favorites failed', function(){
            Storage.addToFavorites();

            var response = Storage.getResponse();
            expect(response).toEqual(responseTypes.error);
        });

        // it('should return error message if LocalStorage quota is reached when add tweets to Favorites', function(){
        //     //throw new Exception('QUOTA_EXCEEDED_ERR');
        //     Storage.addToFavorites(key, tweetObj);

        //     var response = Storage.getResponse();
        //     expect(response).toEqual(responseTypes.notEnoughSpace);
        // });

        it('should return tweets from Favorites', function(){
            Storage.addToFavorites(key, tweetObj);
            var _return = Storage.getFromFavorites();
            var tweet = _return[0];

            expect(_return instanceof Array).toBe(true);
            expect(tweet instanceof Object).toBe(true);
            expect(typeof tweet.user).not.toBeUndefined();
        });

        it('should remove all tweets from Favorites', function(){
            Storage.addToFavorites(key, tweetObj);
            Storage.removeAll();
            var response = Storage.getResponse();
            var _return = Storage.getFromFavorites();

            expect(response).toEqual(responseTypes.deleteAllSuccess);
            expect(_return instanceof Array).toBe(true);
            expect(_return).toEqual([]);
        });

        it('should check is specific tweet stored', function(){
            Storage.addToFavorites(key, tweetObj);
            var _return = Storage.isStored(tweetObj.idStr);

            expect(_return).toBe(true);
        });

        it('should remove specific tweet', function(){
            Storage.addToFavorites(key, tweetObj);
            Storage.remove(tweetObj.idStr);
            var response = Storage.getResponse();
            var isStored = Storage.isStored(tweetObj.idStr);

            expect(isStored).toBe(false);
            expect(response).toEqual(responseTypes.deleteSuccess);
        });

        it('should return error message if cannot remove specific tweet', function(){
            Storage.remove(tweetObj.idStr);
            var response = Storage.getResponse();
            expect(response).toEqual(responseTypes.deleteError);
        });
    });

    describe('factory: Tweet', function(){
        'use strict';

        var Tweet;

        beforeEach(function(){
            module('twitStream');

            inject(function($injector) {
                Tweet = $injector.get('Tweet');
            });
        });

        afterEach(inject(function($injector) {
            Tweet = null;
        }));

        it('should be initted', function(){
            expect(Tweet).toBeDefined();
        });

        it('should have a parse method', function(){
            expect(angular.isFunction(Tweet.parse)).toBe(true);
        });

        it('should parse a single tweet and return object', function(){
            var _return = Tweet.parse(tweetObj);

            expect(_return instanceof Object).toBe(true);
            expect(_return.user.avatarUrl).toEqual(tweetObj.user.profile_image_url);
            expect(_return.user.screenName).toEqual(tweetObj.user.screen_name);
            expect(_return.user.name).toEqual(tweetObj.user.name);

            expect(_return.source).toEqual(tweetObj.source);
            expect(_return.idStr).toEqual(tweetObj.id_str);
            expect(typeof _return.created).toEqual('string');
            expect(typeof _return.entities).toEqual('string');
        });
    });

    describe('factory: Socket', function(){
        'use strict';

        var Socket;

        beforeEach(function(){
            module('twitStream');
            module('twitStreamMock'); //dirty trick

            inject(function($injector) {
                Socket = $injector.get('Socket');
            });
        });

        it('should be initted', function(){
            expect(Socket).toBeDefined();
        });

        it('should have emit method', function(){
            expect(angular.isFunction(Socket.emit)).toBe(true);
        });

        it('should have connect method', function(){
            expect(angular.isFunction(Socket.connect)).toBe(true);
        });

        it('should have listen method', function(){
            expect(angular.isFunction(Socket.listen)).toBe(true);
            expect(Socket.listen()).toBe(true);
        });

        it('should have getId method', function(){
            expect(angular.isFunction(Socket.getId)).toBe(true);
        });

        it('should emits and receives messages', function(){
            var testReceived = false;

            Socket.on("test", function(data){
                testReceived = true;
            });

            Socket.emit("test", { info: "test" });
            expect(testReceived).toBe(true);
        });
    });
});
