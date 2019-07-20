import { Oid, Repository } from 'nodegit';

interface TagsToCreate {
  name: string;
  message?: string;
}

export default async function createTags(
  repo: Repository,
  commitId: Oid,
  tagsToCreate: TagsToCreate[],
) {
  const jobs = tagsToCreate.map(async ({ name, message = '' }) => {
    const reference = await repo.createTag(commitId, name, message);

    return `refs/tags/${reference.name()}`;
  });

  return Promise.all(jobs);
}
