import { Commit, Repository } from 'nodegit';
import getLatestTagName from './getLatestTagName';

const mergeBranchSubMessage = 'Merge branch';

export default async function getLatestCommits(repo: Repository): Promise<Commit[]> {
  const latestTagName = await getLatestTagName(repo);
  const latestTagCommit = latestTagName !== undefined
    ? await repo.getReferenceCommit(`refs/tags/${latestTagName}`)
    : null;

  const headCommit = await repo.getBranchCommit('HEAD');

  const walker = repo.createRevWalk();
  walker.push(headCommit.id());

  const commits = await walker.getCommitsUntil((nextCommit: Commit) => {
    return latestTagCommit !== null
      ? nextCommit.sha() !== latestTagCommit.sha()
      : false;
  });

  return commits
    .filter(commit => !commit.message().includes(mergeBranchSubMessage))
    .slice(0, commits.length - 1);
}
