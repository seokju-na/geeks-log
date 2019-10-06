import { NoteSnippet, Patches } from '@geeks-log/note';
import { props } from '@geeks-log/event-system';
import { createEvent } from '../core';

export const noteCreatedEvent = createEvent(
  'note.noteCreated',
  props<{
    id: string;
    authorId: string;
    title: string;
    snippets: NoteSnippet[];
    createdTimestamp: string;
    updatedTimestamp: string;
  }>(),
);

export const noteTitleUpdatedEvent = createEvent(
  'note.titleUpdated',
  props<{
    title: string;
    updatedTimestamp: string;
  }>(),
);

export const noteSnippetsUpdatedEvent = createEvent(
  'note.snippetsUpdated',
  props<{
    patches: Patches;
    updatedTimestamp: string;
  }>(),
);
