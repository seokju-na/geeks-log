import { sync } from 'conventional-commits-parser';
import { Commit } from 'nodegit';
import BumpType from '../models/BumpType';

function getCommitInfo(commit: Commit) {
  return sync(commit.message(), {
    headerPattern: /^(\w*)(?:\((.*)\))?: (.*)$/,
    headerCorrespondence: [`type`, `scope`, `subject`],
    noteKeywords: [`BREAKING CHANGE`],
    revertPattern: /^revert:\s([\s\S]*?)\s*This reverts commit (\w*)\./,
    revertCorrespondence: [`header`, `hash`],
  });
}

export default function getBumpTypeFromCommits(commits: Commit[]): BumpType {
  const commitLevelInfos = commits.map(getCommitInfo).map(({ notes, type }) => {
    if (notes.length > 0) {
      return { level: 0, breakings: notes.length };
    }

    if (type === 'feat') {
      return { level: 1, features: 1 };
    }

    return { level: 2 };
  });

  const bumpLevel = Math.min(...commitLevelInfos.map(info => info.level), 2);

  if (bumpLevel === 0) {
    return BumpType.Major;
  } else if (bumpLevel === 1) {
    return BumpType.Minor;
  } else {
    return BumpType.Patch;
  }
}
