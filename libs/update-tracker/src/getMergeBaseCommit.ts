import { Commit, Merge, Repository } from 'nodegit';

export default async function getMergeBaseCommit(
  repo: Repository,
  one: Commit,
  two: Commit,
) {
  const mergeBaseId = await Merge.base(repo, one.id(), two.id());

  return await Commit.lookup(repo, mergeBaseId);
}
