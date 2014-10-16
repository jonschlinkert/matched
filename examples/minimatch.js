'use strict';

var matched = require('..');
var mm = require('minimatch');
var globby = require('globby');


/**
 * Exclusive / inclusive
 */


function matches(cwd, exclude, include) {
  var files = matched('./', mm.filter(exclude));
  if (include == null) {
    return files;
  }

  return files.filter(function(fp) {
    return mm(fp, include);
  });
}

var files = matches('./', '!**/{verb*,temp,.git}');
console.log(files);
console.log(files.length);

var files2 = globby.sync(['**/*.md', '!**/verb*/**', '!temp/**', '!.git/**']);
console.log(files2)
console.log(files2.length)
