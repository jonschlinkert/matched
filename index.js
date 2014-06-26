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
var differ = require('array-differ');
var union = require('array-union');
var unique = require('array-uniq');
var normalize = require('normalize-path');
var segments = require('path-segments');
var parsePath = require('parse-filepath');
var extend = require('xtend');


function resolve(cwd) {
  return function(filepath) {
    return normalize(path.resolve(cwd, filepath));
  };
}

function listDirs(cwd) {
  return fs.readdirSync(cwd).filter(function(filepath) {
    filepath = path.join(cwd, filepath);
    return fs.statSync(filepath).isDirectory();
  }).map(resolve(cwd));
}

var base = function(options) {
  options = options || {};
  var filepath = path.resolve(options.cwd || root());
  return normalize(filepath);
};

var arrayify = function(arr) {
  return !Array.isArray(arr) ? [arr] : arr;
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
  var rootDirs = union(rootOmit, arrayify(options.omit || []));
  return differ(dirs, rootDirs.map(resolve(cwd)));
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

  var p = splitPatterns(arrayify(patterns));

  return unique(flatten(filterDirs(options).reduce(function (acc, start) {
    var normalized = p.map(function (pattern) {
      var dir = start;
      if (!/\*\*\//.test(pattern)) {
        start = cwd;
      }
      if (/\{,/.test(pattern)) {
        start = normalize(path.resolve(options.cwd || start));
      }

      opts = extend({}, options, {
        pattern: pattern,
        cwd: start,
        root: start
      });

      // reset cwd;
      start = dir;
      return opts;
    });

    return normalized.map(function(obj) {
      opts = extend({}, {cwd: obj.cwd, srcBase: obj.srcBase, root: obj.root});
      var result = glob.sync(obj.pattern, opts);
      return result.map(resolve(opts.cwd));
    });
  }, [])));
};
