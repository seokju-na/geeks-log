import EventStore from '../../infrastructure/eventstore/EventStore';
import Repository from '../../infrastructure/repositories/Repository';

const mockFindOneById = jest.fn();
const mockSave = jest.fn();
const mockCreateNoteCommand = jest.fn();
const mockGetStreamId = jest.fn();

const MockUserRepository = jest.fn<Repository<any>, any>()
  .mockImplementation(() => ({
    findOneById: mockFindOneById,
  }));

const MockEventstore = jest.fn<EventStore, any>()
  .mockImplementation(() => ({
    getById: jest.fn(),
    save: mockSave,
  }));

jest.mock('../../domain/note/commands/createNoteCommand', () => ({
  __esModule: true,
  default: mockCreateNoteCommand,
}));

jest.mock('../utils/streamIdBuilder', () => ({
  generatedNoteStreamId: mockGetStreamId,
}));

import ApplicationException from '../seed-work/ApplicationException';
import NoteCommandHandler from './NoteCommandHandler';

describe('application.commandHandlers.NoteCommandHandler', () => {
  function setupNoteCommandHandler(): NoteCommandHandler {
    return new NoteCommandHandler(
      new MockEventstore(),
      new MockUserRepository(),
    );
  }

  afterEach(jest.clearAllMocks);

  describe('handleCreateNoteCommand', () => {
    test('should throw "UserNotExistsException" if user not exists with authorId.', async () => {
      mockFindOneById.mockImplementationOnce(() => Promise.resolve(null));

      const handler = setupNoteCommandHandler();
      let error = null;

      try {
        await handler.handleCreateNoteCommand({
          authorId: 'seokju-na',
          title: 'This is title',
          snippets: [],
        });
      } catch (err) {
        error = err;
      }

      expect(error instanceof ApplicationException).toBe(true);
    });

    test('should 123', async () => {
      mockFindOneById.mockImplementationOnce(() => Promise.resolve('not null'));
      mockGetStreamId.mockImplementationOnce(() => 'streamId');
      mockCreateNoteCommand.mockImplementationOnce(() => 'events');

      const handler = setupNoteCommandHandler();
      const dto = {
        authorId: 'seokju-na',
        title: 'This is title',
        snippets: [],
      };

      await handler.handleCreateNoteCommand(dto);

      expect(mockCreateNoteCommand).toHaveBeenCalledWith(dto);
      expect(mockSave).toHaveBeenCalledWith('streamId', 'events');
    });
  });
});
