'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const picomatch = require('picomatch');
const union = (...args) => [...new Set([].concat.apply([], args).filter(Boolean))];

/**
 * Expand tilde
 */

exports.expand = str => str.replace(/^~/, os.homedir());

/**
 * Sift glob patterns into inclusive and exclusive patterns.
 *
 * @param {String|Array} `patterns`
 * @param {Object} opts
 * @return {Object}
 */

exports.sift = (patterns, options = {}) => {
  let results = { includes: [], excludes: [], globs: 0 };
  let index = 0;

  for (let pattern of [].concat(patterns || [])) {
    if (typeof pattern !== 'string') return null;
    let res = picomatch.scan(pattern);
    res.pattern = path.posix.join(res.base, res.glob);
    res.index = index++;

    if (res.isGlob) results.globs++;
    if (options.relative) {
      res.pattern = exports.toRelative(res.pattern, options);
      delete options.cwd;
    }

    if (res.negated) {
      results.excludes.push(res);
    } else {
      results.includes.push(res);
    }
  }
  return results;
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
