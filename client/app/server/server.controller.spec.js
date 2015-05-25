'use strict';

describe('Controller: ServerCtrl', function () {

  // load the controller's module
  beforeEach(module('moreOnApp'));

  var ServerCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ServerCtrl = $controller('ServerCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
