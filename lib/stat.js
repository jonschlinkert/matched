'use strict';

function Stat(pattern, opts, i) {
  this.index = i;
  this.isNegated = false;
  this.pattern = pattern;

  if (pattern.charAt(0) === '!') {
    this.isNegated = true;
    this.pattern = pattern.slice(1);
  }

  if (this.pattern.slice(0, 2) === './') {
    this.pattern = this.pattern.slice(2);
  }
}

/**
 * Expose `Stat`
 */

module.exports = Stat;
