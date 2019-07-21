import { SpawnOptions } from 'child_process';
import { pathExists } from 'fs-extra';
import { Commit, Oid, Repository } from 'nodegit';
import path from 'path';
import { filterIgnoreCommits, ROOT_PACKAGE } from './constants';
import getCommitsFromRange from './git/getCommitsFromRange';
import groupCommitsByPackage from './git/groupCommitsByPackage';
import spawn from './utils/spawn';

const COMMIT_RANGE = process.env.TRAVIS_COMMIT_RANGE as string;
const [fromCommitSHA, toCommitSHA] = COMMIT_RANGE.split('...') as [string, string];
const commitPrefixLength = 12;

async function testPackage(rootDir: string, pkg: string) {
  const packageDirPath = path.resolve(rootDir, pkg);
  const packageFilePath = path.resolve(packageDirPath, 'package.json');

  if (!await pathExists(packageFilePath)) {
    console.warn(`[ci] Skip "${pkg}" because "package.json" file not found.`);
    return;
  }

  try {
    const options: SpawnOptions = {
      cwd: packageDirPath,
      stdio: 'inherit',
    };

    await spawn('yarn', [], options);
    await spawn('yarn', ['test'], options);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

export default async function testPackages(rootDir: string) {
  const repo = await Repository.open(rootDir);

  const head = await Commit.lookupPrefix(repo, Oid.fromString(toCommitSHA), commitPrefixLength);
  const until = await Commit.lookupPrefix(repo, Oid.fromString(fromCommitSHA), commitPrefixLength);

  const commits = (await getCommitsFromRange(repo, head, until))
    .filter(filterIgnoreCommits);

  const group = await groupCommitsByPackage(commits);

  for (const pkg of Object.keys(group)) {
    if (pkg === ROOT_PACKAGE) {
      continue;
    }

    console.log(`[ci] Testing "${pkg}"`);
    await testPackage(rootDir, pkg);
  }
}
