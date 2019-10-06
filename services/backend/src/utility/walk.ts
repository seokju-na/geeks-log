import * as klaw from 'klaw';
import { streamToRx } from 'rxjs-stream';

export type WalkItem = klaw.Item;

export type WalkIgnoreFilter = (pathname: string) => boolean;

export interface WalkOptions {
  /** @default -1 */
  depthLimit?: number;
  ignoreFilter?: WalkIgnoreFilter;
}

export function walkDirectory(directoryPath: string, options: WalkOptions = {}) {
  const { depthLimit = -1, ignoreFilter } = options;
  const walker = klaw(directoryPath, { depthLimit, filter: ignoreFilter });

  return streamToRx<WalkItem>(walker as any);
}
