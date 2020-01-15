'use strict';

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const symlinks = (options = {}) => {
  const { src, dest } = options;
  const files = fs.readdirSync(src, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => {
      file.path = path.join(src, file.name);
      return file;
    });

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  for (const file of files) {
    const link = path.resolve(dest, path.basename(file.path));

    if (!fs.existsSync(link)) {
      fs.symlinkSync(file.path, link);
    }
  }

  return () => rimraf.sync(dest);
};

module.exports = symlinks;
