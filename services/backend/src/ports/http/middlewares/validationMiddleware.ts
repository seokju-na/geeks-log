import { validate, SchemaLike, ValidationError, ValidationOptions } from '@hapi/joi';
import { NextFunction, Request, Response } from 'express';

interface Options {
  paramsSchema?: SchemaLike;
  bodySchema?: SchemaLike;
  querySchema?: SchemaLike;
  validateOptions?: ValidationOptions;
}

export default function validationMiddleware({
  paramsSchema,
  bodySchema,
  querySchema,
  validateOptions,
}: Options) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const [
        paramsResult,
        bodyResult,
        queryResult,
      ] = await Promise.all([
        paramsSchema
          ? validate(request.params, paramsSchema, validateOptions)
          : Promise.resolve(null),
        bodySchema
          ? validate(request.body, bodySchema, validateOptions)
          : Promise.resolve(null),
        querySchema
          ? validate(request.query, querySchema, validateOptions)
          : Promise.resolve(null),
      ]);

      request.params = paramsResult;
      request.body = bodyResult;
      request.query = queryResult;

      next();
    } catch (error) {
      if (isValidationError(error)) {
        response.status(406).send(error.details);
      } else {
        console.error(error);
        response.sendStatus(500);
      }
    }
  };
}

function isValidationError(error: unknown): error is ValidationError {
  return typeof error === 'object' && error !== null && (error as Error).name === 'ValidationError';
}
