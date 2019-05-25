import NoteEvent from '../events';
import noteAuthorMismatchException from '../exceptions/noteAuthorMismatchException';
import noteContentCannotBeEmptyException from '../exceptions/noteContentCannotBeEmptyException';
import noteUpdateNotExistsException from '../exceptions/noteUpdateNotExistsException';
import Note from '../types/Note';
import NoteSnippet from '../types/NoteSnippet';

interface Params {
  authorId: string;
  note: Note;
  updates: {
    title?: string;
    snippets?: NoteSnippet[];
  };
}

export default function updateNoteCommand({
  authorId,
  note,
  updates: {
    title,
    snippets,
  },
}: Params): NoteEvent[] {
  if (note.authorId !== authorId) {
    throw noteAuthorMismatchException();
  }

  const events: NoteEvent[] = [];

  if (title) {
    events.push({
      type: 'NoteTitleUpdated',
      payload: { title },
    });
  }

  if (snippets) {
    if (snippets.length === 0) {
      throw noteContentCannotBeEmptyException();
    }

    events.push({
      type: 'NoteSnippetsUpdated',
      payload: { snippets },
    });
  }

  if (events.length === 0) {
    throw noteUpdateNotExistsException();
  }

  return events;
}
