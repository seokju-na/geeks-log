import { props } from '@geeks-log/event-system';
import { createEvent } from 'domain/core';
import { Note } from 'domain/note';

export enum AppEventTypes {
  PUBLISH_NOTE_STARTED = 'app.publishNoteStarted',
  PUBLISH_NOTE_COMPLETED = 'app.publishNoteCompleted',
  PUBLISH_NOTE_FAILED = 'app.publishNoteFailed',
}

export const publishingNoteStartedEvent = createEvent(
  'app.note.publishingNoteStarted',
  props<{ publishId: string; note: Note }>(),
);
