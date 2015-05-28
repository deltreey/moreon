'use strict';

angular.module('moreOnApp')
  .controller('ServerCtrl', function ($scope, $http, $routeParams, Modal, $window) {
  	$scope.server = {};
  	$scope.scripts = [];
  	$scope.alerts = [];	

  	function GetServer () {
  		$http.get('/api/v1/servers/' + $routeParams.id)
		    .success(function (data) {
		    	$scope.server = data;
		    });
  	}

  	new GetServer();

	  $http.get('/api/v1/scripts')
	    .success(function (data) {
	    	$scope.scripts = data;
	    });

	  $scope.addScript = function (script) {
	  	$scope.server.activeScripts.push({
	  		script: script,
	  		duration: script.defaultInterval,
	  		server: $scope.server._id
	  	});
	  };

	  $scope.update = function () {
	  	$http.put('/api/v1/servers/' + $routeParams.id, $scope.server)
	  		.success(function () {
	  			$scope.alerts.push({
	  				type: 'success',
	  				message: 'Save Successful!'
	  			});
	  		});
	  };

	  $scope.delete = function () {
	  	var deleteModal = Modal.confirm.delete(function () {
	  		$http.delete('/api/v1/servers/' + $routeParams.id)
		  		.success(function () {
		  			$window.location.href = '/server';
		  		});
	  	});

	  	deleteModal($scope.server.hostname);
	  };
  });
  