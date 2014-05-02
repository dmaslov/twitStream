'use strict';

var App = angular
.module('twitStream', ['ngRoute', 'ngSanitize', 'ngAnimate'])
.config(function($routeProvider){
    $routeProvider
    .when('/', {
        templateUrl: '/views/partial/stream.html',
        controller: 'StreamController'
    })
    .when('/storage', {
        templateUrl: '/views/partial/favorites.html',
        controller: 'FavoritesController'
    })
    .otherwise({redirectTo:'/'});
});
