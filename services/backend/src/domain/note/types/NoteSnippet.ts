import { LanguageStack } from '../../stack/types/Stack';

interface NoteSnippetPrototype {
  value: string;
}

export interface TextNoteSnippet extends NoteSnippetPrototype {
  type: 'text';
}

export interface CodeNoteSnippet extends NoteSnippetPrototype {
  type: 'code';
  language?: LanguageStack['id'];
  fileName?: string;
}

type NoteSnippet = TextNoteSnippet | CodeNoteSnippet;
export default NoteSnippet;
