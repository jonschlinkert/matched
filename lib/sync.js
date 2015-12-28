'use strict';

var utils = require('./utils');

module.exports = function(patterns, config) {
  if (!utils.isValidGlob(patterns)) {
    throw new Error('invalid glob pattern: ' + patterns);
  }

  // shallow clone options
  var options = utils.extend({cwd: ''}, config);
  options.cwd = utils.cwd(options);
  var sifted = utils.siftPatterns(patterns, options);
  var Glob = utils.glob.Glob;
  var glob;

  var len = sifted.includes.length, i = -1;
  var files = [];

  while (++i < len) {
    var include = sifted.includes[i];
    var opts = utils.setIgnores(options, sifted.excludes, include.index);
    opts.sync = true;
    if (glob && glob.cache) {
      opts.cache = glob.cache;
    }
    glob = new Glob(include.pattern, opts);
    files.push.apply(files, glob.found);
  }
  return files;
};

