'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var assert = require('assert');
var glob = require('..');

describe('glob', function() {
  describe('async', function() {
    it('should be a function', function() {
      assert(glob);
      assert.equal(typeof glob, 'function');
    });

    it('should support globs as a string', function(cb) {
      glob('*.js', function(err, files) {
        assert(!err);
        assert(files);
        cb();
      });
    });

    it('should support non-globs as a string', function(cb) {
      glob('fixtures/a.js', {cwd: __dirname}, function(err, files) {
        assert(!err);
        assert(files);
        assert(files.length);
        cb();
      });
    });

    it('should support arrays of globs', function(cb) {
      glob(['*.js', '*.json'], function(err, files) {
        assert(!err);
        assert(Array.isArray(files));
        cb();
      });
    });

    it('should support arrays of non-globs', function(cb) {
      glob(['a.js', 'a.md'], {cwd: path.resolve(__dirname, 'fixtures')}, function(err, files) {
        assert(!err);
        assert(Array.isArray(files));
        assert(files.length);
        cb();
      });
    });

    it('should expose non-emumerable files.cache array', function(cb) {
      glob(['*.js', '*.json'], function(err, files) {
        assert(!err);
        assert(Array.isArray(files.cache));
        cb();
      });
    });

    it('should take options', function(cb) {
      glob('*.txt', {cwd: 'test/fixtures'}, function(err, files) {
        assert(!err);
        assert(files);
        assert(files.length);
        cb();
      });
    });

    it('should return filepaths relative to process.cwd', function(cb) {
      var opts = {cwd: 'test/fixtures', relative: true};
      glob('*.txt', opts, function(err, files) {
        assert(!err);
        assert(files);
        assert(files.length);
        assert.equal(files[0], 'test/fixtures/a.txt');
        assert.equal(files[1], 'test/fixtures/b.txt');
        assert.equal(files[2], 'test/fixtures/c.txt');
        cb();
      });
    });

    it('should take ignore patterns', function(cb) {
      var opts = {cwd: 'test/fixtures', ignore: ['*.js']};
      glob(['*.*'], opts, function(err, files) {
        assert(!err);
        assert(files);
        assert(files.length);
        assert(~files.indexOf('a.md'));
        assert(!~files.indexOf('a.js'));
        cb();
      });
    });

    it('should take negation patterns', function(cb) {
      var opts = {cwd: 'test/fixtures'};
      glob(['*.*', '!*.js'], opts, function(err, files) {
        assert(!err);
        assert(files);
        assert(files.length);
        assert(~files.indexOf('a.md'));
        assert(!~files.indexOf('a.js'));
        cb();
      });
    });

    it('should use ignore and negation patterns', function(cb) {
      glob(['*.js', '!gulpfile.js'], {ignore: ['utils.js']}, function(err, files) {
        assert(!err);
        assert(files);
        assert.equal(files.length, 1);
        assert.equal(files.indexOf('gulpfile.js'), -1);
        cb();
      });
    });

    it('should expand tildes in cwd', function(cb) {
      glob(['*'], { cwd: '~' }, function(err, files) {
        assert(!err);
        assert(files);
        assert(files.length > 0);
        cb();
      });
    });

    it('should error if the glob is invalid', function(cb) {
      glob({}, { cwd: 'test/fixtures' }, function(err, files) {
        assert(err);
        assert(err.message);
        assert.equal(err.message, 'invalid glob pattern: [object Object]');
        cb();
      });
    });

    it('should return a promise if no callback is passed', async function() {
      const files = await glob('*.js', { cwd: path.join(__dirname, 'fixtures')});
      assert(files.length >= 1);
    });
  });

  describe('sync', function() {
    it('should expose a sync method', function() {
      assert(glob.sync);
      assert.equal(typeof glob.sync, 'function');
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

    it('should expose a non-emumerable `cache` property', function() {
      var files = glob.sync(['*.js', '*.json', 'lib/**/*.*']);
      assert(files.cache);
      assert(Array.isArray(files.cache));
    });

    it('should take options', function() {
      var files = glob.sync('*.txt', {cwd: 'test/fixtures'});
      assert(files);
      assert(files.length > 1);
    });

    it('should throw an error if the glob is bad', function() {
      assert.throws(() => glob.sync({}), /invalid glob/);
    });
  });

  describe('promise:', function() {
    beforeEach(function(cb) {
      fs.writeFile('a.txt', 'This is a test.', function(err) {
        if (err) return cb(err);
        cb();
      });
    });

    afterEach(function(cb) {
      rimraf('a.txt', cb);
    });

    it('should glob files with `glob.promise`.', async function() {
      const files = await glob.promise(['*.txt']);
      assert.equal(files[0], 'a.txt');
    });

    it('should expose a `files.cache` array', function(cb) {
      glob.promise(['*.txt'])
        .then(function(files) {
          assert(Array.isArray(files.cache));
          cb();
        });
    });
  });
});
