import path from 'path';
import getUpdatedPackagesInPR from '../src/getUpdatedPackagesInPR';

describe('getUpdatedPackagesInPR', () => {
  const repo = path.resolve(__dirname, 'fixtures/updated-packages-in-pr/_git');

  test('should get packages.', async () => {
    const packages = await getUpdatedPackagesInPR(repo);

    expect(packages.sort()).toEqual(['libs/lib-a', 'libs/lib-b']);
  });
});
