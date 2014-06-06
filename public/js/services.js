/*
* Socket factory. Performs all socket actionsю
*/
App.factory('Socket', function($rootScope){
    'use strict';

    var _socket = null;

    return {
        emit: function(name, data){
            var emitData = {};
            if(typeof data !== 'undefined'){
                emitData = {params: data};
            }
            _socket.emit(name, emitData);
        },

        connect: function(){
            _socket = io.connect('/');
            this.listen();
        },

        listen: function(){
            _socket
            .on('connect', function(){
                $rootScope.$broadcast('socket.connected', {
                    socketId: this.getId()
                });

            }.bind(this))
            .on('disconnect', function(){
                $rootScope.$broadcast('socket.disconnected');

            })
            .on('news', function(data){
                $rootScope.$broadcast('socket.updates', {data: data});
            }.bind(this))
            .on('twitter.connected', function(){
                $rootScope.$broadcast('twitter.connected');

            })
            .on('twitter.reconnecting', function(data){
                var waitSec = data / 1000;
                $rootScope.$broadcast('twitter.reconnecting', {waitSec: waitSec});

            });
        },

        getId: function(){
            return _socket.socket.sessionid;
        }
    };
});

/*
* Tweet factory. Parses a single tweet data.
*/
App.factory('Tweet', function(Storage){
    'use strict';

    return {
        /* Parses tweet entities */
        parse: function(tweet){
            /* Parses the 'created_at' variable and returns such a line like 'a minute ago' etc. */
            function tweetDateString(time_value){
                var values = time_value.split(" ");
                time_value = values[1] + " " + values[2] + ", " + values[5] + " " + values[3];
                var parsed_date = Date.parse(time_value);
                var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
                var delta = parseInt((relative_to.getTime() - parsed_date) / 1000, 10);
                delta = delta + (relative_to.getTimezoneOffset() * 60);

                var r = '';
                if(delta < 60){
                    r = 'a minute ago';
                }else if(delta < 120){
                    r = 'couple of minutes ago';
                }else if(delta < (45*60)){
                    r = (parseInt(delta / 60, 10)).toString() + ' minutes ago';
                }else if(delta < (90*60)){
                    r = 'an hour ago';
                }else if(delta < (24*60*60)){
                    r = '' + (parseInt(delta / 3600, 10)).toString() + ' hours ago';
                }else if(delta < (48*60*60)){
                    r = '1 day ago';
                }else{
                    r = (parseInt(delta / 86400, 10)).toString() + ' days ago';
                }

                return r;
            }

            /* Returns such formatted (with html tags) entities like hashtags, mentions etc */
            function linkifyEntities(tweet){
                if(!(tweet.entities)){
                    return tweet.text;
                }

                var index_map = {};

                if(typeof tweet.entities.urls != 'undefined'){
                    tweet.entities.urls.forEach(function(entry){
                        index_map[entry.indices[0]] = [
                            entry.indices[1],
                            function(text){
                                return '<a href="'+entry.url+'"><b>'+entry.url+'</b></a>';
                            }
                        ];
                    });
                }

                if(typeof tweet.entities.hashtags != 'undefined'){
                    tweet.entities.hashtags.forEach(function(entry){
                        index_map[entry.indices[0]] = [
                            entry.indices[1],
                            function(text) {
                                return '<a href="http://twitter.com/search?q='+escape("#"+entry.text)+'"&src=hash"><s>'+text.substring(0, 1)+'</s><b>'+text.substring(1, text.length)+'</b></a>';
                            }
                        ];
                    });
                }

                if(typeof tweet.entities.user_mentions != 'undefined'){
                    tweet.entities.user_mentions.forEach(function(entry){
                        index_map[entry.indices[0]] = [
                            entry.indices[1],
                            function(text) {
                                return '<a href="http://twitter.com/'+entry.screen_name+'"><s>'+text.substring(0, 1)+'</s><b>'+text.substring(1, text.length)+'</b></a>';
                            }
                        ];
                    });
                }

                if(typeof tweet.entities.media != 'undefined'){
                    tweet.entities.media.forEach(function(entry){
                        index_map[entry.indices[0]] = [
                            entry.indices[1],
                            function(text) {
                                return '<div class="tweet-media"><img src="'+entry.media_url+'"></div>';
                            }
                        ];
                    });
                }

                var result = '';
                var last_i = 0;
                var i = 0;

                for(i = 0; i < tweet.text.length; ++i){
                    var ind = index_map[i];
                    if(ind){
                        var end = ind[0];
                        var func = ind[1];
                        if(i > last_i){
                            result += tweet.text.substring(last_i, i);
                        }
                        result += func(tweet.text.substring(i, end));
                        i = end - 1;
                        last_i = end;
                    }
                }

                if(i > last_i){
                    result += tweet.text.substring(last_i, i);
                }
                return result;
            }

            return {
                user: {
                    avatarUrl: tweet.user.profile_image_url,
                    screenName: tweet.user.screen_name,
                    name: tweet.user.name
                },
                source: tweet.source,
                entities: linkifyEntities(tweet),
                idStr: tweet.id_str,
                created: tweetDateString(tweet.created_at)
            };
        }
    };
});

