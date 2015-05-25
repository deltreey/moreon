'use strict';

angular.module('moreOnApp')
  .controller('ScriptCtrl', function ($scope, $http, $routeParams) {
    $http.get('/api/v1/scripts/' + $routeParams.id)
	    .success(function (data) {
	    	$scope.script = data;
	    });

	  $scope.update = function () {
	  	$http.put('/api/v1/scripts/' + $routeParams.id, $scope.script)
	  		.success(function (data) {
	  			// TODO: notify user
	  		});
	  };

	  $scope.delete = function () {
	  	$http.delete('/api/v1/scripts/' + $routeParams.id)
	  		.success(function (data) {
	  			// TODO: redirect to scripts page
	  		});
	  };
  });
  