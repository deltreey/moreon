'use strict';

angular.module('moreOnApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/script', {
        templateUrl: 'app/script/scripts.html',
        controller: 'ScriptsCtrl'
      })
      .when('/script/:id', {
        templateUrl: 'app/script/script.html',
        controller: 'ScriptCtrl'
      });
  });
