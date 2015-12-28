'use strict';

var path = require('path');
var utils = require('lazy-cache')(require);

/**
 * Lazily required module dependencies
 */

var fn = require;
require = utils;
require('glob');
require('bluebird', 'promise');
require('async-array-reduce', 'reduce');
require('extend-shallow', 'extend');
require('is-valid-glob', 'isValidGlob');
require('resolve-dir', 'resolve');
require = fn;

/**
 * utils
 */

utils.arrayify = function arrayify(val) {
  return Array.isArray(val) ? val : [val];
};

utils.sift = function(patterns, opts) {
  patterns = utils.arrayify(patterns);
  var res = { includes: [], excludes: [] };
  var len = patterns.length, i = -1;

  while (++i < len) {
    var stat = new utils.Stat(patterns[i], opts, i);

    if (opts.relative) {
      stat.pattern = utils.toRelative(stat.pattern, opts);
      delete opts.cwd;
    }

    if (stat.isNegated) {
      res.excludes.push(stat);
    } else {
      res.includes.push(stat);
    }
  }
  res.stat = stat;
  return res;
};

utils.setIgnores = function(options, excludes, inclusiveIndex) {
  var opts = utils.extend({}, options);
  var negations = [];

  var len = excludes.length, i = -1;
  while (++i < len) {
    var exclusion = excludes[i];
    if (exclusion.index > inclusiveIndex) {
      negations.push(exclusion.pattern);
    }
  }
  opts.ignore = utils.arrayify(opts.ignore || []);
  opts.ignore.push.apply(opts.ignore, negations);
  return opts;
};

utils.Stat = function Stat(pattern, opts, i) {
  this.index = i;
  this.isNegated = false;
  this.pattern = pattern;

  if (pattern.charAt(0) === '!') {
    this.isNegated = true;
    this.pattern = pattern.slice(1);
  }
};

utils.cwd = function(opts) {
  if (/^\W/.test(opts.cwd)) {
    return utils.resolve(opts.cwd);
  }
  return opts.cwd;
};

utils.toRelative = function(pattern, opts) {
  var fp = path.resolve(opts.cwd, pattern);
  return path.relative(process.cwd(), fp);
};

/**
 * Expose `utils`
 */

module.exports = utils;
