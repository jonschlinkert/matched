/**
 * matched <https://github.com/jonschlinkert/matched>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var root = require('find-root');
var glob = require('globby');
var flatten = require('array-flatten');
var unique = require('array-uniq');
var normalize = require('normalize-path');
var segments = require('path-segments');
var parsePath = require('parse-filepath');
var _ = require('lodash');


function resolve(cwd) {
  return function(filepath) {
    // var full = normalize(path.resolve(filepath));
    // if (full.indexOf(cwd) === -1) {
    //   var dir = parsePath(filepath).dirname;
    //   if (/:/.test(dir)) {
    //     var first = segments(filepath, {first: 1});
    //     filepath = normalize(filepath.replace(first, ''));
    //   }
    //   filepath = path.join(cwd, filepath);
    // }
    return normalize(path.resolve(cwd, filepath));
  };
}

function listDirs(cwd) {
  return fs.readdirSync(cwd).filter(function(filepath) {
    filepath = path.join(cwd, filepath);
    return fs.statSync(filepath).isDirectory();
  }).map(resolve(cwd));
}

function difference(a, b) {
  return a.filter(function (i) {
    return b.indexOf(i) < 0;
  });
};

var base = function(options) {
  options = options || {};
  var filepath = path.resolve(options.cwd || root());
  return normalize(filepath);
};


/**
 * ## filterDirs
 *
 * Return an array of directories except for exclusions.
 *
 * @param   {String} `base` The base directory to start from.
 * @param   {Object} `options`
 * @return  {Array}
 * @api private
 */

var filterDirs = function(options) {
  options = options || {};
  var cwd = base(options);

  // list directories starting with the cwd
  var dirs = listDirs(cwd).map(resolve(cwd));

  // Omit folders from root directory
  var rootOmit = ['.git', 'node_modules', 'temp', 'tmp'];
  var rootDirs = _.union(rootOmit, options.omit)
  return _.difference(dirs, rootDirs.map(resolve(cwd)));
};

var splitPatterns = function(patterns) {
  var arr = [];
  patterns.forEach(function(pattern) {
    var re = /^\*\*\//;
    arr.push(pattern);
    if (re.test(pattern)) {
      arr.push(pattern.replace(re, ''));
    }
  });
  return unique(arr);
};


module.exports = function matched(patterns, options) {
  options = options || {};
  var cwd = base(options);
  var opts;

  patterns = !Array.isArray(patterns) ? [patterns] : patterns;
  var p = splitPatterns(patterns);

  var res = [];
  return unique(flatten(filterDirs(options).reduce(function (acc, start) {
    var normalized = p.map(function (pattern) {
      pattern = normalize(path.join(start, pattern));
      var dir = start;

      if (!/\*\*\//.test(pattern)) {
        start = cwd;
      }

      opts = _.extend({}, options, {
        pattern: pattern,
        cwd: start
      });

      // reset cwd;
      start = dir;
      return opts;
    });

    normalized.forEach(function(obj) {
      opts = _.extend({}, {cwd: obj.cwd, srcBase: obj.srcBase});
      var result = glob.sync(obj.pattern, opts);
      res = res.concat(result.map(resolve(opts.cwd)));
    });
    return res;
  }, [])));
};
