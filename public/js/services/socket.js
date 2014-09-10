(function(angular){
  'use strict';

 /*
  * Socket factory. Performs all socket actions.
  */

  /* istanbul ignore next */
  angular
    .module('twitStream')
    .factory('Socket', Socket);

  function Socket($rootScope){
    var _socket = null;
    var service = {
      emit: emit,
      connect: connect
    };

    return service;

    function emit(eventName, data){
      var emitData = {};
      if(typeof data !== 'undefined'){
        emitData = {params: data};
      }
      _socket.emit(eventName, emitData);
    }

    function connect(){
      _socket = io.connect('/');
      listen();
    }

    function listen(){
    _socket
      .on('connect', function(){
        $rootScope.$broadcast('socket.connected', {
          socketId: getId()
        });

      })
      .on('disconnect', function(){
        $rootScope.$broadcast('socket.disconnected');

      })
      .on('news', function(data){
        $rootScope.$broadcast('socket.updates', {data: data});

      })
      .on('twitter.connected', function(){
        $rootScope.$broadcast('twitter.connected');

      })
      .on('twitter.reconnecting', function(data){
        var waitSec = data / 1000;
        $rootScope.$broadcast('twitter.reconnecting', {waitSec: waitSec});

      });
    }

    function getId(){
      return _socket.socket.sessionid;
    }
  }

})(angular);
