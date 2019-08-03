import { isPathMatch } from './paths';

describe('paths', () => {
  test('should matches', () => {
    const matches = [
      '/_next*',
    ];

    expect(isPathMatch('/_next', matches)).toBe(true);
    expect(isPathMatch('/', matches)).toBe(false);
  });
});
