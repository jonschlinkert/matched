'use strict';

const Glob = require('glob').Glob;
const isValidGlob = require('is-valid-glob');
const hasGlob = require('has-glob');
const utils = require('./utils');

module.exports = function(patterns, options) {
  if (!isValidGlob(patterns)) {
    throw new Error('invalid glob pattern: ' + patterns);
  }

  patterns = utils.arrayify(patterns);

  // shallow clone options
  const opts = Object.assign({ cwd: '', nosort: true }, options);
  opts.cwd = utils.cwd(opts);
  opts.cache = {};

  if (!hasGlob(patterns)) {
    return utils.getPaths(patterns, opts);
  }

  const sifted = utils.sift(patterns, opts);
  const excludes = sifted.excludes;
  const includes = sifted.includes;
  const cache = [];
  const files = [];
  let acc = { cache: {} };

  function updateOptions(include) {
    return utils.setIgnores(opts, excludes, include.index);
  }

  for (const include of includes) {
    const opt = updateOptions(include);
    opt.cache = acc.cache;
    opt.sync = true;

    acc = new Glob(include.pattern, opt);
    cache.push(acc.cache);

    files.push.apply(files, acc.found);
  }

  Object.defineProperty(files, 'cache', {
    configurable: true,
    enumerable: false,
    get: () => utils.createCache(cache)
  });

  return files;
};
