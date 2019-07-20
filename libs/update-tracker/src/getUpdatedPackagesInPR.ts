import { Repository } from 'nodegit';
import getCommitsFromRange from './getCommitsFromRange';
import getMergeBaseCommit from './getMergeBaseCommit';
import getUpdatedPackagesFromCommit from './getUpdatedPackagesFromCommit';
import syncRepository from './syncRepository';

const knownIgnoreCommitMessages = [
  'Merge branch',
  'Bump version',
  '[skip ci]'
];

const packageMatches = ['apps', 'libs'];

/**
 * Get updated packages from diff master branch between current branch.
 */
export default async function getUpdatedPackagesInPR(repoDirectoryPath: string) {
  const repo = await Repository.open(repoDirectoryPath);
  await syncRepository(repo, 'origin/master', 'master');

  const masterCommit = await repo.getMasterCommit();
  const headCommit = await repo.getHeadCommit();

  const mergeBaseCommit = await getMergeBaseCommit(repo, masterCommit, headCommit);
  const commits = (await getCommitsFromRange(repo, headCommit, mergeBaseCommit))
    .filter(commit => knownIgnoreCommitMessages
      .some(message => !commit.message().includes(message)));

  let updatedPackages: string[] = [];

  for (const commit of commits) {
    const packages = await getUpdatedPackagesFromCommit(commit, packageMatches);
    updatedPackages = [...updatedPackages, ...packages];
  }

  return [...new Set(updatedPackages)];
}
