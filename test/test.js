/*!
 * matched <https://github.com/jonschlinkert/matched>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var matched = require('../');

// True if the filepath actually exist.
var exists = function() {
  var filepath = path.join.apply(path, arguments);
  return fs.existsSync(filepath);
};

// log the files found
var log = function(arr) {
  console.log('    Found', arr.length, 'files.');
};

describe('when a cwd is used:', function () {
  it('should only return file paths from the cwd.', function () {
    var actual = matched(['{,*/}/*.*'], {cwd: 'test'});
    log(actual);
    actual.forEach(function(filepath) {
      expect(exists(filepath)).to.equal(true);
    })
  });

  it('should only return file paths from the cwd.', function () {
    var actual = matched('*.js', {cwd: 'test'});
    log(actual);
    actual.forEach(function(filepath) {
      expect(exists(filepath)).to.equal(true);
    })
  });

  it('should only return file paths from the cwd.', function () {
    var actual = matched('**/*.js', {cwd: 'test/a'});
    log(actual);
    actual.forEach(function(filepath) {
      expect(exists(filepath)).to.equal(true);
    })
  });

  it('should return correct file paths.', function () {
    var actual = matched(['{,*/}/*.md', '**/*.md'], {cwd: 'test'});
    log(actual);

    actual.forEach(function(filepath) {
      expect(exists(filepath)).to.equal(true);
    })
  });
});

describe('when glob patterns are passed:', function () {
  it('should return correct file paths.', function () {
    var actual = matched(['{,*/}/*.md', '**/*.md']);
    log(actual);
    actual.forEach(function(filepath) {
      expect(exists(filepath)).to.equal(true);
    })
  });

  it('should return correct file paths.', function () {
    var actual = matched(['**/*.{js,md}', '**/*.md']);
    log(actual);
    actual.forEach(function(filepath) {
      expect(exists(filepath)).to.equal(true);
    })
  });

  it('should return correct file paths.', function () {
    var actual = matched(['**/*']);
    log(actual);
    actual.forEach(function(filepath) {
      expect(exists(filepath)).to.equal(true);
    })
  });

  it('should return correct file paths.', function () {
    var actual = matched('*.js');
    log(actual);
    actual.forEach(function(filepath) {
      expect(exists(filepath)).to.equal(true);
    })
  });

  it('should return correct file paths.', function () {
    var actual = matched(['*.js', '**/*.js']);
    log(actual);
    actual.forEach(function(filepath) {
      expect(exists(filepath)).to.equal(true);
    })
  });

  it('should return correct file paths.', function () {
    var actual = matched('**/*.js');
    log(actual);
    actual.forEach(function(filepath) {
      expect(exists(filepath)).to.equal(true);
    })
  });
});

