import { Commit } from 'nodegit';

export interface GroupCommitsByPackage {
  [packageName: string]: Commit[];
}

export const ROOT_PACKAGE = '.';
export const ROOT_TAG_PREFIX = 'geeks-log';

export enum BumpTypes {
  Major,
  Minor,
  Patch,
}

export interface UpdatedPackageInfo {
  name: string;
  previousVersion: string | undefined;
  nextVersion: string;
}

export function getUpdatedPackageInfoDescription({
  name,
  previousVersion,
  nextVersion,
}: UpdatedPackageInfo) {
  const pkgName = name === ROOT_PACKAGE ? '(root)' : name;
  const prevVersionName = previousVersion === undefined ? '?' : previousVersion;

  return `${pkgName} ${prevVersionName} -> ${nextVersion}`;
}
