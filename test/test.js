'use strict';

require('mocha');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const assert = require('assert');
const symlinks = require('./support/symlinks');
const glob = require('..');

describe('glob', () => {
  describe('async', () => {
    it('should be a function', () => {
      assert(glob);
      assert.equal(typeof glob, 'function');
    });

    it('should support globs as a string', cb => {
      glob('*.js', (err, files) => {
        if (err) {
          cb(err);
          return;
        }
        assert(files);
        cb();
      });
    });

    it('should support non-globs as a string', cb => {
      glob('fixtures/a.js', { cwd: __dirname }, (err, files) => {
        if (err) {
          cb(err);
          return;
        }

        assert(files);
        assert(files.length);
        cb();
      });
    });

    it('should support arrays of globs', cb => {
      glob(['*.js', '*.json'], (err, files) => {
        if (err) {
          cb(err);
          return;
        }
        assert(Array.isArray(files));
        cb();
      });
    });

    it('should support arrays of non-globs', cb => {
      glob(['a.js', 'a.md'], { cwd: path.resolve(__dirname, 'fixtures') }, (err, files) => {
        if (err) {
          cb(err);
          return;
        }
        assert(Array.isArray(files));
        assert(files.length);
        cb();
      });
    });

    it('should take options', cb => {
      glob('*.txt', { cwd: 'test/fixtures' }, (err, files) => {
        if (err) {
          cb(err);
          return;
        }
        assert(files);
        assert(files.length);
        cb();
      });
    });

    it('should return filepaths relative to process.cwd', cb => {
      const opts = { cwd: 'test/fixtures', relative: true };
      glob('*.txt', opts, (err, files) => {
        if (err) {
          cb(err);
          return;
        }
        assert(files);
        assert(files.length);
        assert.equal(files[0], 'test/fixtures/a.txt');
        assert.equal(files[1], 'test/fixtures/b.txt');
        assert.equal(files[2], 'test/fixtures/c.txt');
        cb();
      });
    });

    it('should take ignore patterns', cb => {
      glob(['*.*'], { cwd: 'test/fixtures', ignore: ['*.js'] }, (err, files) => {
        if (err) {
          cb(err);
          return;
        }
        assert(files);
        assert(files.length);
        assert(files.includes('a.md'));
        assert(!files.includes('a.js'));
        cb();
      });
    });

    it('should take negation patterns', cb => {
      const opts = { cwd: 'test/fixtures' };
      glob(['*.*', '!*.js'], opts, (err, files) => {
        if (err) {
          cb(err);
          return;
        }
        assert(files);
        assert(files.length);
        assert(files.includes('a.md'));
        assert(!files.includes('a.js'));
        cb();
      });
    });

    it('should use ignore and negation patterns', cb => {
      glob(['*.js', '!gulpfile.js'], { ignore: ['utils.js'] }, (err, files) => {
        if (err) {
          cb(err);
          return;
        }
        assert(files);
        assert.equal(files.length, 1);
        assert.equal(files.indexOf('gulpfile.js'), -1);
        cb();
      });
    });

    it('should expand tildes in cwd', cb => {
      glob(['*'], { cwd: '~', nonull: true }, (err, files) => {
        if (err) {
          cb(err);
          return;
        }
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

    it('should support options.realpath', async () => {
      const symlinksDir = path.resolve(__dirname, 'symlinks');

      const unlink = symlinks({
        src: path.resolve(__dirname, 'fixtures'),
        dest: symlinksDir
      });

      const files = await glob(['*.js', '*.json'], { realpath: true, cwd: symlinksDir });

      assert(files);
      assert(files.length);
      assert(files.every(fp => !/symlinks/.test(fp)));
      assert(files.every(fp => /fixtures/.test(fp)));

      unlink();
    });

    it('should support options.realpath with literal file paths', async () => {
      const symlinksDir = path.resolve(__dirname, 'symlinks');

      const unlink = symlinks({
        src: path.resolve(__dirname, 'fixtures'),
        dest: symlinksDir
      });

      const files = await glob(['a.js', 'b.js'], { realpath: true, cwd: symlinksDir });

      assert(files);
      assert(files.length);
      assert(files.every(fp => !/symlinks/.test(fp)));
      assert(files.every(fp => /fixtures/.test(fp)));
      unlink();
    });

    it('should support options.absolute', async () => {
      const relative = await glob(['*.js', '*.json'], { absolute: false });
      assert(relative);
      assert(relative.length);
      assert(relative.every(fp => !path.isAbsolute(fp)));

      const absolute = await glob(['*.js', '*.json'], { absolute: true });
      assert(absolute);
      assert(absolute.length);
      assert(absolute.every(fp => path.isAbsolute(fp)));
    });

    it('should return a promise if no callback is passed', async () => {
      const files = await glob('*.js', { cwd: path.join(__dirname, 'fixtures') });
      assert(files.length >= 1);
    });

    it('should support options.onMatch to listen for match events', async () => {
      const files = [];
      const onMatch = ({ path }) => files.push(path);
      await glob('*.js', { cwd: path.join(__dirname, 'fixtures'), onMatch });
      assert(files.length >= 1);
    });

    it('should support options.onFiles', async () => {
      const files = [];
      const onFiles = dirents => files.push(...dirents);
      await glob('*.js', { cwd: path.join(__dirname, 'fixtures'), onFiles });
      assert(files.length >= 1);
    });
  });

  describe('sync', () => {
    it('should expose a sync method', () => {
      assert(glob.sync);
      assert.equal(typeof glob.sync, 'function');
    });

    it('should support globs as a string', () => {
      const files = glob.sync('*.js');
      assert(files);
      assert(files.length);
    });

    it('should support arrays of globs', () => {
      const files = glob.sync(['*.js', '*.json']);
      assert(files);
      assert(files.length);
    });

    it('should work when globs are prefixed with path parts', () => {
      const files = glob.sync(['fixtures/*.js', 'fixtures/*.txt'], { cwd: __dirname });
      assert(files);
      assert(files.length);
    });

    it('should take options', () => {
      const files = glob.sync('*.txt', { cwd: 'test/fixtures' });
      assert(files);
      assert(files.length > 1);
    });

    it('should throw an error if the glob is bad', () => {
      assert.throws(() => glob.sync({}), /invalid glob/);
    });

    it('should support options.realpath', () => {
      const symlinksDir = path.resolve(__dirname, 'symlinks');

      const unlink = symlinks({
        src: path.resolve(__dirname, 'fixtures'),
        dest: symlinksDir
      });

      const files = glob.sync(['*.js', '*.json'], { realpath: true, cwd: symlinksDir });

      assert(files);
      assert(files.length);
      assert(files.every(fp => !/symlinks/.test(fp)));
      assert(files.every(fp => /fixtures/.test(fp)));

      unlink();
    });

    it('should support options.realpath with literal file paths', () => {
      const symlinksDir = path.resolve(__dirname, 'symlinks');

      const unlink = symlinks({
        src: path.resolve(__dirname, 'fixtures'),
        dest: symlinksDir
      });

      const files = glob.sync(['a.js', 'b.js'], { realpath: true, cwd: symlinksDir });

      assert(files);
      assert(files.length);
      assert(files.every(fp => !/symlinks/.test(fp)));
      assert(files.every(fp => /fixtures/.test(fp)));
      unlink();
    });

    it('should support options.absolute', () => {
      const relative = glob.sync(['*.js', '*.json'], { absolute: false });
      assert(relative);
      assert(relative.length);
      assert(relative.every(fp => !path.isAbsolute(fp)));

      const absolute = glob.sync(['*.js', '*.json'], { absolute: true });
      assert(absolute);
      assert(absolute.length);
      assert(absolute.every(fp => path.isAbsolute(fp)));
    });

    it('should support options.onMatch to listen for match events', () => {
      const files = [];
      const onMatch = ({ path }) => files.push(path);
      glob.sync('*.js', { cwd: path.join(__dirname, 'fixtures'), onMatch });
      assert(files.length >= 1);
    });

    it('should support options.onFiles', () => {
      const files = [];
      const onFiles = dirents => files.push(...dirents);
      glob.sync('*.js', { cwd: path.join(__dirname, 'fixtures'), onFiles });
      assert(files.length >= 1);
    });
  });

  describe('promise:', () => {
    beforeEach(cb => {
      fs.writeFile('a.txt', 'temp', cb);
    });

    afterEach(cb => {
      rimraf('a.txt', cb);
    });

    it('should glob files with `glob.promise`.', async () => {
      const files = await glob(['*.txt']);
      assert.equal(files[0], 'a.txt');
    });
  });
});
