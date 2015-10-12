'use strict';

require('mocha');
var assert = require('assert');
var glob = require('..');

describe('glob', function () {
  describe('async', function () {
    it('should be a function', function() {
      assert(glob);
      assert(typeof glob === 'function');
    });

    it('should support globs as a string', function(done) {
      glob('*.js', function(err, files) {
        assert(!err);
        assert(files);
        done();
      });
    });

    it('should support arrays of globs', function(done) {
      glob(['*.js','*.json'], function(err, files) {
        assert(!err);
        assert(files);
        done();
      });
    });

    it('should take options', function(done) {
      glob('*.txt', {cwd: 'test/fixtures'}, function(err, files) {
        assert(!err);
        assert(files);
        assert(files.length);
        done();
      });
    });

    it('should return filepaths relative to process.cwd', function(done) {
      var opts = {cwd: 'test/fixtures', relative: true};
      glob('*.txt', opts, function(err, files) {
        assert(!err);
        assert(files);
        assert(files.length);
        assert(files[0] === 'test/fixtures/a.txt');
        assert(files[1] === 'test/fixtures/b.txt');
        assert(files[2] === 'test/fixtures/c.txt');
        done();
      });
    });

    it('should take ignore patterns', function(done) {
      var opts = {cwd: 'test/fixtures', ignore: ['*.js']};
      glob(['*.*'], opts, function(err, files) {
        assert(!err);
        assert(files);
        assert(files.length);
        assert(~files.indexOf('a.md'));
        assert(!~files.indexOf('a.js'));
        done();
      });
    });

    it('should take negation patterns', function(done) {
      var opts = {cwd: 'test/fixtures'};
      glob(['*.*', '!*.js'], opts, function(err, files) {
        assert(!err);
        assert(files);
        assert(files.length);
        assert(~files.indexOf('a.md'));
        assert(!~files.indexOf('a.js'));
        done();
      });
    });

    it('should use ignore and negation patterns', function(done) {
      glob(['*.js', '!gulpfile.js'], {ignore: ['utils.js']}, function(err, files) {
        assert(!err);
        assert(files);
        assert(files.length === 1);
        assert(files.indexOf('gulpfile.js') === -1);
        done();
      });
    });

    it('should expand tildes in cwd', function(done) {
      glob(['*'], {cwd: '~'}, function(err, files) {
        assert(!err);
        assert(files);
        assert(files.length > 0);
        done();
      });
    });

    it('should expand @ in cwd (global npm modules)', function(done) {
      glob(['*'], {cwd: '@'}, function(err, files) {
        assert(!err);
        assert(files);
        assert(files.length > 0);
        done();
      });
    });

    it('should pass an error in the callback if the glob is bad', function(done) {
      glob({}, {cwd: 'test/fixtures'}, function(err, files) {
        assert(err);
        assert(err.message);
        assert(err.message === 'invalid glob pattern: [object Object]');
        done();
      });
    });

    it('should throw an error if no callback is passed', function(done) {
      try {
        glob('abc');
        done(new Error('expected an error'));
      } catch(err) {
        assert(err);
        assert(err.message);
        assert(err.message === 'expected a callback function.');
        done();
      }
    });
  });

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
});
