'use strict';

const fs = require('fs');
const path = require('path');
const union = require('arr-union');
const resolve = require('resolve-dir');

/**
 * Create a new `GlobStat` object with information about a
 * single glob pattern.
 *
 * @param {String} `pattern` GlobStat pattern
 * @param {Number} `idx` Index of the glob in the given array of patterns
 */

class GlobStat {
  constructor(pattern, idx) {
    this.index = idx;
    this.isNegated = false;
    this.pattern = pattern;

    if (pattern.charAt(0) === '!' && pattern.charAt(1) !== '(') {
      this.isNegated = true;
      this.pattern = pattern.slice(1);
    }
  }
}

/**
 * Resolve the `cwd` to use for a glob operation.
 *
 * @param {Object} `options`
 * @return {String}
 */

exports.cwd = options => path.resolve(resolve(options.cwd));

/**
 * exports
 */

exports.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Returns a unique-ified array of all cached filepaths from
 * the `glob.cache` property exposed by [node-glob][].
 *
 * The most time-instensive part of globbing is hitting the
 * file system, so node-glob caches file paths internally to
 * allow multiple matching operations to be performed on the
 * same array - without hitting the file system again. Here, we're
 * simply pushing those cache objects into an array to expose
 * them to the user.
 *
 * @param {Array} `arr` Array of `glob.cache` objects.
 * @return {Array}
 */

exports.createCache = function(arr) {
  const join = cwd => fp => path.join(cwd, fp);

  return arr.reduce(function(acc, cache) {
    for (const key of Object.keys(cache)) {
      const val = cache[key];

      if (Array.isArray(val)) {
        union(acc, val.map(join(key)));
      } else {
        union(acc, [key]);
      }
    }
    return acc;
  }, []);
};

/**
 * Sift glob patterns into inclusive and exclusive patterns.
 *
 * @param {String|Array} `patterns`
 * @param {Object} opts
 * @return {Object}
 */

exports.sift = function(patterns, opts) {
  patterns = exports.arrayify(patterns);
  const res = { includes: [], excludes: [] };
  let n = 0;

  for (const pattern of patterns) {
    const stat = new GlobStat(pattern, n++);

    if (opts.relative) {
      stat.pattern = exports.toRelative(stat.pattern, opts);
      delete opts.cwd;
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

exports.setIgnores = function(options, excludes, inclusiveIndex) {
  const opts = Object.assign({}, options);
  const negations = [];

  for (const exclusive of excludes) {
    if (exclusive.index > inclusiveIndex) {
      negations.push(exclusive.pattern);
    }
  }

  opts.ignore = exports.arrayify(opts.ignore || []);
  opts.ignore.push.apply(opts.ignore, negations);
  return opts;
};

/**
 * Make a glob pattern relative.
 *
 * @param {String} `pattern`
 * @param {Object} `opts`
 * @return {String}
 */

exports.toRelative = function(pattern, opts) {
  return path.relative(process.cwd(), path.resolve(opts.cwd, pattern));
};

/**
 * Get paths from non-glob patterns
 *
 * @param {Array} `paths`
 * @param {Object} `opts`
 * @return {Array}
 */

exports.getPaths = function(paths, opts) {
  paths = paths.filter(fp => fs.existsSync(path.resolve(opts.cwd, fp)));
  if (opts.realpath) {
    return paths.map(fp => path.resolve(opts.cwd, fp));
  }
  return paths;
};
