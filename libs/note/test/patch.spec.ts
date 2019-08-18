import { applyPatches, ChangedPatch, makePatches, NoteSnippet } from '../src';

describe('patch', () => {
  describe('makePatches', () => {
    test('1', () => {
      const prevSnippets = [
        {
          type: 'text',
          value: '123123',
        },
        {
          type: 'text',
          value: '1',
        },
      ] as NoteSnippet[];

      const nextSnippets = [
        prevSnippets[0],
        {
          type: 'code',
          value: 'value',
          metadata: {
            languageId: '123',
          },
        },
        {
          type: 'text',
          value: '456',
        },
      ] as NoteSnippet[];

      const patches = makePatches(prevSnippets, nextSnippets);
      expect(patches[0]).toEqual([]);
      expect(patches[1][0].type).toEqual('deleted');
      expect(patches[1][1].type).toEqual('added');
      expect(patches[2][0].type).toEqual('added');

      const result = applyPatches(prevSnippets, patches);
      expect(result).toEqual(nextSnippets);
    });

    test('2', () => {
      const prevSnippets = [
        {
          type: 'code',
          value: '1',
          metadata: {
            filename: '1',
          },
        },
      ] as NoteSnippet[];

      const nextSnippets = [
        {
          type: 'code',
          value: 'value',
          metadata: {
            languageId: '123',
            filename: '456',
          },
        },
      ] as NoteSnippet[];

      const patches = makePatches(prevSnippets, nextSnippets);
      expect(patches[0][0].type).toEqual('changed');
      expect((patches[0][0] as ChangedPatch).metadata).toEqual(nextSnippets[0].metadata);

      const result = applyPatches(prevSnippets, patches);
      expect(result).toEqual(nextSnippets);
    });

    test('not changed', () => {
      const snippets = [
        {
          type: 'code',
          value: '1',
          metadata: {
            filename: '1',
          },
        },
      ] as NoteSnippet[];

      const patches = makePatches(snippets, snippets);
      expect(patches).toEqual({ [0]: [] });
    });
  });
});
