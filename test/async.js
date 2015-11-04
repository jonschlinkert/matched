'use strict';

require('mocha');
var assert = require('assert');
var glob = require('..');

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
    var fixtures = glob.sync('lib/*.js');
    var patterns = ['lib/*.js', '!lib/async.js'];

    glob(patterns, {ignore: ['lib/utils.js']}, function(err, files) {
      assert(!err);
      assert(files);
      assert(files.length === fixtures.length - 2);
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
