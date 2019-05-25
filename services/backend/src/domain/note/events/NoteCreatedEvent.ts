import Event from '../../seed-work/Event';
import NoteSnippet from '../types/NoteSnippet';

export default interface NoteCreatedEvent extends Event {
  type: 'NoteCreated';
  payload: {
    authorId: string;
    title: string;
    snippets: NoteSnippet[];
    timestamp: number;
  };
}
