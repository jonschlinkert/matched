'use strict';

var matched = require('..');
var mm = require('minimatch');
var globby = require('globby');


/**
 * Exclusive and inclusive
 */

function matches(cwd, patterns) {
  return matched('./', mm.filter(patterns));
}

var files = matches('./', '!**/{verb*,temp,.git}');
console.log(files);
console.log(files.length);


var files2 = globby.sync(['**/*.*', '!**/{verb*,temp,.git}/**']);
console.log(files2)
console.log(files2.length)
