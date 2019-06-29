import { Commit } from 'nodegit';
import { GroupCommitsByPackage } from '../core/models';
import getUpdatedPackagesFromCommit from './getUpdatedPackagesFromCommit';

export default async function groupCommitsByPackage(commits: Commit[]) {
  const groupCommitsByPackage: GroupCommitsByPackage = {};

  for (const commit of commits) {
    const relevantPackages = await getUpdatedPackagesFromCommit(commit);

    for (const pkg of relevantPackages) {
      if (groupCommitsByPackage[pkg] === undefined) {
        groupCommitsByPackage[pkg] = [commit];
      } else {
        groupCommitsByPackage[pkg].push(commit);
      }
    }
  }

  return groupCommitsByPackage;
}
