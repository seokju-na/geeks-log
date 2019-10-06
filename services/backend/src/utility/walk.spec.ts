import * as path from 'path';
import { last, scan } from 'rxjs/operators';
import { walkDirectory, WalkItem } from './walk';

const fixturePath = path.resolve(__dirname, '../testing/fixtures/walk-directory');

describe('utility.walk', () => {
  describe('walkDirectory', () => {
    test('should work correctly', async () => {
      const items = await walkDirectory(fixturePath)
        .pipe(
          scan((acc, item) => [...acc, item], [] as WalkItem[]),
          last(),
        )
        .toPromise();

      const matches = [
        { path: '.', type: 'directory' },
        { path: 'dir1', typ: 'directory' },
        { path: 'dir3', typ: 'directory' },
        { path: 'dir1/file1', typ: 'file' },
        { path: 'dir3/dir1', typ: 'directory' },
        { path: 'dir3/file2', typ: 'file' },
        { path: 'dir3/dir1/file3', typ: 'file' },
      ];

      for (const match of matches) {
        const matchPath = path.resolve(fixturePath, match.path);
        const item = items.find(i => i.path === matchPath);

        if (item === undefined) {
          throw new Error(`${matchPath} does not exists.`);
        }

        if (match.type === 'directory') {
          expect(item.stats.isDirectory()).toBe(true);
        } else if (match.type === 'file') {
          expect(item.stats.isFile()).toBe(true);
        }
      }
    });
  });
});
