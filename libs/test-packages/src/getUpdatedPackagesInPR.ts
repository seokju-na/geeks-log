import { Commit, Oid, Repository } from 'nodegit';
import getCommitsFromRange from './getCommitsFromRange';
import getUpdatedPackagesFromCommit from './getUpdatedPackagesFromCommit';

const knownIgnoreCommitMessages = [
  'Merge branch',
  'Bump version',
  '[skip ci]',
];

const packageMatches = ['apps', 'libs'];

const [fromSHA, toSHA] = (process.env.TRAVIS_COMMIT_RANGE as string)
  .split('...') as [string, string];
const commitPrefixLength = 12;

/**
 * Get updated packages from diff master branch between current branch.
 */
export default async function getUpdatedPackagesInPR(repoDirectoryPath: string) {
  const repo = await Repository.open(repoDirectoryPath);
  const head = await Commit.lookupPrefix(repo, Oid.fromString(toSHA), commitPrefixLength);
  const until = await Commit.lookupPrefix(repo, Oid.fromString(fromSHA), commitPrefixLength);

  const commits = (await getCommitsFromRange(repo, head, until))
    .filter(commit => knownIgnoreCommitMessages
      .some(message => !commit.message().includes(message)));

  let updatedPackages: string[] = [];

  for (const commit of commits) {
    const packages = await getUpdatedPackagesFromCommit(commit, packageMatches);
    updatedPackages = [...updatedPackages, ...packages];
  }

  return [...new Set(updatedPackages)];
}

