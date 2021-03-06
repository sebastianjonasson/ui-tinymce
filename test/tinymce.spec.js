/*global describe, beforeEach, module, inject, it, spyOn, expect, $, angular, afterEach, runs, waits */
describe('uiTinymce', function () {
  'use strict';

  var scope, $compile, $timeout, element, directiveElement, id, text = '<p>Hello</p>';
  beforeEach(module('ui.tinymce'));
  beforeEach(function() {
    // throw some garbage in the tinymce cfg to be sure it's getting thru to the directive
    angular.module('ui.tinymce').value('uiTinymceConfig', {tinymce: {bar: 'baz'}});
  });
  beforeEach(inject(function(_$rootScope_, _$compile_, _$timeout_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
    $timeout = _$timeout_;
  }));

  afterEach(function() {
    angular.module('ui.tinymce').value('uiTinymceConfig', {});
    tinymce.remove('textarea');
  });

  /**
   * Asynchronously runs the compilation.
   */
  function compile() {
    element = $compile('<form><textarea ui-tinymce="{foo: \'bar\', setup: setupFooBar() }" ng-model="foo"></textarea></form>')(scope);
    angular.element(document.getElementsByTagName('body')[0]).append(element);
    scope.$apply();
    $timeout.flush();
    directiveElement = element.find('textarea');
    id = directiveElement.attr('id');
  }

  it('should be pristine on load', function() {
    compile();
    expect(directiveElement.controller('form').$pristine).toBe(true);
    expect(directiveElement.controller('ngModel').$pristine).toBe(true);
  });

  describe('compiling this directive', function() {

    it('should include the passed options', function() {
      spyOn(tinymce, 'init');
      compile();
      expect(tinymce.init).toHaveBeenCalled();
      expect(tinymce.init.calls.mostRecent().args[0].foo).toBe('bar');
    });

    it('should include the default options', function() {
      spyOn(tinymce, 'init');
      compile();
      expect(tinymce.init).toHaveBeenCalled();
      expect(tinymce.init.calls.mostRecent().args[0].tinymce.bar).toBe('baz');
    });

    it('should execute the passed `setup` option', function() {
      scope.setupFooBar = jasmine.createSpy('setupFooBar');
      compile();
      expect(scope.setupFooBar).toHaveBeenCalled();
    });
  });

  it('should remove tinymce instance on $scope destruction', function() {
    compile();
    expect(tinymce.get(element.attr('id'))).toBeDefined();

    scope.$destroy();

    expect(tinymce.get(element.attr('id'))).toBeNull();
  });

  // TODO: Figure out why such a large timeout is needed
  describe('setting a value to the model', function() {
    it('should update the editor', function(done) {
      compile();
      setTimeout(function() {
        scope.foo = text;
        scope.$apply();

        try {
          expect(tinymce.get(id).getContent()).toEqual(text);
        } catch(e) {
          expect(true).toBe(false);
          done();
        }

        done();
      }, 100);
    });
    // TODO: Fix test
    xit('should handle undefined gracefully', function(done) {
      compile();
      setTimeout(function() {
        scope.foo = undefined;
        scope.$apply();

        try {
          expect(tinymce.get(id).getContent()).toEqual('');
        } catch(e) {
          expect(true).toBe(false);
          done();
        }

        done();
      }, 100);
    });
    xit('should handle null gracefully', function(done) {
      compile();
      setTimeout(function() {
        scope.foo = null;
        scope.$apply();

        try {
          expect(tinymce.get(id).getContent()).toEqual('');
        } catch(e) {
          expect(true).toBe(false);
          done();
        }

        done();
      }, 100);
    });
  });
  /*describe('using the editor', function () {
    it('should update the model', function (done) {
      compile();
      setTimeout(function () {
        tinymce.get('foo').setContent(text);

        expect(scope.foo).toEqual(text);

        done();
      });
    });
  });*/

});
