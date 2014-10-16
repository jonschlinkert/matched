/*!
 * matched <https://github.com/jonschlinkert/matched>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var assert = require('assert');
var should = require('should');
var globby = require('globby');
var matched = require('./match');

// describe('matched', function () {
//   it('should equal', function () {
//     matched({a: 'b'}).should.eql({a: 'b'});
//     matched('abc').should.equal('abc');
//   });

//   it('should have property.', function () {
//     matched({a: 'b'}).should.have.property('a', 'b');
//   });
// });



function exclude(omit) {
  return function(fp) {
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
}


// var files = lookup('./', ['node_modules', 'bin', 'hbs', '.git', 'amet', 'adi']);
// var files1 = matched('./', exclude(['verb', 'temp', '.git']));
// console.log(files1)
// console.log(files1.length)

var files2 = globby.sync(['**/*.*', '!**/verb*/**', '!temp/**', '!.git/**']);
console.log(files2)
console.log(files2.length)
