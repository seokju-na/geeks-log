import writePkg from 'write-pkg';
import PackageInfo from '../models/PackageInfo';

export default async function bumpPackageVersion(
  pkgInfo: PackageInfo,
  nextVersion: string,
) {
  await writePkg(pkgInfo.pkgFilePath, {
    version: nextVersion,
  });
}
