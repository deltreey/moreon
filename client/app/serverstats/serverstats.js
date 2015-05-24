'use strict';

angular.module('moreOnApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/serverstats', {
        templateUrl: 'app/serverstats/serverstats.html',
        controller: 'ServerstatsCtrl'
      })
      .when('/', {
      	redirectTo: '/serverstats'
      });
  });
