import NoteEvent from '../events';
import NoteCreatedEvent from '../events/NoteCreatedEvent';
import Note from '../types/Note';

function createNoteFromNoteCreatedEvent(event: NoteCreatedEvent): Note {
  return {
    authorId: event.payload.authorId,
    title: event.payload.title,
    snippets: [...event.payload.snippets],
    createdTimestamp: event.payload.timestamp,
    updatedTimestamp: event.payload.timestamp,
  };
}

export default function noteReducer(events: NoteEvent[], state?: Note): Note {
  const note = state === undefined && events[0].type === 'NoteCreated'
    ? createNoteFromNoteCreatedEvent(events[0] as NoteCreatedEvent)
    : state!;

  if (!note) {
    throw new Error();
  }

  return events.reduce<Note>((previousNote, event) => {
    switch (event.type) {
      case 'NoteCreated':
        return {
          authorId: event.payload.authorId,
          title: event.payload.title,
          snippets: [...event.payload.snippets],
          createdTimestamp: event.payload.timestamp,
          updatedTimestamp: event.payload.timestamp,
        };
      case 'NoteSnippetsUpdated':
        return {
          ...previousNote,
          snippets: [...event.payload.snippets],
          updateTimestamp: event.payload.timestamp,
        };
      case 'NoteTitleUpdated':
        return {
          ...previousNote,
          title: event.payload.title,
          updatedTimestamp: event.payload.timestamp,
        };
      default:
        return previousNote;
    }
  }, note);
}
