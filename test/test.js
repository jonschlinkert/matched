/**
 * matched <https://github.com/jonschlinkert/matched>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var expect = require('chai').expect;
var globule = require('globule');
var multimatch = require('multimatch');
var matched = require('../');

var globMatch = function(arr, patterns, options) {
  return globule.match(patterns, arr, options);
};


describe('when an array of additive glob patterns is defined:', function () {
  it('should return an array of matches', function (done) {
    expect(multimatch(['foo', 'bar', 'baz'], ['f*'])).to.eql(['foo']);
    expect(globMatch(['foo', 'bar', 'baz'], ['f*'])).to.eql(['foo']);
    expect(matched(['foo', 'bar', 'baz'], ['f*'])).to.eql(['foo']);

    expect(multimatch(['foo', 'bar', 'baz'], ['f*', 'bar'])).to.eql(['foo', 'bar']);
    expect(globMatch(['foo', 'bar', 'baz'], ['f*', 'bar'])).to.eql(['foo', 'bar']);
    expect(matched(['foo', 'bar', 'baz'], ['f*', 'bar'])).to.eql(['foo', 'bar']);
    done();
  });

  it('should return matches in the order the patterns were defined', function (done) {
    expect(multimatch(['foo', 'bar', 'baz'], ['bar', 'f*'])).to.eql(['bar', 'foo']);
    expect(globMatch(['foo', 'bar', 'baz'], ['bar', 'f*'])).to.eql(['bar', 'foo']);
    expect(matched(['foo', 'bar', 'baz'], ['bar', 'f*'])).to.eql(['bar', 'foo']);

    expect(multimatch(['foo', 'bar', 'baz'], ['f*', '*z'])).to.eql(['foo', 'baz']);
    expect(globMatch(['foo', 'bar', 'baz'], ['f*', '*z'])).to.eql(['foo', 'baz']);
    expect(matched(['foo', 'bar', 'baz'], ['f*', '*z'])).to.eql(['foo', 'baz']);

    expect(multimatch(['foo', 'bar', 'baz'], ['*z', 'f*'])).to.eql(['baz', 'foo']);
    expect(globMatch(['foo', 'bar', 'baz'], ['*z', 'f*'])).to.eql(['baz', 'foo']);
    expect(matched(['foo', 'bar', 'baz'], ['*z', 'f*'])).to.eql(['baz', 'foo']);
    done();
  });
});


describe('when additive string patterns are defined and matches are found:', function () {
  it('should return an array of matches', function (done) {
    expect(multimatch(['foo', 'bar', 'baz'], 'foo')).to.eql(['foo']);
    expect(matched(['foo', 'bar', 'baz'], 'foo')).to.eql(['foo']);
    done();
  });
});

describe('when negation string patterns are defined', function () {
  it('should return an array with negations omitted', function (done) {
    expect(multimatch(['foo', 'bar', 'baz'], '!foo')).to.eql(['bar', 'baz']); // expected?
    expect(globMatch(['foo', 'bar', 'baz'], '!foo')).to.eql([]); // expected?
    expect(matched(['foo', 'bar', 'baz'], '!foo')).to.eql([]); // expected?
    done();
  });
});

describe('when an array of additive string patterns is defined and matches are found:', function () {
  it('should return an array of matches', function (done) {
    expect(multimatch(['foo', 'bar', 'baz'], ['foo', 'bar'])).to.eql(['foo', 'bar']);
    expect(globMatch(['foo', 'bar', 'baz'], ['foo', 'bar'])).to.eql(['foo', 'bar']);
    expect(matched(['foo', 'bar', 'baz'], ['foo', 'bar'])).to.eql(['foo', 'bar']);
    done();
  });

  it('should return an empty array when no matches are found', function (done) {
    expect(multimatch(['foo', 'bar', 'baz'], ['quux'])).to.eql([]);
    expect(globMatch(['foo', 'bar', 'baz'], ['quux'])).to.eql([]);
    expect(matched(['foo', 'bar', 'baz'], ['quux'])).to.eql([]);
    done();
  });
});


describe('when an array of negation glob patterns is defined', function () {
  it('should return an array with negations omitted', function (done) {
    expect(multimatch(['foo', 'bar', 'baz'], ['!*z'])).to.eql(['foo', 'bar']); // expected?
    expect(globMatch(['foo', 'bar', 'baz'], ['!*z'])).to.eql([]); // expected?
    expect(matched(['foo', 'bar', 'baz'], ['!*z'])).to.eql([]); // expected?
    done();
  });

  it('should return an array with negations omitted', function (done) {
    expect(multimatch(['foo', 'bar', 'baz'], ['!*z', '!*a*'])).to.eql(['foo']); // expected?
    expect(globMatch(['foo', 'bar', 'baz'], ['!*z', '!*a*'])).to.eql([]); // expected?
    expect(matched(['foo', 'bar', 'baz'], ['!*z', '!*a*'])).to.eql([]); // expected?
    done();
  });

  it('should return an empty array when no matches are found', function (done) {
    expect(multimatch(['foo', 'bar', 'baz'], ['!*'])).to.eql([]);
    expect(globMatch(['foo', 'bar', 'baz'], ['!*'])).to.eql([]);
    expect(matched(['foo', 'bar', 'baz'], ['!*'])).to.eql([]);
    done();
  });
});


describe('when an array of negation string patterns is defined', function () {
  it('should return an array with negations omitted', function (done) {
    expect(multimatch(['foo', 'bar', 'baz'], ['!foo'])).to.eql(['bar', 'baz']); // expected?
    expect(globMatch(['foo', 'bar', 'baz'], ['!foo'])).to.eql([]); // expected?
    expect(matched(['foo', 'bar', 'baz'], ['!foo'])).to.eql([]); // expected?

    expect(multimatch(['foo', 'bar', 'baz'], ['!foo', '!bar'])).to.eql(['baz']); // expected?
    expect(globMatch(['foo', 'bar', 'baz'], ['!foo', '!bar'])).to.eql([]); // expected?
    expect(matched(['foo', 'bar', 'baz'], ['!foo', '!bar'])).to.eql([]); // expected?
    done();
  });
});



describe('when inclusion and negation patterns are defined', function () {
  it('should return an array of matches, sans negations', function (done) {
    expect(multimatch(['foo', 'bar', 'baz'], ['!*a*'])).to.eql(['foo']); // expected?
    expect(globMatch(['foo', 'bar', 'baz'], ['!*a*'])).to.eql([]); // expected?
    expect(matched(['foo', 'bar', 'baz'], ['!*a*'])).to.eql([]); // expected?
    done();
  });

  it('should override negations and re-include explicitly defined patterns', function (done) {
    expect(multimatch(['foo', 'bar', 'baz'], ['!*a*', '*z'])).to.eql(['foo', 'baz']); // expected?
    expect(globMatch(['foo', 'bar', 'baz'], ['!*a*', '*z'])).to.eql(['baz']); // expected?
    expect(matched(['foo', 'bar', 'baz'], ['!*a*', '*z'])).to.eql(['baz']); // expected?
    done();
  });

  it('patterns should be order insensitive', function (done) {
    expect(multimatch(['foo', 'bar', 'baz'], ['!*a*', '*z'])).to.eql(['foo', 'baz']); // expected?
    expect(globMatch(['foo', 'bar', 'baz'], ['!*a*', '*z'])).to.eql(['baz']); // expected?
    expect(matched(['foo', 'bar', 'baz'], ['!*a*', '*z'])).to.eql(['baz']); // expected?
    expect(multimatch(['foo', 'bar', 'baz'], ['*z', '!*a*'])).to.eql([]); // expected?
    expect(globMatch(['foo', 'bar', 'baz'], ['*z', '!*a*'])).to.eql([]); // expected?
    expect(matched(['foo', 'bar', 'baz'], ['*z', '!*a*'])).to.eql([]); // expected?

    expect(multimatch(['foo', 'foam', 'for', 'forum'], ['!*m', 'f*'])).to.eql(['foo', 'for', 'foam', 'forum']); // expected?
    expect(globMatch(['foo', 'foam', 'for', 'forum'], ['!*m', 'f*'])).to.eql(['foo', 'foam', 'for', 'forum']); // expected?
    expect(matched(['foo', 'foam', 'for', 'forum'], ['!*m', 'f*'])).to.eql(['foo', 'foam', 'for', 'forum']); // expected?
    expect(multimatch(['foo', 'foam', 'for', 'forum'], ['f*', '!*m'])).to.eql(['foo', 'for']);
    expect(globMatch(['foo', 'foam', 'for', 'forum'], ['f*', '!*m'])).to.eql(['foo', 'for']);
    expect(matched(['foo', 'foam', 'for', 'forum'], ['f*', '!*m'])).to.eql(['foo', 'for']);

    expect(multimatch(['foo', 'bar', 'baz'], ['!*{o,r}', 'foo'])).to.eql(['baz', 'foo']); // expected?
    expect(globMatch(['foo', 'bar', 'baz'], ['!*{o,r}', 'foo'])).to.eql(['foo']); // expected?
    expect(matched(['foo', 'bar', 'baz'], ['!*{o,r}', 'foo'])).to.eql(['foo']); // expected?
    expect(multimatch(['foo', 'bar', 'baz'], ['foo', '!*{o,r}'])).to.eql([]);
    expect(globMatch(['foo', 'bar', 'baz'], ['foo', '!*{o,r}'])).to.eql([]);
    expect(matched(['foo', 'bar', 'baz'], ['foo', '!*{o,r}'])).to.eql([]);

    expect(multimatch(['foo', 'bar', 'baz'], ['!foo', 'bar'])).to.eql(['bar', 'baz']);
    expect(globMatch(['foo', 'bar', 'baz'], ['!foo', 'bar'])).to.eql(['bar']);
    expect(matched(['foo', 'bar', 'baz'], ['!foo', 'bar'])).to.eql(['bar']);
    expect(multimatch(['foo', 'bar', 'baz'], ['foo', '!bar'])).to.eql(['foo']);
    expect(globMatch(['foo', 'bar', 'baz'], ['foo', '!bar'])).to.eql(['foo']);
    expect(matched(['foo', 'bar', 'baz'], ['foo', '!bar'])).to.eql(['foo']);

    expect(multimatch(['foo', 'bar', 'baz'], ['bar', '!foo', 'foo'])).to.eql(['bar', 'foo']);
    expect(globMatch(['foo', 'bar', 'baz'], ['bar', '!foo', 'foo'])).to.eql(['bar', 'foo']);
    expect(matched(['foo', 'bar', 'baz'], ['bar', '!foo', 'foo'])).to.eql(['bar', 'foo']);
    expect(multimatch(['foo', 'bar', 'baz'], ['foo', '!foo', 'bar'])).to.eql(['bar']);
    expect(globMatch(['foo', 'bar', 'baz'], ['foo', '!foo', 'bar'])).to.eql(['bar']);
    expect(matched(['foo', 'bar', 'baz'], ['foo', '!foo', 'bar'])).to.eql(['bar']);

    done();
  });

  it('should override negations and re-include explicitly defined patterns', function (done) {
    expect(multimatch(['foo', 'bar', 'baz'], ['!*'])).to.eql([]);
    expect(multimatch(['foo', 'bar', 'baz'], ['!*a*'])).to.eql(['foo']); // expected?
    expect(multimatch(['foo', 'bar', 'baz'], ['bar', '!*a*'])).to.eql([]); // expected?
    expect(multimatch(['foo', 'bar', 'baz'], ['!*a*', 'bar'])).to.eql(['foo', 'bar']); // expected?
    expect(multimatch(['foo', 'bar', 'baz'], ['!*a*', '*'])).to.eql(['foo', 'bar', 'baz']);
    expect(multimatch(['foo', 'bar', 'baz'], ['!*a*', '*z'])).to.eql(['foo', 'baz']); // expected?

    expect(globMatch(['foo', 'bar', 'baz'], ['!*'])).to.eql([]);
    expect(globMatch(['foo', 'bar', 'baz'], ['!*a*'])).to.eql([]);
    expect(globMatch(['foo', 'bar', 'baz'], ['bar', '!*a*'])).to.eql([]);
    expect(globMatch(['foo', 'bar', 'baz'], ['!*a*', 'bar'])).to.eql(['bar']);
    expect(globMatch(['foo', 'bar', 'baz'], ['!*a*', '*'])).to.eql(['foo', 'bar', 'baz']);
    expect(globMatch(['foo', 'bar', 'baz'], ['!*a*', '*z'])).to.eql(['baz']); // expected?

    expect(matched(['foo', 'bar', 'baz'], ['!*'])).to.eql([]);
    expect(matched(['foo', 'bar', 'baz'], ['!*a*'])).to.eql([]);
    expect(matched(['foo', 'bar', 'baz'], ['bar', '!*a*'])).to.eql([]);
    expect(matched(['foo', 'bar', 'baz'], ['!*a*', 'bar'])).to.eql(['bar']);
    expect(matched(['foo', 'bar', 'baz'], ['!*a*', '*'])).to.eql(['foo', 'bar', 'baz']);
    expect(matched(['foo', 'bar', 'baz'], ['!*a*', '*z'])).to.eql(['baz']); // expected?
    done();
  });
});


describe('misc', function () {
  it('misc', function (done) {
    expect(multimatch(['foo', 'bar', 'baz'], ['*', '!foo'])).to.eql(['bar', 'baz']);
    expect(globMatch(['foo', 'bar', 'baz'], ['*', '!foo'])).to.eql(['bar', 'baz']);
    expect(matched(['foo', 'bar', 'baz'], ['*', '!foo'])).to.eql(['bar', 'baz']);

    expect(multimatch(['foo', 'bar', 'baz'], ['*', '!foo', 'bar'])).to.eql(['bar', 'baz']);
    expect(globMatch(['foo', 'bar', 'baz'], ['*', '!foo', 'bar'])).to.eql(['bar', 'baz']);
    expect(matched(['foo', 'bar', 'baz'], ['*', '!foo', 'bar'])).to.eql(['bar', 'baz']);

    expect(multimatch(['foo', 'bar', 'baz'], ['*', '!foo'])).to.eql(['bar', 'baz']);
    expect(globMatch(['foo', 'bar', 'baz'], ['*', '!foo'])).to.eql(['bar', 'baz']);
    expect(matched(['foo', 'bar', 'baz'], ['*', '!foo'])).to.eql(['bar', 'baz']);

    expect(multimatch(['foo', 'bar', 'baz'], ['!foo', '*'])).to.eql(['bar', 'baz', 'foo']); // expected?
    expect(globMatch(['foo', 'bar', 'baz'], ['!foo', '*'])).to.eql(['foo', 'bar', 'baz']); // expected?
    expect(matched(['foo', 'bar', 'baz'], ['!foo', '*'])).to.eql(['foo', 'bar', 'baz']); // expected?

    expect(multimatch(['foo', 'bar', 'baz'], ['*', '!foo', '!bar'])).to.eql(['baz']);
    expect(globMatch(['foo', 'bar', 'baz'], ['*', '!foo', '!bar'])).to.eql(['baz']);
    expect(matched(['foo', 'bar', 'baz'], ['*', '!foo', '!bar'])).to.eql(['baz']);

    expect(multimatch(['foo', 'bar', 'baz'], ['!*{o,r}', '*'])).to.eql(['baz', 'foo', 'bar']); // expected?
    expect(globMatch(['foo', 'bar', 'baz'], ['!*{o,r}', '*'])).to.eql(['foo', 'bar', 'baz']); // expected?
    expect(matched(['foo', 'bar', 'baz'], ['!*{o,r}', '*'])).to.eql(['foo', 'bar', 'baz']); // expected?

    expect(multimatch(['foo', 'bar', 'baz'], ['*', '!*{o,r}'])).to.eql(['baz']);
    expect(globMatch(['foo', 'bar', 'baz'], ['*', '!*{o,r}'])).to.eql(['baz']);
    expect(matched(['foo', 'bar', 'baz'], ['*', '!*{o,r}'])).to.eql(['baz']);

    expect(multimatch(['foo', 'bar', 'baz'], ['foo', '!*{o,r}', '*'])).to.eql(['foo', 'bar', 'baz']); // expected?
    expect(globMatch(['foo', 'bar', 'baz'], ['foo', '!*{o,r}', '*'])).to.eql(['foo', 'bar', 'baz']); // expected?
    expect(matched(['foo', 'bar', 'baz'], ['foo', '!*{o,r}', '*'])).to.eql(['foo', 'bar', 'baz']); // expected?

    expect(multimatch(['foo', 'bar', 'baz'], ['*', '!*{o,r}', 'foo'])).to.eql(['baz', 'foo']); // expected?
    expect(globMatch(['foo', 'bar', 'baz'], ['*', '!*{o,r}', 'foo'])).to.eql(['baz', 'foo']); // expected?
    expect(matched(['foo', 'bar', 'baz'], ['*', '!*{o,r}', 'foo'])).to.eql(['baz', 'foo']); // expected?

    expect(multimatch(['foo', 'bar', 'baz'], ['!*{o,r}', '*', 'foo'])).to.eql(['baz', 'foo', 'bar']); // expected?
    expect(globMatch(['foo', 'bar', 'baz'], ['!*{o,r}', '*', 'foo'])).to.eql(['foo', 'bar', 'baz']); // expected?
    expect(matched(['foo', 'bar', 'baz'], ['!*{o,r}', '*', 'foo'])).to.eql(['foo', 'bar', 'baz']); // expected?

    expect(multimatch(['foo', 'bar', 'baz'], ['foo', '!*{o,r}'])).to.eql([]); // expected?
    expect(globMatch(['foo', 'bar', 'baz'], ['foo', '!*{o,r}'])).to.eql([]); // expected?
    expect(matched(['foo', 'bar', 'baz'], ['foo', '!*{o,r}'])).to.eql([]); // expected?

    expect(multimatch(['foo', 'bar', 'baz'], ['foo', '!*{o,r}', 'foo'])).to.eql(['foo']);
    expect(globMatch(['foo', 'bar', 'baz'], ['foo', '!*{o,r}', 'foo'])).to.eql(['foo']);
    expect(matched(['foo', 'bar', 'baz'], ['foo', '!*{o,r}', 'foo'])).to.eql(['foo']);

    expect(multimatch(['foo', 'bar', 'baz'], ['!*{o,r}', 'foo'])).to.eql(['baz', 'foo']);
    expect(globMatch(['foo', 'bar', 'baz'], ['!*{o,r}', 'foo'])).to.eql(['foo']);
    expect(matched(['foo', 'bar', 'baz'], ['!*{o,r}', 'foo'])).to.eql(['foo']);

    expect(multimatch(['foo', 'bar', 'baz'], ['*', '!*{o,r}'])).to.eql(['baz']);
    expect(globMatch(['foo', 'bar', 'baz'], ['*', '!*{o,r}'])).to.eql(['baz']);
    expect(matched(['foo', 'bar', 'baz'], ['*', '!*{o,r}'])).to.eql(['baz']);

    expect(multimatch(['foo', 'bar', 'baz'], 'foo')).to.eql(['foo']);
    expect(globMatch(['foo', 'bar', 'baz'], 'foo')).to.eql(['foo']);
    expect(matched(['foo', 'bar', 'baz'], 'foo')).to.eql(['foo']);

    expect(multimatch(['foo', 'bar', 'baz'], ['!foo'])).to.eql(['bar', 'baz']); // expected?
    expect(globMatch(['foo', 'bar', 'baz'], ['!foo'])).to.eql([]); // expected?
    expect(matched(['foo', 'bar', 'baz'], ['!foo'])).to.eql([]); // expected?

    expect(multimatch(['foo', 'bar', 'baz'], ['*', '!foo'])).to.eql(['bar', 'baz']);
    expect(globMatch(['foo', 'bar', 'baz'], ['*', '!foo'])).to.eql(['bar', 'baz']);
    expect(matched(['foo', 'bar', 'baz'], ['*', '!foo'])).to.eql(['bar', 'baz']);

    expect(multimatch(['foo', 'bar', 'baz'], ['foo', 'bar'])).to.eql(['foo', 'bar']);
    expect(globMatch(['foo', 'bar', 'baz'], ['foo', 'bar'])).to.eql(['foo', 'bar']);
    expect(matched(['foo', 'bar', 'baz'], ['foo', 'bar'])).to.eql(['foo', 'bar']);

    expect(multimatch(['foo', 'bar', 'baz'], ['foo', '!bar'])).to.eql(['foo']);
    expect(globMatch(['foo', 'bar', 'baz'], ['foo', '!bar'])).to.eql(['foo']);
    expect(matched(['foo', 'bar', 'baz'], ['foo', '!bar'])).to.eql(['foo']);
    expect(multimatch(['foo', 'bar', 'baz'], ['!foo', 'bar'])).to.eql(['bar', 'baz']); // expected?
    expect(globMatch(['foo', 'bar', 'baz'], ['!foo', 'bar'])).to.eql(['bar']); // expected?
    expect(matched(['foo', 'bar', 'baz'], ['!foo', 'bar'])).to.eql(['bar']); // expected?

    expect(multimatch(['foo', 'bar', 'baz'], ['!foo', '!bar'])).to.eql(['baz']);
    expect(globMatch(['foo', 'bar', 'baz'], ['!foo', '!bar'])).to.eql([]);
    expect(matched(['foo', 'bar', 'baz'], ['!foo', '!bar'])).to.eql([]);
    expect(multimatch(['foo', 'one', 'two', 'four', 'do', 'once', 'only'], ['once', '!o*', 'once'])).to.eql(['once']);
    expect(globMatch(['foo', 'one', 'two', 'four', 'do', 'once', 'only'], ['once', '!o*', 'once'])).to.eql(['once']);
    expect(matched(['foo', 'one', 'two', 'four', 'do', 'once', 'only'], ['once', '!o*', 'once'])).to.eql(['once']);
    expect(multimatch(['foo', 'one', 'two', 'four', 'do', 'once', 'only'], ['*', '!o*', 'once'])).to.eql(['foo', 'two', 'four', 'do', 'once']);
    expect(globMatch(['foo', 'one', 'two', 'four', 'do', 'once', 'only'], ['*', '!o*', 'once'])).to.eql(['foo', 'two', 'four', 'do', 'once']);
    expect(matched(['foo', 'one', 'two', 'four', 'do', 'once', 'only'], ['*', '!o*', 'once'])).to.eql(['foo', 'two', 'four', 'do', 'once']);
    done();
  });
});


/**
 * Tests from globule
 * @return  {[type]}  [description]
 */

