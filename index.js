'use strict';

var fs = require('fs');
var path = require('path');


function dirs(dir, fn) {
  return fs.readdirSync(dir).filter(function (fp) {
    return fn(path.join(dir, fp));
  });
}

function isDir(fp) {
  var stats = fs.statSync(fp);
  return stats.isDirectory();
}


module.exports = function lookup(dir, fn, recurse) {
  if (!isDir(dir)) return dir;

  return dirs(dir, fn, recurse)
    .reduce(function (acc, fp) {
      fp = path.join(dir, fp);

      if (recurse === false) {
        return acc.concat(fp);
      }

      if (isDir(fp)) {
        acc = acc.concat(lookup(fp, fn));
      } else {
        acc = acc.concat(fp);
      }
    return acc;
  }, []);
};

