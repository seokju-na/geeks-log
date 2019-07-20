import { Cred, FetchOptions } from 'nodegit';
import { GITHUB_ACCESS_TOKEN } from './constants';

export default function getGitFetchOptions() {
  let tryCount = 0;

  const options: FetchOptions = {
    callbacks: {
      credentials: () => {
        /**
         * libgit2는 인증에 실패하여도 인증 시도를 멈추지 않습니다. 따라서 적절한 조취를 취하지 않으면 우리는 무한 루프에
         * 갇힐 수 있습니다. 만약 5번 보다 더 인증을 시도한 경우 에러를 던져 무한 루프를 빠져나오도록 합니다.
         * 더보기: https://github.com/nodegit/nodegit/issues/1133
         */
        if (tryCount > 5) {
          throw new Error('Authorize failed.');
        }

        tryCount += 1;

        return Cred.userpassPlaintextNew(GITHUB_ACCESS_TOKEN, 'x-oauth-basic');
      },
    },
  };

  return options;
}
