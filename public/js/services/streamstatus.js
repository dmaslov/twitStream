(function(angular){
  'use strict';

  /*
  * Keeps temporary data from controllers.
  * Helps to restore the $scope state for data communication or navigation
  * between controllers.
  */
  angular
    .module('twitStream')
    .factory('StreamStatus', StreamStatus);

  function StreamStatus(){
    var _tmp = {};
    var service = {
      set: set,
      get: get
    };

    return service;

    function set(key, value){
      _tmp[key] = value;
    }

    function get(key){
      return _tmp[key];
    }
  }

})(angular);
