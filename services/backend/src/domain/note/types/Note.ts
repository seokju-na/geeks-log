import NoteSnippet from './NoteSnippet';

export default interface Note {
  authorId: string;
  title: string;
  snippets: NoteSnippet[];
  createdTimestamp: number;
  updatedTimestamp: number;
}
