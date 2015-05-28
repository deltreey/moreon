'use strict';

angular.module('moreOnApp')
  .controller('ScriptsCtrl', function ($scope, $http) {
  	$scope.scripts = [];
  	$scope.alerts = [];

  	function GetScripts() {
  		$http.get('/api/v1/scripts')
		    .success(function (data) {
		    	$scope.scripts = data;
		    });
  	}

  	new GetScripts();

	  $scope.new = function () {
	   	$http.post('/api/v1/scripts', {
	   		name: 'Name Your Script',
	   		command: 'echo "Stuff and Things"',
	   		defaultInterval: 60 * 1000
	   	}).success(function () {
	   			new GetScripts();
	   		});
	  };

		$scope.update = function (script) {
	  	$http.put('/api/v1/scripts/' + script._id, script)
	  		.success(function () {
	  			// TODO: notify user
	  		});
	  };

		$scope.delete = function (script) {
	  	$http.delete('/api/v1/scripts/' + script._id)
	  		.success(function () {
	  			new GetScripts();
	  			$scope.alerts.push({
	  				type: 'success',
	  				message: script.name + ' deleted!',
	  				undo: function () {
	  					$http.post('/api/v1/scripts', script)
	  						.success(function () {
					   			new GetScripts();
					   		});
	  				}
	  			});
	  		});
	  };
  });
