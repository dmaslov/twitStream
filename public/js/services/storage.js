(function(angular){
  'use strict';

  /*
  * Saves/removes data from LocalStorage
  */
  angular
    .module('twitStream')
    .factory('Storage', Storage);

  function Storage($rootScope, localStorageService){
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
    var service = {
      isSupported: isSupported,
      isStored: isStored,
      remove: remove,
      removeAll: removeAll,
      addToFavorites: addToFavorites,
      getFromFavorites: getFromFavorites,
      getResponse: getResponse
    };

    return service;

    function _storeIndex(value){
      _storedIndexes.push(value);
    };

    function _removeIndex(value){
      var i = _storedIndexes.indexOf(value);
      /* istanbul ignore else */
      if(i > -1){
        _storedIndexes.splice(i, 1);
      }
    };

    function _removeAllIndexes(){
      _storedIndexes = [];
    };

    function _getData(){
      return localStorageService.get(_storageKey);
    };

    function _setData(value){
      return localStorageService.set(_storageKey, value);
    };

    function isSupported(){
      return localStorageService.isSupported;
    }

    function isStored(tweetId){
      return _storedIndexes.indexOf(tweetId) !== -1;
    }

    function remove(tweetId){
      var tweets;
      var restTweets = [];
      try{
        tweets = _getData();
        if(!tweets || tweets === 'null'){
          _response = _responseTypes.deleteError;
        }
        else{
          delete tweets[tweetId];
          /* istanbul ignore next */
          angular.forEach(tweets, function(value, key){
              this.push(value);
          }, restTweets);

          _setData(tweets);
          _removeIndex(tweetId);
          _response = _responseTypes.deleteSuccess;
        }
      }
      catch(e){
        /* istanbul ignore next */
        _response = _responseTypes.deleteError;
      }

      $rootScope.$broadcast('favorites.removed', {
        status: getResponse()
      });
    }

    function removeAll(){
      try{
        localStorageService.remove(_storageKey);
        _removeAllIndexes();
        _response = _responseTypes.deleteAllSuccess;
      }
      catch(e){
        /* istanbul ignore next */
        _response = _responseTypes.deleteAllError;
      }

      $rootScope.$broadcast('favorites.removedAll', {
        status: getResponse()
      });
    }

    function addToFavorites(key, tweet){
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
          console.log(e);
          _response = _responseTypes.error;
        }
      }

      $rootScope.$broadcast('favorites.added', {
        status: getResponse()
      });
    }

    function getFromFavorites(){
      var _return = [];
      var data = _getData();

      if(data){
        angular.forEach(data, function(value, key){
          this.push(value);
        }, _return);
      }
      return _return;
    }

    function getResponse(){
      return _response;
    }
  }

})(angular);
