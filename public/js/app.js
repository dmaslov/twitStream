'use strict';

var App = angular.module('twitStream', ['ngRoute', 'ngSanitize', 'ngAnimate']).config(function($routeProvider){
    $routeProvider
    .when('/', {
        controller: 'IndexController'
    })
    .when('/storage', {
        templateUrl: 'views/storage.html',
        controller: 'StorageController'
    })
    .otherwise({redirectTo:'/'});
});
