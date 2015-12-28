'use strict';

var utils = require('./utils');

module.exports = function(patterns, config) {
  if (!utils.isValidGlob(patterns)) {
    throw new Error('invalid glob pattern: ' + patterns);
  }

  // shallow clone options
  var options = utils.extend({cwd: ''}, config);
  options.cwd = utils.cwd(options);
  options.cache = {};

  var sifted = utils.sift(patterns, options);
  var excludes = sifted.excludes;
  var includes = sifted.includes;
  var Glob = utils.glob.Glob;
  var glob = {cache: {}};

  function updateOptions(include) {
    return utils.setIgnores(options, excludes, include.index);
  }

  var len = includes.length, i = -1;
  var files = [];

  while (++i < len) {
    var include = includes[i];
    var opts = updateOptions(include);
    opts.cache = glob.cache;
    opts.sync = true;

    glob = new Glob(include.pattern, opts);
    files.push.apply(files, glob.found);
  }

  return files;
};
