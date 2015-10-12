'use strict';

var path = require('path');
var utils = require('./utils');

module.exports = function (patterns, config, cb) {
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
  options.cwd = cwd(options);
  var sifted = siftPatterns(patterns, options);
  var Glob = utils.glob.Glob;
  var glob;

  function updateOptions(inclusive) {
    return setIgnores(options, sifted.excludes, inclusive.index);
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

module.exports.sync = function (patterns, config) {
  if (!utils.isValidGlob(patterns)) {
    throw new Error('invalid glob pattern: ' + patterns);
  }

  // shallow clone options
  var options = utils.extend({cwd: ''}, config);
  options.cwd = cwd(options);
  var sifted = siftPatterns(patterns, options);
  var Glob = utils.glob.Glob;
  var glob;

  var len = sifted.includes.length, i = -1;
  var files = [];

  while (++i < len) {
    var include = sifted.includes[i];
    var opts = setIgnores(options, sifted.excludes, include.index);
    opts.sync = true;
    if (glob && glob.cache) {
      opts.cache = glob.cache;
    }
    glob = new Glob(include.pattern, opts);
    files.push.apply(files, glob.found);
  }
  return files;
};

function siftPatterns(patterns, opts) {
  patterns = utils.arrayify(patterns);
  var res = { includes: [], excludes: [] };
  var len = patterns.length, i = -1;

  while (++i < len) {
    var stat = new Stat(patterns[i], opts, i);

    if (opts.relative) {
      stat.pattern = toRelative(stat.pattern, opts);
      delete opts.cwd;
    }

    if (stat.isNegated) {
      res.excludes.push(stat);
    } else {
      res.includes.push(stat);
    }
  }
  res.stat = stat;
  return res;
}

function setIgnores(options, excludes, inclusiveIndex) {
  var opts = utils.extend({}, options);
  var negations = [];

  var len = excludes.length, i = -1;
  while (++i < len) {
    var exclusion = excludes[i];
    if (exclusion.index > inclusiveIndex) {
      negations.push(exclusion.pattern);
    }
  }
  opts.ignore = utils.arrayify(opts.ignore || []);
  opts.ignore.push.apply(opts.ignore, negations);
  return opts;
}

function Stat(pattern, opts, i) {
  this.index = i
  this.isNegated = false;
  this.pattern = pattern;

  if (pattern.charAt(0) === '!') {
    this.isNegated = true;
    this.pattern = pattern.slice(1);
  }
}

function cwd(opts) {
  if (/^\W/.test(opts.cwd)) {
    return utils.resolve(opts.cwd);
  }
  return opts.cwd;
}

function toRelative(pattern, opts) {
  var fp = path.resolve(opts.cwd, pattern);
  return path.relative(process.cwd(), fp);
}

