'use strict';

const path = require('path');
const util = require('util');
const glob = util.promisify(require('glob'));
const utils = require('./utils');

module.exports = async(patterns, options) => {
  let { expand, getPaths, sift, setIgnores } = utils;
  patterns = [].concat(patterns || []);

  let opts = Object.assign({ cwd: '.' }, options);
  opts.cwd = path.resolve(expand(opts.cwd));

  let sifted = sift(patterns, opts);
  if (sifted === null) {
    throw new Error('invalid glob pattern: ' + patterns);
  }

  if (sifted.globs === 0) {
    return Promise.resolve(getPaths(patterns, opts));
  }

  let { excludes, includes } = sifted;
  let update = include => setIgnores(opts, excludes, include.index);
  let pending = [];
  let files = [];

  for (let include of includes) {
    pending.push(glob(include.pattern, update(include)).then(res => files.push(...res)));
  }

  return Promise.all(pending).then(() => files);
};
