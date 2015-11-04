'use strict';

require('mocha');
var assert = require('assert');
var glob = require('..');

describe('stream', function () {
  it('should expose a stream method', function() {
    assert(glob.stream);
    assert(typeof glob.stream === 'function');
  });

  it('should support globs as a string', function(done) {
    var files = [];

    glob.stream('*.js') 
      .on('data', function(file) {
        assert(file);
        assert(typeof file.path === 'string');
        files.push(file);
      })
      .on('end', function () {
        assert(files);
        assert(files.length);
        done();
      });
  });

  it('should support arrays of globs', function() {
    var files = [];
    glob.stream(['*.js', '*.json'])
      .on('data', function(file) {
        assert(file);
        assert(typeof file.path === 'string');
        files.push(file);
      })
      .on('end', function () {
        assert(files);
        assert(files.length > 1);
        done();
      });
  });

  it('should take options', function() {
    var files = [];
    glob.stream('*.txt', {cwd: 'test/fixtures'})
      .on('data', function(file) {
        assert(file);
        assert(typeof file.path === 'string');
        files.push(file);
      })
      .on('end', function () {
        assert(files);
        assert(files.length);
        done();
      });
  });

  it('should throw an error if the glob is bad', function() {
    try {
      glob.stream({});
      done(new Error('expected an error'));
    } catch(err) {
      assert(err);
      assert(err.message);
      assert(err.message === 'invalid glob pattern: [object Object]');
    }
  });
});
