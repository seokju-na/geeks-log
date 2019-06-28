import { Module } from '@nestjs/common';
import NoteCommandHandler from '../../application/command-handlers/NoteCommandHandler';
import EventstoreModule from '../../infrastructure/eventstore/EventstoreModule';
import NoteController from './controllers/NoteController';

@Module({
  imports: [
    EventstoreModule,
  ],
  controllers: [
    NoteController,
  ],
  providers: [
    NoteCommandHandler,
  ],
})
export default class ServerModule {
}
