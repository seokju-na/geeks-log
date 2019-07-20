import { flatten } from 'lodash';
import { Commit } from 'nodegit';
import { findPackageFromPath } from '../models/PackageInfo';
import NoDuplicateArray from '../utils/NoDuplicateArray';

export default async function getUpdatedPackagesFromCommit(commit: Commit): Promise<string[]> {
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

  const packages = flatten(diffPathArrays)
    .map(findPackageFromPath)
    .filter(pkg => pkg !== undefined) as string[];

  return NoDuplicateArray(packages);
}
