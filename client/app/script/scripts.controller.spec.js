'use strict';

describe('Controller: ScriptsCtrl', function () {

  // load the controller's module
  beforeEach(module('moreOnApp'));

  var ScriptCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ScriptCtrl = $controller('ScriptsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
