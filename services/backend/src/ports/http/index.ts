import * as cors from 'cors';
import * as express from 'express';
import { Router } from 'express';
import { https } from 'firebase-functions';
import NoteCommandHandler from '../../application/command-handlers/NoteCommandHandler';
import FirebaseAuthorizer from '../../infrastructure/authentication/FirebaseAuthorizer';
import GYEventStore from '../../infrastructure/eventstore/GYEventStore';
import FirebaseUserRepository from '../../infrastructure/repositories/FirebaseUserRepository';
import createNoteRoute from './routes/createNoteRoute';

// Dependencies
const authorizer = new FirebaseAuthorizer();
const userRepository = new FirebaseUserRepository();
const eventstore = new GYEventStore({ url: '123' });

// Command handlers
const noteCommandHandler = new NoteCommandHandler(eventstore, userRepository);

function createHandler(router: Router) {
  const handler = express();
  handler.use(cors());
  handler.use(router);

  return handler;
}

const noteRouter = Router();
noteRouter.post('/', ...createNoteRoute({ authorizer, noteCommandHandler }));
noteRouter.get('/', (_, res) => {
  res.send({ message: 'hello' });
});

// Path: /note
export const note = https.onRequest(createHandler(noteRouter));
