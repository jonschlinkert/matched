'use strict';

require('mocha');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const assert = require('assert');
const glob = require('..');

describe('glob', () => {
  describe('async', () => {
    it('should be a function', () => {
      assert(glob);
      assert.equal(typeof glob, 'function');
    });

    it('should support globs as a string', cb => {
      glob('*.js', (err, files) => {
        assert(!err);
        assert(files);
        cb();
      });
    });

    it('should support non-globs as a string', cb => {
      glob('fixtures/a.js', {cwd: __dirname}, (err, files) => {
        assert(!err);
        assert(files);
        assert(files.length);
        cb();
      });
    });

    it('should support arrays of globs', cb => {
      glob(['*.js', '*.json'], (err, files) => {
        assert(!err);
        assert(Array.isArray(files));
        cb();
      });
    });

    it('should support arrays of non-globs', cb => {
      glob(['a.js', 'a.md'], {cwd: path.resolve(__dirname, 'fixtures')}, (err, files) => {
        assert(!err);
        assert(Array.isArray(files));
        assert(files.length);
        cb();
      });
    });

    it('should take options', cb => {
      glob('*.txt', {cwd: 'test/fixtures'}, (err, files) => {
        assert(!err);
        assert(files);
        assert(files.length);
        cb();
      });
    });

    it('should return filepaths relative to process.cwd', cb => {
      let opts = {cwd: 'test/fixtures', relative: true};
      glob('*.txt', opts, (err, files) => {
        assert(!err);
        assert(files);
        assert(files.length);
        assert.equal(files[0], 'test/fixtures/a.txt');
        assert.equal(files[1], 'test/fixtures/b.txt');
        assert.equal(files[2], 'test/fixtures/c.txt');
        cb();
      });
    });

    it('should take ignore patterns', cb => {
      let opts = {cwd: 'test/fixtures', ignore: ['*.js']};
      glob(['*.*'], opts, (err, files) => {
        assert(!err);
        assert(files);
        assert(files.length);
        assert(~files.indexOf('a.md'));
        assert(!~files.indexOf('a.js'));
        cb();
      });
    });

    it('should take negation patterns', cb => {
      let opts = {cwd: 'test/fixtures'};
      glob(['*.*', '!*.js'], opts, (err, files) => {
        assert(!err);
        assert(files);
        assert(files.length);
        assert(~files.indexOf('a.md'));
        assert(!~files.indexOf('a.js'));
        cb();
      });
    });

    it('should use ignore and negation patterns', cb => {
      glob(['*.js', '!gulpfile.js'], { ignore: ['utils.js'] }, (err, files) => {
        assert(!err);
        assert(files);
        assert.equal(files.length, 1);
        assert.equal(files.indexOf('gulpfile.js'), -1);
        cb();
      });
    });

    it('should expand tildes in cwd', cb => {
      glob(['*'], { cwd: '~' }, (err, files) => {
        assert(!err);
        assert(files);
        assert(files.length > 0);
        cb();
      });
    });

    it('should error if the glob is invalid', cb => {
      glob({}, { cwd: 'test/fixtures' }, (err, files) => {
        assert(err);
        assert(err.message);
        assert.equal(err.message, 'invalid glob pattern: [object Object]');
        cb();
      });
    });

    it('should return a promise if no callback is passed', async() => {
      const files = await glob('*.js', { cwd: path.join(__dirname, 'fixtures')});
      assert(files.length >= 1);
    });
  });

  describe('sync', () => {
    it('should expose a sync method', () => {
      assert(glob.sync);
      assert.equal(typeof glob.sync, 'function');
    });

    it('should support globs as a string', () => {
      let files = glob.sync('*.js');
      assert(files);
      assert(files.length);
    });

    it('should support arrays of globs', () => {
      let files = glob.sync(['*.js', '*.json']);
      assert(files);
      assert(files.length);
    });

    it('should take options', () => {
      let files = glob.sync('*.txt', {cwd: 'test/fixtures'});
      assert(files);
      assert(files.length > 1);
    });

    it('should throw an error if the glob is bad', () => {
      assert.throws(() => glob.sync({}), /invalid glob/);
    });
  });

  describe('promise:', () => {
    beforeEach(cb => {
      fs.writeFile('a.txt', 'temp', cb);
    });

    afterEach(cb => {
      rimraf('a.txt', cb);
    });

    it('should glob files with `glob.promise`.', async() => {
      const files = await glob(['*.txt']);
      assert.equal(files[0], 'a.txt');
    });
  });
});
