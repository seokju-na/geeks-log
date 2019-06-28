import Event from '../../seed-work/Event';
import NoteSnippet from '../types/NoteSnippet';

export default interface NoteSnippetsUpdatedEvent extends Event {
  type: 'NoteSnippetsUpdated';
  payload: {
    snippets: NoteSnippet[];
    timestamp: number;
  };
}
