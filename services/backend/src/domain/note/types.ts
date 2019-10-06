import { NoteSnippet } from '@geeks-log/note';
import { createId } from '../core';

export type NoteId = string;

export function createNoteId(): NoteId {
  return `note-${createId()}`;
}

export interface Note {
  title: string;
  authorId: string;
  snippets: NoteSnippet[];
  createdTimestamp: string;
  updatedTimestamp: string;
}
