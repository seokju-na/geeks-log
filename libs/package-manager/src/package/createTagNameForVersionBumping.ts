import { ROOT_PACKAGE } from '../constants';
import PackageInfo from '../models/PackageInfo';

export default function createTagNameForVersionBumping({ pkgName }: PackageInfo, nextVersion: string) {
  const tagPrefix = pkgName === ROOT_PACKAGE ? 'geeks-log' : pkgName;

  return `${tagPrefix}/${nextVersion}`;
}
