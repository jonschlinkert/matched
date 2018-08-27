'use strict';

const path = require('path');
const glob = require('glob');
const utils = require('./utils');

module.exports = (patterns, options) => {
  let { expand, getPaths, sift, setIgnores } = utils;
  patterns = [].concat(patterns || []);

  // shallow clone options
  const opts = Object.assign({ cwd: '.', nosort: true }, options);
  opts.cwd = path.resolve(expand(opts.cwd));

  let sifted = sift(patterns, opts);
  if (sifted === null) {
    throw new Error('invalid glob pattern: ' + patterns);
  }

  if (sifted.globs === 0) {
    return getPaths(patterns, opts);
  }

  let { excludes, includes } = sifted;
  let update = include => setIgnores(opts, excludes, include.index);
  let files = [];

  for (let include of includes) {
    files.push(...glob.sync(include.pattern, update(include)));
  }
  return files;
};
