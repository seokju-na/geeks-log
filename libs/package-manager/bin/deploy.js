#!/usr/bin/env node

const { deployPackages } = require('../dist');
const pkg = require('../package.json');

const { version } = pkg;
const [rootDir] = process.argv.slice(2);

console.log(`@geeks-log/package-manager: ${version}`);

deployPackages(rootDir)
  .then(() => {
    console.log('[cd] Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
