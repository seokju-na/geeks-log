import { Inject, Injectable } from '@nestjs/common';
import createNoteCommand from '../../domain/note/commands/createNoteCommand';
import Eventstore from '../../infrastructure/eventstore/Eventstore';
import { EVENTSTORE } from '../../infrastructure/eventstore/injections';

@Injectable()
export default class NoteCommandHandler {
  constructor(
    @Inject(EVENTSTORE) private readonly eventstore: Eventstore,
  ) {
  }

  async handleCreateNoteCommand(dto: any) {
    const events = createNoteCommand();
  }
}
