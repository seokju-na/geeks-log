import { IncomingMessage } from 'http';
import { NextPageContext } from 'next';

export interface UserAuth {
  id: string;
  email: string;
  name: string;
  token: string;
}

class RequestWithUserAuth extends IncomingMessage {
  userAuth?: UserAuth;
}

export interface ContextWithUserAuth extends NextPageContext {
  req?: RequestWithUserAuth;
}
