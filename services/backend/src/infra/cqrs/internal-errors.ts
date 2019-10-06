export class InvalidCommandHandlerError extends Error {
  constructor() {
    super(`Invalid command handler error (missing @CommandHandler() decorator?)`);
  }
}

export class InvalidQueryHandlerError extends Error {
  constructor() {
    super(`Invalid query handler error (missing @QueryHandler() decorator?)`);
  }
}

export class InvalidSagaError extends Error {
  constructor() {
    super(`Invalid saga error. Each saga should return an Observable object`);
  }
}
