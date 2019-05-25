import NoteEvent from '../events';
import noteContentCannotBeEmptyException from '../exceptions/noteContentCannotBeEmptyException';
import NoteSnippet from '../types/NoteSnippet';

interface Params {
  authorId: string;
  title: string;
  snippets: NoteSnippet[];
}

export default function createNoteCommand({
  authorId,
  title,
  snippets,
}: Params): NoteEvent[] {
  const timestamp = new Date().getTime();

  if (snippets.length === 0) {
    throw noteContentCannotBeEmptyException();
  }

  return [
    {
      type: 'NoteCreated',
      payload: {
        authorId,
        title,
        snippets,
        timestamp,
      },
    },
  ];
}
