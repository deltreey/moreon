'use strict';

angular.module('moreOnApp')
  .controller('ServersCtrl', function ($scope, $http, $window) {
  	$scope.servers = [];
  	$scope.alerts = [];

  	function GetServers() {
  		$http.get('/api/v1/servers')
		    .success(function (data) {
		    	$scope.servers = data;
		    });
  	}

  	new GetServers();

	  $scope.new = function () {
	   	$http.post('/api/v1/servers', {
	   		hostname: 'servername',
	   		description: 'Human readable description',
	   		username: 'administrator',
	   		activeScripts: [],
	   		intervals: []
	   	}).success(function (data) {
	   			$window.location.href = '/server/' + data._id;
	   		});
	  };

	  $scope.delete = function (server) {
	  	$http.delete('/api/v1/servers/' + server._id)
	  		.success(function () {
	  			new GetServers();
	  			$scope.alerts.push({
	  				type: 'success',
	  				message: server.hostname + ' deleted!',
	  				undo: function () {
	  					$http.post('/api/v1/servers', server)
	  						.success(function () {
					   			new GetServers();
					   		});
	  				}
	  			});
	  		});
	  };
  });
