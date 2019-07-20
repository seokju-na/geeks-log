import { Remote } from 'nodegit';
import getFetchOptions from './getFetchOptions';

export default async function pushRefs(remote: Remote, refs: string[]) {
  const pushTargets = refs.map(ref => {
    if (ref === 'refs/heads/master') {
      return `HEAD:${ref}`;
    }

    return `${ref}:${ref}`;
  });

  await remote.push(pushTargets, getFetchOptions());
}
