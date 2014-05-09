/*
* Socket factory. Performs all socket actions
*/
App.factory('Socket', function($rootScope){
    'use strict';

    var socket = null;

    return {
        emit: function(channels){
            socket.emit('addChanel', {channels: channels});
        },

        connect: function(){
            socket = io.connect('/');
            this.listen();
        },

        listen: function(){
            socket
            .on('connect', function(){
                $rootScope.$broadcast('socket.connected', {
                    socketId: this.getId()
                });

            }.bind(this))
            .on('disconnect', function(){
                $rootScope.$broadcast('socket.disconnected');

            })
            .on('news', function(data){
                $rootScope.$broadcast('socket.updates', {
                    data: data
                });
            }.bind(this));
        },

        getId: function(){
            return socket.socket.sessionid;
        }
    };
});

/*
* Tweet factory. Parse single tweet data.
*/
App.factory('Tweet', function(Storage){
    'use strict';

    return {
        /* parses tweet entities */
        parse: function(tweet){
            /* Parse created_at variable and returns string like 'a minute ago' etc. */
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

            /* returns formatted (with html tags) entities like hashtags, mentions */
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
* Keeps temporary data from controllers. Helps to restore $scope state when navigate between controllers
*/
App.factory('StreamStatus', function(){
    'use strict';

    var tmp = {};
    return {
        set: function(key, value){
            tmp[key] = value;
        },

        get: function(key){
            return tmp[key];
        }
    };
});

/*
* Performs actions to save/remove data from LocalStorage
*/
App.factory('Storage', function($rootScope, localStorageService){
    'use strict';

    var storageKey = null;
    var response = {};
    var responseTypes = {
        success: {
            message: 'Added to favorites!',
            bootstrapClass: 'success',
            type: 'ok'
        },

        error: {
            message: 'Adding to favorites failed..',
            bootstrapClass: 'danger',
            type: 'error'
        },

        notEnoughSpace: {
            message: 'You don\'t have enough space in browser local storage..',
            bootstrapClass: 'warning',
            type: 'error'
        },

        deleteSuccess: {
            message: 'Removed from favorites!',
            bootstrapClass: 'success',
            type: 'ok'
        },

        deleteError: {
            message: 'Removing from favorites failed..',
            bootstrapClass: 'danger',
            type: 'error'
        },

        deleteAllSuccess: {
            message: 'Removed all from favorites!',
            bootstrapClass: 'success',
            type: 'ok'
        },

        deleteAllError: {
            message: 'Removing all from favorites failed..',
            bootstrapClass: 'danger',
            type: 'error'
        }
    };

    return {
        isSupported: function(){
            return localStorageService.isSupported;
        },

        set: function(value){
            return localStorageService.set(storageKey, value);
        },

        get: function(){
            return localStorageService.get(storageKey);
        },

        remove: function(tweetId){
            var tweets;
            var restTweets = [];
            try{
                tweets = this.get();
                if(!tweets || tweets === 'null'){
                    response = responseTypes.deleteError;
                }
                else{
                    delete tweets[tweetId];

                    angular.forEach(tweets, function(value, key){
                        this.push(value);
                    }, restTweets);

                    this.set(tweets);
                    response = responseTypes.deleteSuccess;
                }
            }
            catch(e){
                response = responseTypes.deleteError;
            }

            $rootScope.$broadcast('favorites.removed', {
                status: this.getResponse()
            });
        },

        removeAll: function(){
            try{
                localStorageService.remove(storageKey);
                response = responseTypes.deleteAllSuccess;
            }
            catch(e){
                response = responseTypes.deleteAllError;
            }

            $rootScope.$broadcast('favorites.removedAll', {
                status: this.getResponse()
            });
        },

        addToFavorites: function(key, tweet){
            var value;
            try{
                storageKey = key;
                value = this.get(key);
                if(!value || value === 'null'){
                    value = {};
                }

                value[tweet.idStr] = tweet;
                this.set(value);
                response = responseTypes.success;
            }
            catch(e){
                if(e.name === 'QUOTA_EXCEEDED_ERR' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED'){
                    response = responseTypes.notEnoughSpace;
                }
                else{
                    response = responseTypes.error;
                }
            }

            $rootScope.$broadcast('favorites.added', {
                status: this.getResponse()
            });
        },

        getFromFavorites: function(){
            var _return = [];
            var data = this.get();

            if(data){
                angular.forEach(data, function(value, key){
                    this.push(value);
                }, _return);
            }
            return _return;
        },

        getResponse: function(){
            return response;
        }
    };
});
