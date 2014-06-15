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
    var negated = pattern.replace('!', '');
    a = minimatch.match(arr, negated, options);
  } else {
    b = minimatch.match(arr, pattern, options);
  }
  return {excluded: a, included: b};
}

module.exports = function(arr, patterns, options) {
  var opts = options || {}, include = [];
  patterns = toArray(patterns);
  arr = toArray(arr);

  if (!arr.length || !patterns.length) {return [];}

  return _.union(_.unique(_(patterns).map(function(pattern) {
    var matches = getMatches(arr, pattern, opts);

    include = _.difference(include.concat(matches.included), matches.excluded);
    return _.difference(matches.included, matches.excluded);
  })), include);
};