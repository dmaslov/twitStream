(function(angular){
  'use strict';

  //Socket behavior mock
  angular
    .module('twitStreamMock')
    .factory('Socket', Socket);

  function Socket($rootScope){
    var _events = {};
    var _socketId = '';
    var service = {
      emit: emit,
      connect: connect,
      listen: listen,
      on: on,
      getId: getId
    };

    return service;

    function emit(eventName, data){
      var emitData = {};
      /* istanbul ignore else */
      if(typeof data !== 'undefined'){
        emitData = {params: data};
      }

      if(_events[eventName]){
        angular.forEach(_events[eventName], function(callback){
          callback(emitData);
        });
      }
    }

    function connect(){
      _socketId = Math.random().toString(36).slice(2);
    }

    function listen(){
      return true;
    }

    function on(eventName, callback){
      /* istanbul ignore else */
      if(!_events[eventName]){
        _events[eventName] = [];
      }
      _events[eventName].push(callback);
    }

    function getId(){
      return _socketId;
    }
  }

})(angular);
