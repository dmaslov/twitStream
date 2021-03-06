(function(angular){
  'use strict';

  angular
    .module('twitStream')
    .factory('Tweet', Tweet);

  function Tweet(){
    var service = {
      parse: parse
    };

    return service;

    /* Parses tweet entities */
    function parse(tweet){
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

    /* Parses the 'created_at' variable and returns such a line like 'a minute ago' etc. */
    function tweetDateString(time_value){
      var values = time_value.split(" ");
      time_value = values[1] + " " + values[2] + ", " + values[5] + " " + values[3];
      var parsed_date = Date.parse(time_value);
      var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
      var delta = parseInt((relative_to.getTime() - parsed_date) / 1000, 10);
      delta = delta + (relative_to.getTimezoneOffset() * 60);

      var r = '';
      /* istanbul ignore next */
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
    /* istanbul ignore next */
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
  }

})(angular);
