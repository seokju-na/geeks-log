import { Repository } from 'nodegit';
import path from "path";
import getMergeBaseCommit from '../src/getMergeBaseCommit';

describe('getMergeBaseCommit', () => {
  const repoDirPath = path.resolve(__dirname, 'fixtures/updated-packages-in-pr/_git');

  test('should get merge base commit.', async () => {
    const repo = await Repository.open(repoDirPath);
    const masterCommit = await repo.getMasterCommit();
    const headCommit = await repo.getHeadCommit();

    const mergeBaseCommit = await getMergeBaseCommit(repo, masterCommit, headCommit);

    expect(mergeBaseCommit.message().includes('lib-a: B')).toBe(true);
  });
});
