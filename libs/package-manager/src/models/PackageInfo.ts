import { ROOT_PACKAGE } from '../constants';

export type PackageType = 'library' | 'common' | 'service' | '(root)';

export default interface PackageInfo {
  readonly pkgName: string;
  readonly version: string;
  readonly pkgDirectoryPath: string;
  readonly pkgFilePath: string;
  readonly type: PackageType;
}

export const packagePathMatches = /^((libs|common|services)\/(.+?))\//g;

export function getPackageType(pkg: string): PackageType {
  if (pkg.startsWith('libs')) {
    return 'library';
  } else if (pkg.startsWith('common')) {
    return 'common';
  } else if (pkg.startsWith('services')) {
    return 'service';
  } else {
    return '(root)';
  }
}

export function findPackageFromPath(path: string) {
  const result = packagePathMatches.exec(path);

  if (result === null) {
    return ROOT_PACKAGE;
  }

  return result[1];
}
