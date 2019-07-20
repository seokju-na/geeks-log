import readPkg from 'read-pkg';
import writePkg from 'write-pkg';
import PackageInfo from '../models/PackageInfo';

export default async function bumpPackageVersion(
  { pkgDirectoryPath, pkgFilePath }: PackageInfo,
  nextVersion: string,
) {
  const data = await readPkg({
    cwd: pkgDirectoryPath,
  });

  await writePkg(pkgFilePath, {
    ...data,
    version: nextVersion,
    // eslint-disable-next-line
  } as any);
}
