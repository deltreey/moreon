'use strict';

angular.module('moreOnApp')
  .controller('ScriptsCtrl', function ($scope, $http) {
  	$scope.scripts = [];
    $http.get('/api/v1/scripts')
	    .success(function (data) {
	    	$scope.scripts = data;
	    });

	  $scope.new = function () {
	   	$http.post('/api/v1/scripts', {
	   		name: 'Name Your Script',
	   		command: 'echo "Stuff and Things"',
	   		defaultInterval: 60 * 1000
	   	}).success(function (data) {
	   			// TODO: redirect to script
	   		});
	  };
  });
