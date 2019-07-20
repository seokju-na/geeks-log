import { Commit, Repository } from 'nodegit';

interface Options {
  /** @default false */
  includeLast?: boolean;
}

function isCommit(commit: Commit | string): commit is Commit {
  return typeof commit !== 'string';
}

export default async function getCommitsFromRange(
  repo: Repository,
  head: Commit,
  untilCommitOrMessage: Commit | string,
  options?: Options,
): Promise<Commit[]> {
  const walker = repo.createRevWalk();
  walker.push(head.id());

  const commits = await walker.getCommitsUntil((nextCommit: Commit) => {
    if (isCommit(untilCommitOrMessage)) {
      return nextCommit.sha() !== untilCommitOrMessage.sha();
    }
    return !nextCommit.message().includes(untilCommitOrMessage);
  });

  return options && options.includeLast ? commits : commits.slice(0, commits.length - 1);
}
