#!/usr/bin/env node

const { testPackages } = require('../dist');
const pkg = require('../package.json');

const { version } = pkg;
const [rootDir] = process.argv.slice(2);

console.log(`@geeks-log/package-manager: ${version}`);

testPackages(rootDir)
  .then(() => {
    console.log('[ci] Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
