import { Cred, FetchOptions } from 'nodegit';
import { GITHUB_ACCESS_TOKEN } from '../environment';

export default function getFetchOptions(): FetchOptions {
  let tryCount = 0;

  return {
    callbacks: {
      certificateCheck: function () {
        return 0;
      },
      credentials: function () {
        if (tryCount > 5) {
          throw new Error('Authorize error');
        }

        tryCount += 1;

        return Cred.userpassPlaintextNew(GITHUB_ACCESS_TOKEN, 'x-oauth-basic');
      },
    },
  };
}
