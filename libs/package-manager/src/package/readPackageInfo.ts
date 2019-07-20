import { pathExists } from 'fs-extra';
import path from 'path';
import readPkg from 'read-pkg';
import PackageInfo, { getPackageType } from '../models/PackageInfo';

export default async function readPackageInfo(rootDir: string, pkg: string) {
  const packageDirectoryPath = path.resolve(rootDir, pkg);
  const packageFilePath = path.resolve(packageDirectoryPath, 'package.json');

  if (!await pathExists(packageFilePath)) {
    return null;
  }

  const info = await readPkg({
    cwd: pkg,
  });

  const pkgInfo: PackageInfo = {
    pkgName: pkg,
    pkgDirectoryPath: packageDirectoryPath,
    pkgFilePath: packageFilePath,
    version: info.version,
    type: getPackageType(pkg),
  };

  return pkgInfo;
}
