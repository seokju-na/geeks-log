#!/usr/bin/env node

const { testPackages, deployPackages } = require('../dist');

const [command, ...restArgv] = process.argv.slice(2);

if (command === 'ci') {
  const [rootDir] = restArgv;

  if (!rootDir) {
    throw new Error('path to root directory muse be supplied');
  }

  testPackages(rootDir).then(() => {
    console.log('[ci] Done');
  });
} else if (command === 'cd') {
  const [rootDir] = restArgv;

  if (!rootDir) {
    throw new Error('path to root directory muse be supplied');
  }

  deployPackages(rootDir).then(() => {
    console.log('[cd] Done');
  });
} else {
  console.error(`"${command}" is not valid command`);
  process.exit(1);
}
