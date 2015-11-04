'use strict';

require('mocha');
var assert = require('assert');
var glob = require('..');

describe('sync', function () {
  it('should expose a sync method', function() {
    assert(glob.sync);
    assert(typeof glob.sync === 'function');
  });

  it('should support globs as a string', function() {
    var files = glob.sync('*.js');
    assert(files);
    assert(files.length);
  });

  it('should support arrays of globs', function() {
    var files = glob.sync(['*.js', '*.json']);
    assert(files);
    assert(files.length);
  });

  it('should take options', function() {
    var files = glob.sync('*.txt', {cwd: 'test/fixtures'});
    assert(files);
    assert(files.length > 1);
  });

  it('should throw an error if the glob is bad', function() {
    try {
      glob.sync({});
      done(new Error('expected an error'));
    } catch(err) {
      assert(err);
      assert(err.message);
      assert(err.message === 'invalid glob pattern: [object Object]');
    }
  });
});
