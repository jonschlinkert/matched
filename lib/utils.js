'use strict';

var path = require('path');
var utils = require('lazy-cache')(require);
var Stat = require('./stat');

/**
 * Lazily required module dependencies
 */

var fn = require;
require = utils;
require('glob');
require('async-array-reduce', 'reduce');
require('extend-shallow', 'extend');
require('is-valid-glob', 'isValidGlob');
require('resolve-dir', 'resolve');
require('through2', 'through');
require = fn;

/**
 * utils
 */

utils.arrayify = function(val) {
  return Array.isArray(val) ? val : [val];
};

utils.invalidGlob = function(arr) {
  return utils.arrayify(arr).filter(function (pattern) {
    return !utils.isValidGlob(pattern);
  });
};

utils.sift = function(patterns, opts) {
  patterns = utils.arrayify(patterns);
  var res = { includes: [], excludes: [] };
  var len = patterns.length, i = -1;

  while (++i < len) {
    var pattern = patterns[i];
    var stat = new Stat(pattern, opts, i);
    if (opts && opts.relative) {
      stat.pattern = utils.toRelative(stat.pattern, opts);
      opts.cwd = '';
    }

    if (stat.isNegated) {
      res.excludes.push(stat);
    } else {
      res.includes.push(stat);
    }
  }
  return res;
};

utils.setIgnores = function setIgnores(options, excludes, includeIndex) {
  var opts = utils.extend({}, options);
  var negations = [];

  var len = excludes.length, i = -1;
  while (++i < len) {
    var exclusion = excludes[i];
    if (exclusion.index > includeIndex) {
      negations.push(exclusion.pattern);
    }
  }
  opts.ignore = utils.arrayify(opts.ignore || []);
  opts.ignore.push.apply(opts.ignore, negations);
  return opts;
};


var common = ['node_modules', 'vendor', 'tmp', 'temp', '.git'];
utils.commonIgnores = function(pattern, opts) {
  common.forEach(function (str) {
    var re = new RegExp(str);
    if (!re.test(pattern)) {
      opts.ignore.push('**/' + str + '/**');
    }
  });
};

utils.cwd = function(opts) {
  opts = opts || {};
  var dir = utils.resolve(opts.cwd || '');
  return path.resolve(dir);
};

utils.toRelative = function(pattern, opts) {
  var fp = path.resolve(opts.cwd, pattern);
  return path.relative(process.cwd(), fp);
};

/**
 * Expose `utils`
 */

module.exports = utils;
