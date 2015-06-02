'use strict';

angular.module('moreOnApp')
  .controller('ServerstatsCtrl', function ($scope, $http, $interval) {
    $scope.servers = [];
    $scope.colorList = [
      'FF785C',
      'FFB15C',
      '4390AE',
      '46C375',
      'FC5A38',
      'FC9E38',
      '287E9E',
      '29B75E',
      'F33209',
      'F38309',
      '0C7299',
      '06B146',
      'C22403',
      'C26703',
      '075A7A',
      '028D36',
      '9E1B00',
      '9E5200',
      '044963',
      '00732B'
    ];

    function GetServers() {
      $http.get('/api/v1/servers/charts')
        .success(function (servers) {
          var colorIndex = -1;

          $scope.servers = _.map(servers, function (server) {
            var serverIndex = _.findWhere($scope.servers, { id: server._id.toString() });
            var scopeServer = null;

            if (serverIndex) {
              scopeServer = $scope.servers[serverIndex];
            }
            else {
              scopeServer = {
                id: server._id.toString(),
                name: server.description
              };
            }
            
            scopeServer.charts = _.map(server.activeScripts, function (interval) {
              var rows = [];

              _.each(interval.results, function (dataPoint) {
                rows.push({
                  c: [{
                    // this assumes that time is more relevant than date, may change
                    v: new Date(dataPoint.timestamp).toLocaleTimeString()
                  },{
                    v: dataPoint.value
                  }]
                });
              });

              ++colorIndex;
              if (colorIndex >= $scope.colorList.length) {
                colorIndex = 0;
              }

              return {
                type: 'AreaChart',
                options: {
                  title: interval.script.name,
                  legend: 'none',
                  colors: ['#' + $scope.colorList[colorIndex]]
                },
                data: {
                  cols: [{
                    id: 'time',
                    label: 'Time',
                    type: 'string'
                  },{
                    id: 'val',
                    label: 'Value',
                    type: 'number'
                  }],
                  rows: rows
                }
              };
            });

            return scopeServer;
          });
        });
    }

    new GetServers();
    var interval = $interval(GetServers, 60 * 1000);

    $scope.$on('$destroy', function() {
      $interval.cancel(interval);
    });
  });
