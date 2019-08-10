import { CreateLocalUserCommand } from './create-local-user-command';
import { UserLoginCommand } from './user-login-command';

export * from './create-local-user-command';
export * from './user-login-command';

export type UserCommands =
  CreateLocalUserCommand
  | UserLoginCommand;
