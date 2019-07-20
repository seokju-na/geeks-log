import { flatten } from 'lodash';
import { Commit } from 'nodegit';

export default async function getUpdatedPackagesFromCommit(
  commit: Commit,
  packageMatches: string[],
): Promise<string[]> {
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

  const matches = packageMatches.join('|');
  const regExp = new RegExp(`^((${matches})/(.+?))/`, 'g');
  const diffFiles = flatten(diffPathArrays);
  const packages = diffFiles
    .filter(filename => regExp.test(filename))
    .map(filename => regExp.exec(filename)![1]);

  return [...new Set(packages)];
}
