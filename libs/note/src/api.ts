import { diff_match_patch as API } from 'diff_match_patch';

const api = new API();

export function makePatch(source: string, dist: string): any {
  return api.patch_make(source, dist);
}

export function applyPatch(source: string, patch: any): string {
  return api.patch_apply(patch, source)[0];
}
