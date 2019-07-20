import { Repository } from 'nodegit';
import getFetchOptions from './getFetchOptions';

interface Options {
  /** @default false */
  throwError?: boolean;
}

export default async function syncRepository(
  repo: Repository,
  from: string,
  to: string,
  options?: Options,
) {
  const fetchOptions = getFetchOptions();

  try {
    await repo.fetchAll(fetchOptions);
    await repo.mergeBranches(to, from);
  } catch (error) {
    if (options && options.throwError) {
      throw error;
    }
    console.warn(error.message);
  }
}
