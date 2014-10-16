'use strict';

var fs = require('fs');
var path = require('path');


function dirs(dir, exclude) {
  return fs.readdirSync(dir).filter(function (fp) {
    fp = path.join(dir, fp);
    return isValid(fp, exclude);
  });
}

function isValid(fp, omit) {
  omit = Array.isArray(omit) ? omit : [omit];
  var len = omit.length;
  for (var i = 0; i < len; i++) {
    var pattern = new RegExp(omit[i]);
    if (pattern.test(fp)) {
      return false;
    }
  }
  return true;
}


function lookup(dir, exclude) {
  if (!isDir(dir)) return dir;

  return dirs(dir, exclude)
    .reduce(function (acc, fp) {
      fp = path.join(dir, fp);
      if (isDir(fp)) {
        acc = acc.concat(lookup(fp, exclude));
      } else {
        acc = acc.concat(fp);
      }
    return acc;
  }, []);
};


// var files = lookup('./', ['node_modules', 'bin', 'hbs', '.git', 'amet', 'adi']);
var files = lookup('./', ['verb', 'temp', '.git']);
console.log(files)


function isDir(fp) {
  var stats = fs.statSync(fp);
  return stats.isDirectory();
}
