'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('lazy-cache')(require);

/**
 * Lazily required module dependencies
 */

var fn = require;
require = utils;
require('glob');
require('async-array-reduce', 'reduce');
require('extend-shallow', 'extend');
require('is-valid-glob', 'isValidGlob');
require('resolve-dir', 'resolve');
require = fn;

/**
 * utils
 */

utils.arrayify = function arrayify(val) {
  return Array.isArray(val) ? val : [val];
};

/**
 * Expose `utils`
 */

module.exports = utils;
