import NoteCreatedEvent from './NoteCreatedEvent';
import NoteSnippetsUpdatedEvent from './NoteSnippetsUpdatedEvent';
import NoteTitleUpdatedEvent from './NoteTitleUpdatedEvent';

type NoteEvent =
  NoteCreatedEvent
  | NoteSnippetsUpdatedEvent
  | NoteTitleUpdatedEvent;

export default NoteEvent;
