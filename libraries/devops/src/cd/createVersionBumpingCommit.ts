import * as fs from 'fs';
import { flatMap } from 'lodash';
import { Repository, Signature } from 'nodegit';
import { EOL } from 'os';
import * as path from 'path';
import { getUpdatedPackageInfoDescription, UpdatedPackageInfo } from '../core/models';

export default async function createVersionBumpingCommit(
  repo: Repository,
  updatedPackageInfos: UpdatedPackageInfo[],
) {
  const signature = Signature.now('Seokju Na', 'seokju.me@gmail.com');
  const versionPaths = flatMap(updatedPackageInfos, ({ name }) => {
    const packageJsonPath = path.join(name, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      return [packageJsonPath];
    }

    return [];
  });

  const headMessage = 'chore: Bump version [skip ci]';
  const bodyMessage = updatedPackageInfos
    .map(getUpdatedPackageInfoDescription)
    .join(EOL);

  return await repo.createCommitOnHead(
    versionPaths,
    signature,
    signature,
    `${headMessage}${EOL}${EOL}${bodyMessage}`,
  );
}
