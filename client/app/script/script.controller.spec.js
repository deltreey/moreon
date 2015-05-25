'use strict';

describe('Controller: ScriptCtrl', function () {

  // load the controller's module
  beforeEach(module('moreOnApp'));

  var ScriptCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ScriptCtrl = $controller('ScriptCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
