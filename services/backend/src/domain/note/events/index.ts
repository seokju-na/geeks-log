import NoteCreatedEvent from './NoteCreatedEvent';
import NoteSnippetsUpdatedEvent from './NoteSnippetsUpdatedEvent';
import NoteTitleUpdatedEvent from './NoteTitleUpdatedEvent';

type NoteEvent =
  NoteCreatedEvent
  | NoteTitleUpdatedEvent
  | NoteSnippetsUpdatedEvent;

export default NoteEvent;
