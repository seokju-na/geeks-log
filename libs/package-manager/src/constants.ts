import { Commit } from 'nodegit';

export const DEPLOY_COMMIT_MESSAGE = 'chore: Bump version [skip ci]';
export const KNOWN_IGNORE_COMMIT_MESSAGES = [
  'Merge branch',
  DEPLOY_COMMIT_MESSAGE,
  '[skip ci]',
];

export function filterIgnoreCommits(commit: Commit) {
  return !KNOWN_IGNORE_COMMIT_MESSAGES.some(message => commit.message().includes(message));
}

export const ROOT_PACKAGE = '.';
