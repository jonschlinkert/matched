var assert = require('assert');
var through = require('through2');
var should = require('should');
var path = require('path');
var glob = require('..');

var base = __dirname + '/fixtures/stream';

describe('glob.stream', function () {
  it('should return a folder name stream from a glob', function(done) {
    var stream = glob.stream(base + '/whatsgoingon', {
      cwd: __dirname
    });
    should.exist(stream);
    stream.on('error', function (err) {
      throw err;
    });
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.base);
      should.exist(file.cwd);
      String(file.cwd).should.equal(__dirname);
      String(file.base).should.equal(base + path.sep);
      String(path.join(file.path, '')).should.equal(base + '/whatsgoingon');
      done();
    });
  });

  it('should return a file name stream from a glob', function(done) {
    var stream = glob.stream(base + '/*.coffee', {
      cwd: __dirname
    });
    should.exist(stream);
    stream.on('error', function (err) {
      throw err;
    });
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.base);
      should.exist(file.cwd);
      String(file.cwd).should.equal(__dirname);
      String(file.base).should.equal(base + path.sep);
      String(path.join(file.path, '')).should.equal(base + '/test.coffee');
      done();
    });
  });

  it('should return a file name stream from a glob and respect state', function(done) {
    var stream = glob.stream(base + '/stuff/*.dmc', {
      cwd: __dirname
    });
    var wrapper = stream.pipe(through.obj(function (data, enc, cb) {

      this.pause();
      setTimeout(function () {
        this.push(data);
        cb();
        this.resume();
      }.bind(this), 500);

    }));

    var count = 0;

    should.exist(stream);
    stream.on('error', function (err) {
      throw err;
    });
    wrapper.on('data', function (file) {
      count++;
    });
    wrapper.on('end', function () {
      count.should.equal(2);
      done();
    });
  });

  it('should return a correctly ordered file name stream for two globs and specified base', function(done) {
    var baseDir = base + '/';

    var globArray = [
      './whatsgoingon/hey/isaidhey/whatsgoingon/test.txt',
      './test.coffee',
      './whatsgoingon/test.js'
    ];
    var stream = glob.stream(globArray, {
      cwd: baseDir,
      base: baseDir
    });

    var files = [];
    stream.on('error', done);
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.base);
      file.base.should.equal(baseDir);
    });
    stream.on('end', function () {
      done();
    });
  });

  it('should return a correctly ordered file name stream for two globs and cwdbase', function(done) {
    var baseDir = base + '';

    var globArray = [
      './whatsgoingon/hey/isaidhey/whatsgoingon/test.txt',
      './test.coffee',
      './whatsgoingon/test.js'
    ];
    var stream = glob.stream(globArray, {
      cwd: baseDir,
      cwdbase: true
    });

    var files = [];
    stream.on('error', done);
    stream.on('data', function (file) {
      files.push(file.base);
      should.exist(file);
      should.exist(file.base);
      file.base.should.equal(baseDir);
    });
    stream.on('end', function () {
      done();
    });
  });

  it('should return a file name stream that does not duplicate', function(done) {
    var stream = glob.stream([base + '/test.coffee', base + '/test.coffee'], {
      cwd: __dirname
    });
    should.exist(stream);
    stream.on('error', function (err) {
      throw err;
    });
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.base);
      should.exist(file.cwd);
      String(file.cwd).should.equal(__dirname);
      String(file.base).should.equal(base + path.sep);
      String(file.path).should.equal(base + '/test.coffee');
      done();
    });
  });

  it('should return a file name stream that does not duplicate when piped twice', function(done) {
    var stream = glob.stream(base + '/test.coffee', {
      cwd: __dirname
    });
    var stream2 = glob.stream(base + '/test.coffee', {
      cwd: __dirname
    });
    stream2.pipe(stream);

    should.exist(stream);
    stream.on('error', function (err) {
      throw err;
    });
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.base);
      should.exist(file.cwd);
      String(file.cwd).should.equal(__dirname);
      String(file.base).should.equal(base + path.sep);
      String(file.path).should.equal(base + '/test.coffee');
      done();
    });
  });

  it('should return a file name stream from a direct path', function(done) {
    var stream = glob.stream(base + '/test.coffee', {
      cwd: __dirname
    });
    assert(stream);
    stream.on('error', function (err) {
      done(err);
    });
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.base);
      should.exist(file.cwd);
      String(file.cwd).should.equal(__dirname);
      String(file.base).should.equal(base + path.sep);
      String(file.path).should.equal(base + '/test.coffee');
      done();
    });
  });

  it('should not return a file name stream with dotfiles without dot option', function(done) {
    var stream = glob.stream(base + '/*swag', {
      cwd: __dirname
    });
    should.exist(stream);
    stream.on('error', function (err) {
      throw err;
    });
    stream.once('data', function (file) {
      throw new Error('It matched!');
    });
    stream.once('end', done);
  });

  it('should return a file name stream with dotfiles with dot option', function(done) {
    var stream = glob.stream(base + '/*swag', {
      cwd: __dirname,
      dot: true
    });
    should.exist(stream);
    stream.on('error', function (err) {
      throw err;
    });
    stream.once('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.base);
      should.exist(file.cwd);
      String(file.cwd).should.equal(__dirname);
      String(file.base).should.equal(base + path.sep);
      String(file.path).should.equal(base + '/.swag');
      done();
    });
  });

  it('should return a file name stream with dotfiles negated', function(done) {
    var stream = glob.stream([base + '/*swag', '!**/.*'], {
      cwd: __dirname,
      dot: true
    });
    should.exist(stream);
    stream.on('error', function (err) {
      done(err);  
    });
    stream.once('data', function (file) {
      done(new Error('should not match'));
    });
    stream.once('end', done);
  });

  it('should return a file name stream from a direct path and pause/buffer items', function(done) {
    var stream = glob.stream(base + '/test.coffee', {
      cwd: __dirname
    });
    should.exist(stream);
    stream.on('error', function (err) {
      throw err;
    });
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.base);
      should.exist(file.cwd);
      String(file.cwd).should.equal(__dirname);
      String(file.base).should.equal(base + path.sep);
      String(file.path).should.equal(base + '/test.coffee');
      done();
    });
    stream.pause();
    setTimeout(function () {
      stream.resume();
    }, 1000);
  });

  it('should not fuck up direct paths with no cwd', function(done) {
    var stream = glob.stream(base + '/test.coffee');
    should.exist(stream);
    stream.on('error', function (err) {
      throw err;
    });
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.base);
      should.exist(file.cwd);
      String(file.cwd).should.equal(process.cwd());
      String(file.base).should.equal(base + '/');
      String(path.join(file.path, '')).should.equal(base + '/test.coffee');
      done();
    });
  });

  it('should return a correctly ordered file name stream for two globs', function(done) {
    var globArray = [
      base + '/whatsgoingon/hey/isaidhey/whatsgoingon/test.txt',
      base + '/test.coffee',
      base + '/whatsgoingon/test.js'
    ];
    var stream = glob.stream(globArray, {
      cwd: __dirname
    });

    var files = [];
    stream.on('error', done);
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      files.push(file);
    });
    stream.on('end', function () {
      files.length.should.equal(3);
      files[0].path.should.equal(globArray[0]);
      files[1].path.should.equal(globArray[1]);
      files[2].path.should.equal(globArray[2]);
      done();
    });
  });

  it('should return a correctly ordered file name stream for two globs and custom base', function(done) {
    var baseDir = base + '';

    var globArray = [
      './whatsgoingon/hey/isaidhey/whatsgoingon/test.txt',
      './test.coffee',
      './whatsgoingon/test.js'
    ];
    var stream = glob.stream(globArray, {
      cwd: baseDir,
      cwdbase: true
    });

    var files = [];
    stream.on('error', done);
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.base);
      file.base.should.equal(baseDir);
    });
    stream.on('end', function () {
      done();
    });
  });

  it('should return a input stream for multiple globs, with negation (globbing)', function(done) {
    var expectedPath = base + '/stuff/run.dmc';
    var globArray = [
      base + '/stuff/*.dmc',
      '!' + base + '/stuff/test.dmc',
    ];
    var stream = glob.stream(globArray);

    var files = [];
    stream.on('error', done);
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      files.push(file);
    });
    stream.on('end', function () {
      files.length.should.equal(1);
      files[0].path.should.equal(expectedPath);
      done();
    });
  });

  it('should return a input stream for multiple globs, with negation (direct)', function(done) {
    var expectedPath = base + '/stuff/run.dmc';
    var globArray = [
      base + '/stuff/run.dmc',
      '!' + base + '/stuff/test.dmc',
    ];
    var stream = glob.stream(globArray);

    var files = [];
    stream.on('error', done);
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      files.push(file);
    });
    stream.on('end', function () {
      files.length.should.equal(1);
      files[0].path.should.equal(expectedPath);
      done();
    });
  });

  it('should return a input stream that can be piped to other input streams and remove duplicates', function(done) {
    var stream = glob.stream(base + '/stuff/*.dmc');
    var stream2 = glob.stream(base + '/stuff/*.dmc');

    stream2.pipe(stream);

    var files = [];
    stream.on('error', done);
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      files.push(file);
    });
    stream.on('end', function () {
      files.length.should.equal(2);
      done();
    });
  });

  it('should return a file name stream with negation from a glob', function(done) {
    var stream = glob.stream([base + '/**/*.js', '!./**/test.js'], {
      cwd: __dirname
    });
    should.exist(stream);
    stream.on('error', function (err) {
      throw err;
    });
    stream.on('data', function (file) {
      throw new Error('file ' + file.path + ' should have been negated');
    });
    stream.on('end', function () {
      done();
    });
  });

  it('should return a file name stream from two globs and a negative', function(done) {
    var stream = glob.stream([base + '/*.coffee', base + '/whatsgoingon/*.coffee'], {
      cwd: __dirname
    });
    should.exist(stream);
    stream.on('error', function (err) {
      throw err;
    });
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.base);
      should.exist(file.cwd);
      String(file.cwd).should.equal(__dirname);
      String(file.base).should.equal(base + path.sep);
      String(path.join(file.path, '')).should.equal(base + '/test.coffee');
      done();
    });
  });

  it('should respect the globs array order', function(done) {
    var stream = glob.stream([base + '/stuff/*', 'base + !/stuff/*.dmc', base + '/stuff/run.dmc'], {
      cwd: __dirname
    });
    should.exist(stream);
    stream.on('error', function (err) {
      throw err;
    });
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.base);
      should.exist(file.cwd);
      assert(file.cwd === __dirname);
      assert(file.base === path.join(__dirname, 'fixtures/stream/stuff/'));
      path.join(file.path, '').should.equal(base + '/stuff/run.dmc');
      done();
    });
  });

  it('should ignore leading negative globs', function(done) {
    var stream = glob.stream(['base + !/stuff/*.dmc', base + '/stuff/run.dmc'], {
      cwd: __dirname
    });
    should.exist(stream);
    stream.on('error', function (err) {
      throw err;
    });
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.base);
      should.exist(file.cwd);
      String(file.cwd).should.equal(__dirname);
      String(file.base).should.equal(path.join(__dirname, 'fixtures/stream/stuff' + path.sep));
      String(path.join(file.path, '')).should.equal(base + '/stuff/run.dmc');
      done();
    });
  });

  it('should throw on invalid glob argument', function () {
    glob.stream.bind(glob.stream, 42, {
      cwd: __dirname
    }).should.throw('invalid glob pattern: 42');
    glob.stream.bind(glob.stream, ['.', 42], {
      cwd: __dirname
    }).should.throw('invalid glob pattern: 42');
  });

  it.skip('should emit error on singular glob when file not found', function(done) {
    var stream = glob.stream('notfound');
    should.exist(stream);
    stream.on('error', function (err) {
      err.should.match(/File not found with singular glob/);
      done();
    });
  });

  it.skip('should emit error when a glob in multiple globs not found', function(done) {
    var stream = glob.stream(['notfound', base + '/whatsgoingon'], {
      cwd: __dirname
    });
    should.exist(stream);
    stream.on('error', function (err) {
      err.should.match(/File not found with singular glob/);
      done();
    });
  });

  it.only('should resolve relative paths when root option is given', function(done) {
    var stream = glob.stream(base + '/test.coffee', {
      cwd: __dirname,
      root: __dirname + '/fixtures'
    });
    should.exist(stream);
    stream.on('error', function (err) {
      throw err;
    });
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.base);
      should.exist(file.cwd);
      String(file.cwd).should.equal(__dirname);
      String(file.base).should.equal(base + path.sep);
      String(path.join(file.path, '')).should.equal(base + '/test.coffee');
      done();
    });
  });

  it('should resolve absolute paths when root option is given', function(done) {
    var stream = glob.stream('/test.coffee', {
      cwd: __dirname,
      root: __dirname + '/fixtures'
    });
    should.exist(stream);
    stream.on('error', function (err) {
      throw err;
    });
    stream.on('data', function (file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.base);
      should.exist(file.cwd);
      String(file.cwd).should.equal(__dirname);
      String(file.base).should.equal(base + path.sep);
      String(path.join(file.path, '')).should.equal(base + '/test.coffee');
      done();
    });
  });

  it('should not emit error on glob containing {} when not found', function(done) {
    var stream = glob.stream('notfound{a,b}');
    should.exist(stream);
    stream.on('error', function () {
      throw new Error('Error was emitted');
    });

    stream.resume();
    stream.once('end', done);
  });

  it('should not emit error on singular glob when allowEmpty is true', function(done) {
    var stream = glob.stream('notfound', {
      allowEmpty: true
    });
    should.exist(stream);
    stream.on('error', function () {
      throw new Error('Error was emitted');
    });

    stream.resume();
    stream.once('end', done);
  });

  it('should pass options to through', function(done) {
    var stream = glob.stream([base + '/stuff/run.dmc'], {
      cwd: __dirname,
      objectMode: false
    });
    should.exist(stream);
    stream.on('error', function (err) {
      err.should.match(/Invalid non-string\/buffer chunk/);
      done();
    });
  });
});
