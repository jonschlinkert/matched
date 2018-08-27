'use strict';

const glob = require('./promise');

module.exports = (patterns, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  let promise = glob(patterns, options);

  if (typeof callback === 'function') {
    promise.then(files => callback(null, files)).catch(callback);
    return;
  }

  return promise;
};
