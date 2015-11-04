'use strict';

var path = require('path');
var extend = require('extend-shallow');
var combine = require('ordered-read-streams');
var parent = require('glob-parent');
var through = require('through2');
var src = require('src-stream');
var Glob = require('glob').Glob;
var merge = require('merge-stream');
var utils = require('./utils');

module.exports = function () {
  var seen = {};

  function dir(pattern, opts) {
    if (opts.cwdbase) return opts.cwd;
    var base = opts.base || parent(pattern);
    base = path.resolve(base === '.' ? '' : base);
    if (base && base.slice(-1) !== '/') {
      return base + '/';
    }
    return base;
  }

  function glob(pattern, options) {
    var opts = extend({cwd: process.cwd(), ignore: []}, options);
    var base = dir(pattern, opts);
    utils.commonIgnores(pattern, opts);

    var files = new Glob(pattern, opts);
    var stream = src(through.obj());

    files.on('error', stream.emit.bind(stream, 'error'));
    files.once('end', stream.emit.bind(stream, 'end'));
    files.on('match', function (fp) {
      var absolute = path.resolve(opts.cwd, fp);
      if (seen[absolute]) return;
      seen[absolute] = true;
      stream.write({
        cwd: opts.cwd,
        base: base,
        path: absolute
      });
    });
    return stream;
  }

  function eachGlob(patterns, config) {
    if (!utils.isValidGlob(patterns)) {
      throw new TypeError('invalid glob pattern: ' + utils.invalidGlob(patterns));
    }

    // shallow clone options
    var options = utils.extend({cwd: ''}, config);
    options.cwd = utils.cwd(options);
    options.cache = {};

    var sifted = utils.sift(patterns, options);
    var excludes = sifted.excludes;
    var includes = sifted.includes;

    function updateOptions(include) {
      return utils.setIgnores(options, excludes, include.index);
    }

    var len = includes.length, i = -1;
    var streams = [];
    var res = {};

    while (++i < len) {
      var include = includes[i];
      var opts = updateOptions(include);
      opts.cache = res.cache;

      res = glob(include.pattern, opts);
      streams.push(res);
    }
    return merge.apply(merge, streams);
  }

  return eachGlob.apply(eachGlob, arguments);
};
