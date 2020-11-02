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
  const results = { includes: [], excludes: [], globs: 0 };
  let index = 0;

  for (const pattern of [].concat(patterns || [])) {
    if (typeof pattern !== 'string') return null;
    const res = picomatch.scan(pattern);
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
  const opts = Object.assign({}, options);
  const negations = [];

  for (const exclusive of excludes) {
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
 * Create an event listener for .on('match', ...).
 *
 * @param {String} pattern
 * @param {Object} options
 * @return {Function}
 */

exports.onMatch = (pattern, options) => {
  return filepath => {
    if (options && typeof options.onMatch === 'function') {
      options.onMatch({ pattern, options, path: filepath });
    }
  };
};

/**
 * Get paths from non-glob patterns
 *
 * @param {Array} `paths`
 * @param {Object} `opts`
 * @return {Array}
 */

exports.getPaths = (paths, options = {}) => {
  const resolve = fp => path.resolve(exports.expand(options.cwd), fp);
  const result = [];

  for (const filepath of paths) {
    const onMatch = exports.onMatch(filepath, options);
    const absolute = resolve(filepath);
    let resolved = filepath;

    if (options.absolute) {
      resolved = absolute;
    }

    if (options.realpath) {
      try {
        resolved = fs.realpathSync(absolute);
      } catch (err) {
        continue;
      }
    }

    if (!fs.existsSync(absolute)) {
      continue;
    }

    if (options.onMatch) {
      onMatch(resolved);
    }

    result.push(resolved);
  }

  if (options.onFiles) {
    options.onFiles(result, options);
  }

  return result;
};
