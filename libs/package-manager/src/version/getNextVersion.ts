import BumpType from '../models/BumpType';

export default function getNextVersion(version: string, bumpType: BumpType) {
  const versionMatch = /^(\d+).(\d+).(\d+)$/g.exec(version);

  if (versionMatch === null) {
    throw new Error(`Cannot parse version number ${version}`);
  }

  const majorVersion = Number(versionMatch[1]);
  const minorVersion = Number(versionMatch[2]);
  const patchVersion = Number(versionMatch[3]);

  switch (bumpType) {
    case BumpType.Major:
      return `${majorVersion + 1}.0.0`;
    case BumpType.Minor:
      return `${majorVersion}.${minorVersion + 1}.0`;
    case BumpType.Patch:
      return `${majorVersion}.${minorVersion}.${patchVersion + 1}`;
  }
}
