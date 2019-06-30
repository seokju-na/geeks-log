import compareVersions from 'compare-versions';
import { Repository, Tag } from 'nodegit';
import { ROOT_TAG_PREFIX } from '../core/models';

export default async function getLatestTagName(repo: Repository) {
  const tags: string[] = await Tag.list(repo);
  const prefix = `${ROOT_TAG_PREFIX}/`;

  return tags
    .filter(tag => tag.startsWith(prefix))
    .sort((x, y) => {
      const xVersion = getVersionFromTagName(x, prefix);
      const yVersion = getVersionFromTagName(y, prefix);

      return compareVersions(xVersion, yVersion) * -1;
    })[0];
}

function getVersionFromTagName(tag: string, prefix: string) {
  return tag.replace(new RegExp(prefix, 'g'), '');
}
