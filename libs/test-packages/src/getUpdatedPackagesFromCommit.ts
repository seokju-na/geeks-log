import { flatten } from 'lodash';
import { Commit } from 'nodegit';

function filterPackages(files: string[], packageMatches: string[]) {
  const matches = packageMatches.join('|');
  const regExp = new RegExp(`^((${matches})/(.+?))/`, 'g');

  const packages: string[] = [];

  for (const file of files) {
    const result = regExp.exec(file);

    if (result !== null) {
      packages.push(result[1]);
    }
  }

  return packages;
}

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

  const diffFiles = flatten(diffPathArrays);

  return [...new Set(filterPackages(diffFiles, packageMatches))];
}
