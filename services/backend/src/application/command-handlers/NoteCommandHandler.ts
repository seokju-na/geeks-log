import createNoteCommand from '../../domain/note/commands/createNoteCommand';
import EventStore from '../../infrastructure/eventstore/EventStore';
import Repository from '../../infrastructure/repositories/Repository';
import CreateNoteDto from '../dtos/CreateNoteDto';
import userNotExistsException from '../exceptions/userNotExistsException';
import { generatedNoteStreamId } from '../utils/streamIdBuilder';

export default class NoteCommandHandler {
  constructor(
    private eventStore: EventStore,
    private userRepository: Repository<any>,
  ) {
  }

  async handleCreateNoteCommand({ authorId, title, snippets }: CreateNoteDto) {
    if (await this.userRepository.findOneById(authorId) === null) {
      throw userNotExistsException();
    }

    const streamId = generatedNoteStreamId();
    const events = createNoteCommand({ authorId, title, snippets });

    await this.eventStore.save(streamId, events);
  }
}