describe('globule', function () {
  it('Should return empty set if a required argument is missing or an empty set.', function (done) {
    expect(multimatch('', 'foo.js')).to.eql([]);
    expect(globMatch('', 'foo.js')).to.eql([]);
    expect(matched('', 'foo.js')).to.eql([]);
    expect(multimatch('*.js', '')).to.eql([]);
    expect(globMatch('*.js', '')).to.eql([]);
    expect(matched('*.js', '')).to.eql([]);
    expect(multimatch([], 'foo.js')).to.eql([]);
    expect(globMatch([], 'foo.js')).to.eql([]);
    expect(matched([], 'foo.js')).to.eql([]);
    expect(multimatch('*.js', [])).to.eql([]);
    expect(globMatch('*.js', [])).to.eql([]);
    expect(matched('*.js', [])).to.eql([]);
    expect(multimatch('', ['foo.js'])).to.eql([]);
    expect(globMatch('', ['foo.js'])).to.eql([]);
    expect(matched('', ['foo.js'])).to.eql([]);
    expect(multimatch(['*.js'], '')).to.eql([]);
    expect(globMatch(['*.js'], '')).to.eql([]);
    expect(matched(['*.js'], '')).to.eql([]);
    done();
  });

  it('basic matching should match correctly', function (done) {
    expect(multimatch('foo.js', '*.js')).to.eql(['foo.js']);
    expect(globMatch('foo.js', '*.js')).to.eql(['foo.js']);
    expect(matched('foo.js', '*.js')).to.eql(['foo.js']);
    expect(multimatch(['foo.js'], '*.js')).to.eql(['foo.js']);
    expect(globMatch(['foo.js'], '*.js')).to.eql(['foo.js']);
    expect(matched(['foo.js'], '*.js')).to.eql(['foo.js']);
    expect(multimatch(['foo.js', 'bar.css'], '*.js')).to.eql(['foo.js']);
    expect(globMatch(['foo.js', 'bar.css'], '*.js')).to.eql(['foo.js']);
    expect(matched(['foo.js', 'bar.css'], '*.js')).to.eql(['foo.js']);
    expect(multimatch('foo.js', ['*.js', '*.css'])).to.eql(['foo.js']);
    expect(globMatch('foo.js', ['*.js', '*.css'])).to.eql(['foo.js']);
    expect(matched('foo.js', ['*.js', '*.css'])).to.eql(['foo.js']);
    expect(multimatch(['foo.js'], ['*.js', '*.css'])).to.eql(['foo.js']);
    expect(globMatch(['foo.js'], ['*.js', '*.css'])).to.eql(['foo.js']);
    expect(matched(['foo.js'], ['*.js', '*.css'])).to.eql(['foo.js']);
    expect(multimatch(['foo.js', 'bar.css'], ['*.js', '*.css'])).to.eql(['foo.js', 'bar.css']);
    expect(globMatch(['foo.js', 'bar.css'], ['*.js', '*.css'])).to.eql(['foo.js', 'bar.css']);
    expect(matched(['foo.js', 'bar.css'], ['*.js', '*.css'])).to.eql(['foo.js', 'bar.css']);
    done();
  });

  describe('no matches:', function () {
    it('should fail to match', function (done) {
      expect(multimatch('foo.css', '*.js')).to.eql([]);
      expect(globMatch('foo.css', '*.js')).to.eql([]);
      expect(matched('foo.css', '*.js')).to.eql([]);
      expect(multimatch(['foo.css', 'bar.css'], '*.js')).to.eql([]);
      expect(globMatch(['foo.css', 'bar.css'], '*.js')).to.eql([]);
      expect(matched(['foo.css', 'bar.css'], '*.js')).to.eql([]);
      done();
    });
  });

  describe('unique:', function () {
    it('should return a uniqued set', function (done) {
      expect(multimatch(['foo.js', 'foo.js'], '*.js')).to.eql(['foo.js']);
      expect(globMatch(['foo.js', 'foo.js'], '*.js')).to.eql(['foo.js']);
      expect(matched(['foo.js', 'foo.js'], '*.js')).to.eql(['foo.js']);
      expect(multimatch(['foo.js', 'foo.js'], ['*.js', '*.*'])).to.eql(['foo.js']);
      expect(globMatch(['foo.js', 'foo.js'], ['*.js', '*.*'])).to.eql(['foo.js']);
      expect(matched(['foo.js', 'foo.js'], ['*.js', '*.*'])).to.eql(['foo.js']);
      done();
    });
  });

  describe('flatten:', function () {
    it('should process nested pattern / filepaths arrays correctly', function (done) {
    // expect(multimatch([['foo.js', ['bar.css']]], [['*.js', '*.css'], ['*.*', '*.js']])).to.eql(['foo.js', 'bar.css']); // fails
    expect(globMatch([['foo.js', ['bar.css']]], [['*.js', '*.css'], ['*.*', '*.js']])).to.eql(['foo.js', 'bar.css']);
    expect(matched([['foo.js', ['bar.css']]], [['*.js', '*.css'], ['*.*', '*.js']])).to.eql(['foo.js', 'bar.css']);
      done();
    });
  });

  describe('exclusion:', function () {
    it('solitary exclusion should match nothing', function (done) {
      expect(multimatch(['foo.js', 'bar.js'], ['!*.js'])).to.eql([]);
      expect(globMatch(['foo.js', 'bar.js'], ['!*.js'])).to.eql([]);
      expect(matched(['foo.js', 'bar.js'], ['!*.js'])).to.eql([]);
      done();
    });
    it('exclusion should cancel match', function (done) {
      expect(multimatch(['foo.js', 'bar.js'], ['*.js', '!*.js'])).to.eql([]);
      expect(globMatch(['foo.js', 'bar.js'], ['*.js', '!*.js'])).to.eql([]);
      expect(matched(['foo.js', 'bar.js'], ['*.js', '!*.js'])).to.eql([]);
      done();
    });
    it('partial exclusion should partially cancel match', function (done) {
      expect(multimatch(['foo.js', 'bar.js', 'baz.js'], ['*.js', '!f*.js'])).to.eql(['bar.js', 'baz.js']);
      expect(globMatch(['foo.js', 'bar.js', 'baz.js'], ['*.js', '!f*.js'])).to.eql(['bar.js', 'baz.js']);
      expect(matched(['foo.js', 'bar.js', 'baz.js'], ['*.js', '!f*.js'])).to.eql(['bar.js', 'baz.js']);
      done();
    });
    it('inclusion / exclusion order matters', function (done) {
      expect(multimatch(['foo.js', 'bar.js', 'baz.js'], ['*.js', '!*.js', 'b*.js'])).to.eql(['bar.js', 'baz.js']);
      expect(globMatch(['foo.js', 'bar.js', 'baz.js'], ['*.js', '!*.js', 'b*.js'])).to.eql(['bar.js', 'baz.js']);
      expect(matched(['foo.js', 'bar.js', 'baz.js'], ['*.js', '!*.js', 'b*.js'])).to.eql(['bar.js', 'baz.js']);
      done();
    });
    it('inclusion / exclusion order matters', function (done) {
      expect(multimatch(['foo.js', 'bar.js', 'baz.js'], ['*.js', '!f*.js', '*.js'])).to.eql(['bar.js', 'baz.js', 'foo.js']);
      expect(globMatch(['foo.js', 'bar.js', 'baz.js'], ['*.js', '!f*.js', '*.js'])).to.eql(['bar.js', 'baz.js', 'foo.js']);
      expect(matched(['foo.js', 'bar.js', 'baz.js'], ['*.js', '!f*.js', '*.js'])).to.eql(['bar.js', 'baz.js', 'foo.js']);
      done();
    });
  });

  describe('options.matchBase:', function () {
    it('should matchBase (minimatch) when specified.', function (done) {
      expect(multimatch(['foo.js', 'bar', 'baz/xyz.js'], '*.js', {matchBase: true})).to.eql(['foo.js', 'baz/xyz.js']);
      expect(globMatch(['foo.js', 'bar', 'baz/xyz.js'], '*.js', {matchBase: true})).to.eql(['foo.js', 'baz/xyz.js']);
      expect(matched(['foo.js', 'bar', 'baz/xyz.js'], '*.js', {matchBase: true})).to.eql(['foo.js', 'baz/xyz.js']);
      done();
    });

    it('should not matchBase (minimatch) by default.', function (done) {
      expect(multimatch(['foo.js', 'bar', 'baz/xyz.js'], '*.js')).to.eql(['foo.js']);
      expect(globMatch(['foo.js', 'bar', 'baz/xyz.js'], '*.js')).to.eql(['foo.js']);
      expect(matched(['foo.js', 'bar', 'baz/xyz.js'], '*.js')).to.eql(['foo.js']);
      done();
    });
  });
});
