import NoteSnippet from './NoteSnippet';

export default interface Note {
  id: string;
  authorId: string;
  title: string;
  snippets: NoteSnippet[];
  createdTimestamp: number;
  updatedTimestamp: number;
}
