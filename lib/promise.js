'use strict';

const Glob = require('glob').Glob;
const isValidGlob = require('is-valid-glob');
const hasGlob = require('has-glob');
const utils = require('./utils');

module.exports = async function(patterns, options) {
  if (!isValidGlob(patterns)) {
    throw new Error('invalid glob pattern: ' + patterns);
  }

  patterns = utils.arrayify(patterns);

  const opts = Object.assign({ cwd: process.cwd() }, options);
  opts.cwd = utils.cwd(opts);
  opts.cache = {};

  if (!hasGlob(patterns)) {
    return Promise.resolve(utils.getPaths(patterns, opts));
  }

  const glob = (pattern, options) => {
    return new Promise((resolve, reject) => {
      let acc = new Glob(pattern, options, (err, files) => {
        if (err) {
          reject(err);
        } else {
          acc.files = files;
          resolve(acc);
        }
      });
    });
  };

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

    acc = await glob(include.pattern, opt);
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
