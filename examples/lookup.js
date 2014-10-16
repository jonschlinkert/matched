'use strict';

var matched = require('..');
var globby = require('globby');

var files = matched('./', function (fp) {
  return isMatch(fp, ['verb', 'temp', '.git']);
});

function isMatch(fp, arr) {
  var len = arr.length;
  for (var i = 0; i < len; i++) {
    var re = new RegExp(arr[i]);
    if (re.test(fp)) {
      return false;
    }
  }
  return true;
}

console.log(files);
console.log(files.length);


// var files = globby.sync(['**/*.*', '!**/verb*/**', '!temp/**', '!.git/**']);
// console.log(files)
// console.log(files.length)
