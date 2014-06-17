var App = angular
.module('twitStream', ['ngRoute', 'ngSanitize', 'ngAnimate', 'LocalStorageModule'])
.config(function($routeProvider){
    'use strict';

    $routeProvider
    .when('/', {
        templateUrl: '/partial/stream.html',
        controller: 'StreamController'
    })
    .when('/storage', {
        templateUrl: '/partial/favorites.html',
        controller: 'FavoritesController'
    })
    .otherwise({redirectTo:'/'});
});

var AppMock  = angular.module('twitStreamMock', []); //mock for unit tests
