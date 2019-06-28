import { Controller, Post } from '@nestjs/common';
import NoteCommandHandler from '../../../application/command-handlers/NoteCommandHandler';

@Controller('note')
export default class NoteController {
  constructor(
    private readonly noteCommandHandler: NoteCommandHandler,
  ) {
  }

  @Post('/')
  async createNote() {
    await this.noteCommandHandler.handleCreateNoteCommand(1);
  }
}
