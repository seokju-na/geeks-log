import Note from '../../domain/note/types/Note';
import Event from '../../domain/seed-work/Event';

export interface NoteSnapshotEvent extends Event {
  type: 'NoteSnapshot';
  payload: {
    noteId: string;
    note: Note;
    version: number;
  };
}
