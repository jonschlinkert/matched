'use strict';

const path = require('path');
const glob = require('glob');
const utils = require('./utils');

module.exports = (patterns, options) => {
  const { expand, getPaths, sift, setIgnores } = utils;
  patterns = [].concat(patterns || []);

  // shallow clone options
  const opts = { cwd: '.', nosort: true, ...options };
  opts.cwd = path.resolve(expand(opts.cwd));

  const sifted = sift(patterns, opts);
  if (sifted === null) {
    throw new Error('invalid glob pattern: ' + patterns);
  }

  if (sifted.globs === 0) {
    return getPaths(patterns, opts);
  }

  const { excludes, includes } = sifted;
  const config = include => setIgnores(opts, excludes, include.index);
  const files = [];

  for (const include of includes) {
    const dirOpts = config(include);

    // simulate onMatch, for parity with async
    const dirents = glob.sync(include.pattern, dirOpts);
    const onMatch = utils.onMatch(include.pattern, options);
    dirents.forEach(dirent => {
      files.push(dirent);
      onMatch(dirent);
    });

    if (dirOpts.onFiles) {
      dirOpts.onFiles(dirents, dirOpts);
    }
  }
  return files;
};
