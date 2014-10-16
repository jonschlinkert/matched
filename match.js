'use strict';

var fs = require('fs');
var path = require('path');


function dirs(dir, fn) {
  return fs.readdirSync(dir).filter(function (fp) {
    fp = path.join(dir, fp);
    return fn(fp);
  });
}

function isDir(fp) {
  var stats = fs.statSync(fp);
  return stats.isDirectory();
}

module.exports = function lookup(dir, fn) {
  if (!isDir(dir)) return dir;

  return dirs(dir, fn)
    .reduce(function (acc, fp) {
      fp = path.join(dir, fp);
      if (isDir(fp)) {
        acc = acc.concat(lookup(fp, fn));
      } else {
        acc = acc.concat(fp);
      }
    return acc;
  }, []);
};

      // if (recurse === false) {
      //   return acc.concat(fp);
      // }
