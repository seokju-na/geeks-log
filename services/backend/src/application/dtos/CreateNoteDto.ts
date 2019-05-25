import NoteSnippet from '../../domain/note/types/NoteSnippet';

export default interface CreateNoteDto {
  authorId: string;
  title: string;
  snippets: NoteSnippet[];
}
