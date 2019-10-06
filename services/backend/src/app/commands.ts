import { props } from '@geeks-log/event-system';
import { CommandExecutor, createId, EventTypeOf, createCommand } from 'domain/core';
import { Note } from 'domain/note';
import { publishingNoteStartedEvent } from './events';

export const publishNoteCommand = createCommand(
  'app.note.publishNote',
  props<{ noteId: string; note: Note }>(),
);

export const execPublishNoteCommand: CommandExecutor<
  typeof publishNoteCommand,
  [EventTypeOf<typeof publishingNoteStartedEvent>]
> = command => {
  const { note } = command;

  return [
    publishingNoteStartedEvent({
      publishId: createId(),
      note,
    }),
  ];
};
