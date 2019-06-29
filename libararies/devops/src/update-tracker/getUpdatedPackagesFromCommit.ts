import { flatten } from 'lodash';
import { Commit } from 'nodegit';
import { ROOT_PACKAGE } from '../core/models';

export default async function getUpdatedPackagesFromCommit(commit: Commit) {
  const diffs = await commit.getDiff();
  const diffPathArrays = await Promise.all(
    diffs.map(async diff => {
      const patches = await diff.patches();

      const filePathArrays = patches.map(patch => {
        const oldFilePath = patch.oldFile().path();
        const newFilePath = patch.newFile().path();

        return [oldFilePath, newFilePath];
      });

      return flatten(filePathArrays);
    }),
  );

  const diffFiles = flatten(diffPathArrays);
  const packages = diffFiles.map(getPackageFromFilename);

  return [...new Set(packages)]; // Remove duplications
}

function getPackageFromFilename(filename: string) {
  const matches = /^((libraries|services)\/(.+?))\//g.exec(filename);

  if (matches === null) {
    return ROOT_PACKAGE;
  }

  return matches[1];
}
