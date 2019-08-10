import axios from 'axios';
import { NextPageContext } from 'next';
import { queryUserAuthFromContext } from './user-auth';

interface ServerHttpClientOptions {
  apiUrl: string;
  context: NextPageContext;
}

export function createHttpClientForServer({ apiUrl, context }: ServerHttpClientOptions) {
  const userAuth = queryUserAuthFromContext(context);

  return axios.create({
    baseURL: apiUrl,
    headers: userAuth !== null
      ? { Authorization: `Bearer ${userAuth.token}` }
      : {},
  });
}

export function createHttpClientForClient() {
  return axios.create({
    baseURL: '/_api',
  });
}
