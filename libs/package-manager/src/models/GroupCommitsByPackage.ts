import { Commit } from 'nodegit';

export default interface GroupCommitsByPackage {
  [packageName: string]: Commit[];
}
