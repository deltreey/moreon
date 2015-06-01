'use strict';

angular.module('moreOnApp')
  .controller('ServerstatsCtrl', function ($scope, $http, $interval) {
    $scope.charts = [];
    var colorList = [
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
          $scope.charts = [];
          var colorIndex = 0;
          for (var s = 0; s < servers.length; ++s) {
            var server = servers[s];
            // Only display active servers
            for (var a = 0; a < server.activeScripts.length; ++a) {
              var rows = [];
              var displayScript = server.activeScripts[a];
              var maxCount = 10;

              if (displayScript.results.length < maxCount) {
                maxCount = displayScript.results.length;
              }
              for (var n = 0; n < maxCount; ++n) {
                var value = displayScript.results[n].value;
                var time = new Date(displayScript.results[n].timestamp);
                rows.push({
                  c: [{
                    // this assumes that time is more relevant than date, may change
                    v: time.toLocaleTimeString()
                  },{
                    v: value
                  }]
                });
              }

              $scope.charts.push({
                type: 'AreaChart',
                options: {
                  title: server.hostname + ': ' + displayScript.script.name,
                  legend: 'none',
                  colors: ['#' + colorList[colorIndex]]
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
              });

              ++colorIndex;
              if (colorIndex >= colorList.length) {
                colorIndex = 0;
              }
            }
          }
        });
    }

    new GetServers();
    var interval = $interval(GetServers, 60 * 1000);

    $scope.$on('$destroy', function() {
      $interval.cancel(interval);
    });
  });
