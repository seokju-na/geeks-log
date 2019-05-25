import { createDummies } from '../../../testing/dummies';
import NoteDummy from '../dummies/NoteDummy';
import NoteSnippetDummy from '../dummies/NoteSnippetDummy';
import noteAuthorMismatchException from '../exceptions/noteAuthorMismatchException';
import noteContentCannotBeEmptyException from '../exceptions/noteContentCannotBeEmptyException';
import noteUpdateNotExistsException from '../exceptions/noteUpdateNotExistsException';
import updateNoteCommand from './updateNoteCommand';

const noteDummy = new NoteDummy();
const noteSnippetDummy = new NoteSnippetDummy();

describe('domain.note.command.updateNoteCommand', () => {
  test('should throw "noteAuthorMismatchException" if author is not matched.', () => {
    const note = noteDummy.create();

    expect(
      () => updateNoteCommand({
        authorId: 'THIS_IS_NOT_AN_AUTHOR',
        note,
        updates: {
          title: 'newTitle',
        },
      }),
    ).toThrowError(noteAuthorMismatchException());
  });

  test('should throw "noteUpdateNotExistsException" if updates is empty.', () => {
    const note = noteDummy.create();

    expect(
      () => updateNoteCommand({
        authorId: note.authorId,
        note,
        updates: {},
      }),
    ).toThrowError(noteUpdateNotExistsException());
  });

  test('should return ["NoteTitleUpdated"] event if only title is updated.', () => {
    const note = noteDummy.create();

    expect(updateNoteCommand({
      authorId: note.authorId,
      note,
      updates: {
        title: 'MyNewTitle',
      },
    })).toEqual([
      {
        type: 'NoteTitleUpdated',
        payload: { title: 'MyNewTitle' },
      },
    ]);
  });

  test('should throw "noteContentCannotBeEmptyException" exception if update snippets is ' +
    'empty.', () => {
    const note = noteDummy.create();

    expect(() => updateNoteCommand({
      authorId: note.authorId,
      note,
      updates: {
        snippets: [],
      },
    })).toThrowError(noteContentCannotBeEmptyException());
  });

  test('should return ["NoteSnippetsUpdated"] event if only snippets are updated.', () => {
    const note = noteDummy.create();
    const newSnippets = createDummies(noteSnippetDummy, 5);

    expect(updateNoteCommand({
      authorId: note.authorId,
      note,
      updates: {
        snippets: newSnippets,
      },
    })).toEqual([
      {
        type: 'NoteSnippetsUpdated',
        payload: { snippets: newSnippets },
      },
    ]);
  });

  test('should return ["NoteTitleUpdated", "NoteSnippetsUpdated"] event if ' +
    'title and snippets are updated.', () => {
    const note = noteDummy.create();
    const newSnippets = createDummies(noteSnippetDummy, 5);

    expect(updateNoteCommand({
      authorId: note.authorId,
      note,
      updates: {
        title: 'ThisIsNewTitle',
        snippets: newSnippets,
      },
    })).toEqual([
      {
        type: 'NoteTitleUpdated',
        payload: {
          title: 'ThisIsNewTitle',
        },
      },
      {
        type: 'NoteSnippetsUpdated',
        payload: {
          snippets: newSnippets,
        },
      },
    ]);
  });
});
