'use strict';

var glob = require('./async');
var utils = require('./utils');

module.exports = function(patterns, options) {
  var opts = utils.extend({cwd: process.cwd()}, options);
  var Promise = utils.promise;

  return new Promise(function(resolve, reject) {
    glob(patterns, opts, function(err, files) {
      if (err) {
        reject(err);
        return;
      }
      resolve(files);
    });
  });
};
