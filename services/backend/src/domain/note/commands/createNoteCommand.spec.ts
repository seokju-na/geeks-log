import { createDummies } from '../../../testing/dummies';
import NoteSnippetDummy from '../dummies/NoteSnippetDummy';
import noteContentCannotBeEmptyException from '../exceptions/noteContentCannotBeEmptyException';
import createNoteCommand from './createNoteCommand';

const noteSnippetDummy = new NoteSnippetDummy();

describe('domain.note.commands.createNoteCommand', () => {
  test('should throw "noteContentCannotBeEmptyException" exception if note snippets is ' +
    'empty.', () => {
    expect(() => createNoteCommand({
      authorId: 'seokju-na',
      title: 'Hey yo',
      snippets: [],
    })).toThrowError(noteContentCannotBeEmptyException());
  });

  test('should return ["NoteCreated"] events.', () => {
    const [event] = createNoteCommand({
      authorId: 'seokju-na',
      title: 'This is title',
      snippets: createDummies(noteSnippetDummy, 10),
    });

    expect(event.type).toEqual('NoteCreated');
  });
});
