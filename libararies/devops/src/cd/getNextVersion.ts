import { BumpTypes } from '../core/models';

export default function getNextVersion(currentVersion: string, bumpType: BumpTypes) {
  const versionMatch = /^(\d+).(\d+).(\d+)$/g.exec(currentVersion);

  if (versionMatch === null) {
    throw new Error(`[Publisher] Cannot parse version number ${currentVersion}`);
  }

  const majorVersion = Number(versionMatch[1]);
  const minorVersion = Number(versionMatch[2]);
  const patchVersion = Number(versionMatch[3]);

  switch (bumpType) {
    case BumpTypes.Major:
      return `${majorVersion + 1}.0.0`;
    case BumpTypes.Minor:
      return `${majorVersion}.${minorVersion + 1}.0`;
    case BumpTypes.Patch:
      return `${majorVersion}.${minorVersion}.${patchVersion + 1}`;
  }
}
