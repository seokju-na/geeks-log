import { Commit } from 'nodegit';
import { EOL } from 'os';
import PackageInfo from '../models/PackageInfo';

function getPureCommitMessage(commitMessage: string) {
  const match = /:\s(.+?)$/.exec(commitMessage);

  if (match === null) {
    return commitMessage;
  }

  return match[1];
}

function groupCommitMessages(commitMessages: string[]) {
  const featMessages: string[] = [];
  const fixMessages: string[] = [];
  const otherMessages: string[] = [];

  for (const commitMessage of commitMessages) {
    const messageItem = getPureCommitMessage(commitMessage);

    if (commitMessage.startsWith('feat')) {
      featMessages.push(messageItem);
    } else if (commitMessage.startsWith('fix')) {
      fixMessages.push(messageItem);
    } else {
      otherMessages.push(messageItem);
    }
  }

  return {
    feat: featMessages,
    fix: fixMessages,
    others: otherMessages,
  };
}

function formatCommitMessages(title: string, commitMessages: string[]) {
  if (commitMessages.length === 0) {
    return '';
  }

  return [title, '', ...commitMessages.map(item => `- ${item}`), ''].join(EOL);
}

export default function createTagMessageForVersionBumping(pkg: PackageInfo, commits: Commit[]) {
  const commitMessages = commits.map(x => x.message());
  const { feat, fix, others } = groupCommitMessages(commitMessages);

  return [
    `${pkg.pkgName} Release`,
    '',
    feat.length > 0 ? formatCommitMessages('## New features', feat) : undefined,
    fix.length > 0 ? formatCommitMessages('## Bug Fixes', fix) : undefined,
    others.length > 0 ? formatCommitMessages('## Others', others) : undefined,
  ].filter(message => message !== undefined).join(EOL);
}
