'use strict';

var matched = require('..');
var globby = require('globby');


/**
 * Same as lookup.js, different approach.
 *
 * @param  {[type]} exclude
 * @return {[type]}
 */

function matches(exclude) {
  return function(fp) {
    exclude = Array.isArray(exclude) ? exclude : [exclude];
    var len = exclude.length;
    for (var i = 0; i < len; i++) {
      var pattern = new RegExp(exclude[i]);
      if (pattern.test(fp)) {
        return false;
      }
    }
    return true;
  }
}


var files = matched('./', matches(['verb', 'temp', '.git']));
console.log(files)
console.log(files.length)

var files2 = globby.sync(['**/*.*', '!**/verb*/**', '!temp/**', '!.git/**']);
console.log(files2)
console.log(files2.length)