/*
* Keeps temporary data from controllers. Helps to restore the $scope state for data communication or navigation between controllers.
*/
App.factory('StreamStatus', function(){
    'use strict';

    var _tmp = {};
    return {
        set: function(key, value){
            _tmp[key] = value;
        },

        get: function(key){
            return _tmp[key];
        }
    };
});

/*
* Saves/removes data from LocalStorage
*/
App.factory('Storage', function($rootScope, localStorageService){
    'use strict';

    var _storageKey = null;
    var _response = {};
    var _responseTypes = {
        success: {
            message: 'Added to "Favorites".',
            bootstrapClass: 'success',
            type: 'ok'
        },

        error: {
            message: 'Adding to "Favorites" failed.',
            bootstrapClass: 'danger',
            type: 'error'
        },

        notEnoughSpace: {
            message: 'You don\'t have enough space in the browser local storage.',
            bootstrapClass: 'warning',
            type: 'error'
        },

        deleteSuccess: {
            message: 'Removed from "Favorites".',
            bootstrapClass: 'success',
            type: 'ok'
        },

        deleteError: {
            message: 'Removing from "Favorites" failed.',
            bootstrapClass: 'danger',
            type: 'error'
        },

        deleteAllSuccess: {
            message: 'All from "Favorites" is removed.',
            bootstrapClass: 'success',
            type: 'ok'
        },

        deleteAllError: {
            message: 'Removing all from "Favorites" failed.',
            bootstrapClass: 'danger',
            type: 'error'
        }
    };

    var _storedIndexes = [];
    var _storeIndex = function(value){
        _storedIndexes.push(value);
    };
    var _removeIndex = function(value){
        var i = _storedIndexes.indexOf(value);
        if(i > -1){
            _storedIndexes.splice(i, 1);
        }
    };
    var _removeAllIndexes = function(){
        _storedIndexes = [];
    };

    var _getData = function(){
        return localStorageService.get(_storageKey);
    };
    var _setData = function(value){
        return localStorageService.set(_storageKey, value);
    };

    return {
        isSupported: function(){
            return localStorageService.isSupported;
        },

        isStored: function(tweetId){
            return _storedIndexes.indexOf(tweetId) !== -1;
        },

        remove: function(tweetId){
            var tweets;
            var restTweets = [];
            try{
                tweets = _getData();
                if(!tweets || tweets === 'null'){
                    _response = _responseTypes.deleteError;
                }
                else{
                    delete tweets[tweetId];

                    angular.forEach(tweets, function(value, key){
                        this.push(value);
                    }, restTweets);

                    _setData(tweets);
                    _removeIndex(tweetId);
                    _response = _responseTypes.deleteSuccess;
                }
            }
            catch(e){
                _response = _responseTypes.deleteError;
            }

            $rootScope.$broadcast('favorites.removed', {
                status: this.getResponse()
            });
        },

        removeAll: function(){
            try{
                localStorageService.remove(_storageKey);
                _removeAllIndexes();
                _response = _responseTypes.deleteAllSuccess;
            }
            catch(e){
                _response = _responseTypes.deleteAllError;
            }

            $rootScope.$broadcast('favorites.removedAll', {
                status: this.getResponse()
            });
        },

        addToFavorites: function(key, tweet){
            var value;
            try{
                _storageKey = key;
                value = _getData();
                if(!value || value === 'null'){
                    value = {};
                }

                value[tweet.idStr] = tweet;
                _setData(value);
                _storeIndex(tweet.idStr);

                _response = _responseTypes.success;
            }
            catch(e){
                if(e.name === 'QUOTA_EXCEEDED_ERR' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED'){
                    _response = _responseTypes.notEnoughSpace;
                }
                else{
                    _response = _responseTypes.error;
                }
            }

            $rootScope.$broadcast('favorites.added', {
                status: this.getResponse()
            });
        },

        getFromFavorites: function(){
            var _return = [];
            var data = _getData();

            if(data){
                angular.forEach(data, function(value, key){
                    this.push(value);
                }, _return);
            }
            return _return;
        },

        getResponse: function(){
            return _response;
        }
    };
});
