import { Test } from '@nestjs/testing';
import { SpawnOptions } from 'child_process';
import * as path from 'path';
import NoteDummy from '../../domain/note/dummies/NoteDummy';
import generateUniqueId from '../../domain/shared/utils/generateUniqueId';
import environment from '../../environment';
import { EVENTSTORE } from '../../infrastructure/eventstore/injections';
import { STORAGE } from '../../infrastructure/storage/injections';
import { fakeAsync } from '../../testing/fakeAsync';
import MockEventstore from '../../testing/mocks/MockEventstore';
import MockRxChildProcess from '../../testing/mocks/MockRxChildProcess';
import MockStorage from '../../testing/mocks/MockStorage';
import RxChildProcess from '../../utility/RxChildProcess';
import { NoteSnapshotEvent } from '../projection/NoteSnapshotEvent';
import NoteViewerServingSaga from './NoteViewerServingSaga';

xdescribe('port.saga.NoteViewerServingSaga', () => {
  let noteViewerServingSaga: NoteViewerServingSaga;
  let mockRxChildProcess: MockRxChildProcess;
  let mockEventstore: MockEventstore;
  let mockStorage: MockStorage;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockRxChildProcess.provide(),
        MockEventstore.provide(),
        MockStorage.provide(),
        NoteViewerServingSaga,
      ],
    }).compile();

    noteViewerServingSaga = module.get(NoteViewerServingSaga);
    mockRxChildProcess = module.get(RxChildProcess);
    mockEventstore = module.get(EVENTSTORE);
    mockStorage = module.get(STORAGE);
  });

  afterEach(() => {
    mockRxChildProcess.verify();

    mockRxChildProcess.clear();
    mockEventstore.clear();
    mockStorage.clear();
  });

  test('should build and deploy when note creation emitted.', fakeAsync(() => {
    const note = new NoteDummy().create();
    const noteId = generateUniqueId();

    mockEventstore.pushStream('noteSnapshots', {
      type: 'NoteSnapshot',
      payload: {
        noteId,
        note,
        version: 1,
      },
    } as NoteSnapshotEvent);

    const targetTmpPath = path.resolve(environment.noteServingSagaConfig.TMP_PATH, '0/');

    mockRxChildProcess
      .expectFromSpawn([
        'yarn',
        ['build'],
        {
          cwd: targetTmpPath,
          env: {
            VERSION: '1',
            NOTE_DATA: JSON.stringify(note),
          },
        },
      ])
      .flush();

    mockStorage
      .expectUploadDirectory([
        environment.NOTE_SNAPSHOT_BUCKET_NAME,
        `@${note.authorId}/${noteId}/1`,
        path.resolve(targetTmpPath, 'out/'),
      ])
      .flush();

    // Nothing pending jobs left.
    // Route updates
  }));
});
