import { pathExists, readJson, writeJson } from 'fs-extra';
import * as path from 'path';
import { BumpTypes, UpdatedPackageInfo } from '../core/models';
import getNextVersion from './getNextVersion';

interface PackageJson {
  version: string;
}

export default async function updatePackageVersion(
  repoDir: string,
  pkg: string,
  bumpType: BumpTypes,
): Promise<UpdatedPackageInfo | null> {
  const cwd = path.resolve(repoDir, pkg);
  const packageJsonPath = path.resolve(cwd, 'package.json');

  if (!await pathExists(packageJsonPath)) {
    return null;
  }

  const packageJson: PackageJson = await readJson(packageJsonPath);
  const previousVersion = packageJson.version;
  const nextVersion = getNextVersion(previousVersion, bumpType);

  await writeJson(packageJsonPath, {
    ...packageJson,
    version: nextVersion,
  });

  return {
    name: pkg,
    previousVersion,
    nextVersion,
  };
}
