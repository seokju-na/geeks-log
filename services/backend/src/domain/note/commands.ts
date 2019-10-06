import { props } from '@geeks-log/event-system';
import { NoteSnippet } from '@geeks-log/note';
import { Patches } from '@geeks-log/note/dist/types';
import { CommandExecutor, createCommand, createTimestamp, EventTypeOf } from '../core';
import { UserId } from '../user';
import { noteCreatedEvent, noteSnippetsUpdatedEvent, noteTitleUpdatedEvent } from './events';
import { createNoteId, NoteId } from './types';

export const createNoteCommand = createCommand(
  'note.createNote',
  props<{ authorId: UserId; title: string; snippets: NoteSnippet[] }>(),
);

export const updateNoteSnippetsCommand = createCommand(
  'note.updateNoteSnippets',
  props<{ noteId: NoteId; patches: Patches }>(),
);

export const updateNoteTitleCommand = createCommand(
  'note.updateNoteTitle',
  props<{ noteId: NoteId; title: string }>(),
);

export const execCreateNoteCommand: CommandExecutor<
  typeof createNoteCommand,
  [EventTypeOf<typeof noteCreatedEvent>]
> = command => {
  const id = createNoteId();
  const { authorId, title, snippets } = command;
  const timestamp = createTimestamp();

  return [
    noteCreatedEvent({
      id,
      title,
      authorId,
      snippets,
      createdTimestamp: timestamp,
      updatedTimestamp: timestamp,
    }),
  ];
};

export const execUpdateNoteSnippetsCommand: CommandExecutor<
  typeof updateNoteSnippetsCommand,
  [EventTypeOf<typeof noteSnippetsUpdatedEvent>]
> = command => {
  const { patches } = command;
  const timestamp = createTimestamp();

  return [noteSnippetsUpdatedEvent({ patches, updatedTimestamp: timestamp })];
};

export const execUpdateNoteTitleCommand: CommandExecutor<
  typeof updateNoteTitleCommand,
  [EventTypeOf<typeof noteTitleUpdatedEvent>]
> = command => {
  const { title } = command;
  const timestamp = createTimestamp();

  return [noteTitleUpdatedEvent({ title, updatedTimestamp: timestamp })];
};
