'use strict';

angular.module('moreOnApp')
  .controller('ServersCtrl', function ($scope, $http) {
    $http.get('/api/v1/servers')
	    .success(function (data) {
	    	$scope.servers = data;
	    });

	  $scope.new = function () {
	   	$http.post('/api/v1/servers', {
	   		hostname: 'servername',
	   		description: 'Human readable description',
	   		username: 'administrator',
	   		activeScripts: [],
	   		durations: []
	   	}).success(function (data) {
	   			// TODO: redirect to server
	   		});
	  };
  });
