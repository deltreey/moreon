'use strict';

angular.module('moreOnApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/server', {
        templateUrl: 'app/server/servers.html',
        controller: 'ServersCtrl',
        authenticate: true
      })  
      .when('/server/:id', {
        templateUrl: 'app/server/server.html',
        controller: 'ServerCtrl',
        authenticate: true
      });
  });
