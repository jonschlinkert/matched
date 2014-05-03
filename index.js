/**
 * matched <https://github.com/jonschlinkert/matched>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */
'use strict';

var minimatch = require('minimatch');
var _ = require('lodash');


function toArray(val) {
  return _.flatten(!Array.isArray(val) ? [val] : val);
}

function getMatches(arr, pattern, options) {
  var a = [], b = [];
  if (/^!/.test(pattern)) {
    var ptn = pattern.replace('!', '');
    a = minimatch.match(arr, ptn, options);
  } else {
    b = minimatch.match(arr, pattern, options);
  }
  return {exclude: a, include: b};
}


module.exports = function(arr, patterns, options) {
  var opts = options || {}, include = [];
  patterns = toArray(patterns);
  arr = toArray(arr);

  if (!arr.length || !patterns.length) {return [];}

  return _.union(_.unique(_(patterns).map(function(pattern) {
    var m = getMatches(arr, pattern, opts);

    include = _.difference(include.concat(m.include), m.exclude);
    return _.difference(m.include, m.exclude);
  })), include);
};