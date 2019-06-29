import { Oid, Repository } from 'nodegit';
import { ROOT_PACKAGE, ROOT_TAG_PREFIX, UpdatedPackageInfo } from '../core/models';

export default async function createTag(
  repo: Repository,
  versionBumpingCommitId: Oid,
  updateInfo: UpdatedPackageInfo,
) {
  const tagRef = await repo.createLightweightTag(versionBumpingCommitId, createTagName(updateInfo));
  return tagRef.name();
}

function createTagName({ name, nextVersion }: UpdatedPackageInfo) {
  if (name === ROOT_PACKAGE) {
    return `${ROOT_TAG_PREFIX}/${nextVersion}`;
  }

  return `${name}/${nextVersion}`;
}
