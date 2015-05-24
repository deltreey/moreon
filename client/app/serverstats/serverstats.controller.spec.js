'use strict';

describe('Controller: ServerstatsCtrl', function () {

  // load the controller's module
  beforeEach(module('moreOnApp'));

  var ServerstatsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ServerstatsCtrl = $controller('ServerstatsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
