'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const isGlob = require('is-glob');
const union = (...args) => [...new Set([].concat.apply([], args).filter(Boolean))];

/**
 * Expand tilde
 */

exports.expand = str => str.replace(/^~/, os.homedir());

/**
 * Create an object with information about the given glob pattern.
 * @param {String} `pattern` GlobStat pattern
 * @param {Number} `idx` Index of the glob in the given array of patterns
 */

const globStat = (pattern, index) => {
  let details = { index, pattern, isNegated: false, isGlob: isGlob(pattern) };
  if (pattern.charAt(0) === '!' && pattern.charAt(1) !== '(') {
    details.isNegated = true;
    details.pattern = pattern.slice(1);
  }
  return details;
};

/**
 * Sift glob patterns into inclusive and exclusive patterns.
 *
 * @param {String|Array} `patterns`
 * @param {Object} opts
 * @return {Object}
 */

exports.sift = (patterns, options = {}) => {
  patterns = [].concat(patterns || []);
  let res = { includes: [], excludes: [], globs: 0 };
  let n = 0;

  for (let pattern of patterns) {
    if (typeof pattern !== 'string') return null;
    let stat = globStat(pattern, n++);
    if (stat.isGlob) res.globs++;

    if (options.relative) {
      stat.pattern = exports.toRelative(stat.pattern, options);
      delete options.cwd;
    }

    if (stat.isNegated) {
      res.excludes.push(stat);
    } else {
      res.includes.push(stat);
    }
  }
  return res;
};

/**
 * Set the index of ignore patterns based on their position
 * in an array of globs.
 *
 * @param {Object} `options`
 * @param {Array} `excludes`
 * @param {Number} `inclusiveIndex`
 */

exports.setIgnores = (options, excludes, inclusiveIndex) => {
  let opts = Object.assign({}, options);
  let negations = [];

  for (let exclusive of excludes) {
    if (exclusive.index > inclusiveIndex) {
      negations.push(exclusive.pattern);
    }
  }

  opts.ignore = union([], opts.ignore, negations);
  return opts;
};

/**
 * Make a glob pattern relative.
 *
 * @param {String} `pattern`
 * @param {Object} `opts`
 * @return {String}
 */

exports.toRelative = (pattern, opts) => {
  return path.relative(process.cwd(), path.resolve(exports.expand(opts.cwd), pattern));
};

/**
 * Get paths from non-glob patterns
 *
 * @param {Array} `paths`
 * @param {Object} `opts`
 * @return {Array}
 */

exports.getPaths = (paths, options = {}) => {
  let resolve = fp => path.resolve(exports.expand(options.cwd), fp);
  paths = paths.filter(fp => fs.existsSync(resolve(fp)));
  if (options.realpath) {
    return paths.map(resolve);
  }
  return paths;
};
