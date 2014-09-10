(function(angular){
  'use strict';

  angular
    .module('twitStream', ['ngRoute', 'ngSanitize', 'ngAnimate', 'LocalStorageModule'])
    .config(Config);

  function Config($routeProvider){
    $routeProvider
      .when('/', {
        templateUrl: '/partial/stream.html',
        controller: 'StreamController',
        controllerAs: 'Stream'
      })
      .when('/storage', {
        templateUrl: '/partial/favorites.html',
        controller: 'FavoritesController',
        controllerAs: 'Fav'
      })
      .otherwise({redirectTo:'/'});
  }

})(angular);
