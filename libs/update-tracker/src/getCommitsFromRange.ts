import { Commit, Repository } from 'nodegit';

interface Options {
  /** @default false */
  includeLast?: boolean;
}

export default async function getCommitsFromRange(
  repo: Repository,
  from: Commit,
  until: Commit,
  options?: Options,
): Promise<Commit[]> {
  const walker = repo.createRevWalk();
  walker.push(from.id());

  const commits = await walker.getCommitsUntil((nextCommit: Commit) => {
    return nextCommit.sha() !== until.sha();
  });

  return options && options.includeLast ? commits : commits.slice(0, commits.length - 1);
}
