'use strict';

angular.module('moreOnApp')
  .controller('ServerCtrl', function ($scope, $http, $routeParams) {
    $http.get('/api/v1/servers/' + $routeParams.id)
	    .success(function (data) {
	    	$scope.server = data;
	    });

	  $scope.update = function () {
	  	$http.put('/api/v1/servers/' + $routeParams.id, $scope.server)
	  		.success(function (data) {
	  			// TODO: notify user
	  		});
	  };

	  $scope.delete = function () {
	  	$http.delete('/api/v1/servers/' + $routeParams.id)
	  		.success(function (data) {
	  			// TODO: redirect to servers page
	  		});
	  };
  });
  