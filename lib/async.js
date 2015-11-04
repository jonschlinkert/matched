'use strict';

var utils = require('./utils');

module.exports = function(patterns, config, cb) {
  if (typeof config === 'function') {
    cb = config;
    config = {};
  }

  if (typeof cb !== 'function') {
    throw new Error('expected a callback function.');
  }

  if (!utils.isValidGlob(patterns)) {
    cb(new Error('invalid glob pattern: ' + patterns));
    return;
  }

  // shallow clone options
  var options = utils.extend({cwd: ''}, config);
  options.cwd = utils.cwd(options);

  var sifted = utils.sift(patterns, options);
  var Glob = utils.glob.Glob;
  var glob;

  function updateOptions(inclusive) {
    return utils.setIgnores(options, sifted.excludes, inclusive.index);
  }

  utils.reduce(sifted.includes, [], function (acc, include, next) {
    var opts = updateOptions(include);
    if (acc.glob) {
      opts.cache = acc.glob.cache;
    }

    glob = new Glob(include.pattern, opts, function (err, files) {
      if (err) return next(err);

      acc = acc.concat(files);
      acc.glob = glob;
      next(null, acc);
    });
  }, function(err, files) {
    if (err) return cb(err);
    delete files.glob;
    cb(null, files);
  });
};
