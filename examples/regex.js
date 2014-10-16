'use strict';

var matched = require('./match');
var mm = require('minimatch');

function matches(cwd, exclude, include) {
  var files = matched('./', mm.filter(exclude));
  if (include == null) {
    return files;
  }

  return files.filter(function(fp) {
    return mm(fp, include);
  });
}

// function matches(exclude) {
//   return function(fp) {
//     exclude = Array.isArray(exclude) ? exclude : [exclude];
//     var len = exclude.length;
//     for (var i = 0; i < len; i++) {
//       var pattern = new RegExp(exclude[i]);
//       if (pattern.test(fp)) {
//         return false;
//       }
//     }
//     return true;
//   }
// }


// var files = lookup('./', ['node_modules', 'bin', 'hbs', '.git', 'amet', 'adi']);
// var files1 = matched('./', matches(['verb', 'temp', '.git']), false);
// var files1 = matched('./', matches(['verb', 'temp', '.git']));
// var files1 = matched('./', mm.filter('!**/{verb*,temp,.git}'));
var files1 = matches('./', '!**/{verb*,temp,.git}', '**/*.md');

console.log(files1)
console.log(files1.length)

// var files2 = globby.sync(['**/*.*', '!**/verb*/**', '!temp/**', '!.git/**']);
// console.log(files2)
// console.log(files2.length)
