import { createDummies } from '../../../testing/dummies';
import NoteDummy from '../dummies/NoteDummy';
import NoteSnippetDummy from '../dummies/NoteSnippetDummy';
import NoteSnippetsUpdatedEvent from '../events/NoteSnippetsUpdatedEvent';
import NoteTitleUpdatedEvent from '../events/NoteTitleUpdatedEvent';
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
    const [event] = updateNoteCommand({
      authorId: note.authorId,
      note,
      updates: {
        title: 'MyNewTitle',
      },
    }) as [NoteTitleUpdatedEvent];

    expect(event.type).toEqual('NoteTitleUpdated');
    expect(event.payload.title).toEqual('MyNewTitle');
    expect(event.payload.timestamp).toBeDefined();
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
    const [event] = updateNoteCommand({
      authorId: note.authorId,
      note,
      updates: {
        snippets: newSnippets,
      },
    }) as [NoteSnippetsUpdatedEvent];

    expect(event.type).toEqual('NoteSnippetsUpdated');
    expect(event.payload.snippets).toEqual(newSnippets);
    expect(event.payload.timestamp).toBeDefined();
  });

  test('should return ["NoteTitleUpdated", "NoteSnippetsUpdated"] event if ' +
    'title and snippets are updated.', () => {
    const note = noteDummy.create();
    const newSnippets = createDummies(noteSnippetDummy, 5);

    const [
      titleUpdatedEvent,
      snippetsUpdatedEvent,
    ] = updateNoteCommand({
      authorId: note.authorId,
      note,
      updates: {
        title: 'ThisIsNewTitle',
        snippets: newSnippets,
      },
    }) as [NoteTitleUpdatedEvent, NoteSnippetsUpdatedEvent];

    expect(titleUpdatedEvent.type).toEqual('NoteTitleUpdated');
    expect(snippetsUpdatedEvent.type).toEqual('NoteSnippetsUpdated');
  });
});
