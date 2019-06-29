import compareVersions from 'compare-versions';
import { Repository, Tag } from 'nodegit';
import { ROOT_TAG_PREFIX } from '../core/models';

export default async function getLatestTagName(repo: Repository) {
  const tags: string[] = await Tag.list(repo);

  return tags
    .filter(tag => tag.startsWith(ROOT_TAG_PREFIX))
    .sort((x, y) => {
      const xVersion = getVersionFromTagName(x, ROOT_TAG_PREFIX);
      const yVersion = getVersionFromTagName(y, ROOT_TAG_PREFIX);

      return compareVersions(xVersion, yVersion) * -1;
    })[0];
}

function getVersionFromTagName(tag: string, prefix: string) {
  return tag.replace(new RegExp(prefix, 'g'), '');
}
