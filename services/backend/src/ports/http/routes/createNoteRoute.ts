import * as Joi from '@hapi/joi';
import { Request, RequestHandler, Response } from 'express';
import NoteCommandHandler from '../../../application/command-handlers/NoteCommandHandler';
import CreateNoteDto from '../../../application/dtos/CreateNoteDto';
import Authorizer from '../../../infrastructure/authentication/Authorizer';
import authMiddleware, { getAuthClaimsFromRequest } from '../middlewares/authMiddleware';
import validationMiddleware from '../middlewares/validationMiddleware';

interface Dependencies {
  authorizer: Authorizer;
  noteCommandHandler: NoteCommandHandler;
}

export const bodyValidationSchema = Joi.object().keys({
  title: Joi.string().min(3).max(200).required(),
});

export default function createNoteRoute({
  authorizer,
  noteCommandHandler,
}: Dependencies): RequestHandler[] {
  const createNoteRouter = async (request: Request, response: Response) => {
    const { uid } = getAuthClaimsFromRequest(request)!;
    const payload: CreateNoteDto = {
      ...request.body,
      authorId: uid,
    };

    await noteCommandHandler.handleCreateNoteCommand(payload);

    response.sendStatus(200);
  };

  return [
    authMiddleware({ authorizer }),
    validationMiddleware({
      bodySchema: bodyValidationSchema,
    }),
    createNoteRouter,
  ];
}
