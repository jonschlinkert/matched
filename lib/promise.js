'use strict';

const path = require('path');
const utils = require('./utils');
const { Glob } = require('glob');

const glob = (pattern, options) => {
  const onMatch = utils.onMatch(pattern, options);

  return new Promise((resolve, reject) => {
    const globber = new Glob(pattern, options, (err, files) => {
      globber.off('match', onMatch);

      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });

    globber.on('match', onMatch);
  });
};

module.exports = async (patterns, options) => {
  const { expand, getPaths, sift, setIgnores } = utils;
  patterns = [].concat(patterns || []);

  const opts = { cwd: '.', nosort: true, ...options };
  opts.cwd = path.resolve(expand(opts.cwd));

  const sifted = sift(patterns, opts);
  if (sifted === null) {
    return Promise.reject(new Error('invalid glob pattern: ' + patterns));
  }

  if (sifted.globs === 0) {
    return Promise.resolve(getPaths(patterns, opts));
  }

  const { excludes, includes } = sifted;
  const config = include => setIgnores(opts, excludes, include.index);
  const pending = [];
  const files = [];

  const onFiles = options => {
    return dirents => {
      files.push(...dirents);

      if (options.onFiles) {
        return options.onFiles(dirents, options);
      }
    };
  };

  for (const include of includes) {
    const opt = config(include);
    pending.push(glob(include.pattern, opt).then(onFiles(opt)));
  }

  return Promise.all(pending).then(() => files);
};
