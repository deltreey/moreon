'use strict';

angular.module('moreOnApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/scripts', {
        templateUrl: 'app/script/scripts.html',
        controller: 'ScriptsCtrl',
        authenticate: true
      });
  });
