'use strict';

var lib = require('./lib');

/**
 * API
 */

var glob = lib.async;
glob.sync = lib.sync;
glob.stream = lib.stream;

/**
 * Expose `glob`
 */

module.exports = glob;
