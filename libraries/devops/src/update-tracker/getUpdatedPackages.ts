import { Repository } from 'nodegit';
import getLatestCommits from './getLatestCommits';
import groupCommitsByPackage from './groupCommitsByPackage';

export default async function getUpdatedPackages(repoDirectory: string) {
  const repository = await Repository.open(repoDirectory);
  const commits = await getLatestCommits(repository);
  const commitsByPackageGroup = await groupCommitsByPackage(commits);

  return Object.keys(commitsByPackageGroup);
}
