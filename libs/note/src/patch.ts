import isEqual from 'lodash.isequal';
import * as api from './api';
import { NoteSnippet, Patch, Patches } from './types';

function isMetadataChanged(prev: NoteSnippet, next: NoteSnippet) {
  if (prev.metadata && next.metadata) {
    return !isEqual(prev.metadata, next.metadata);
  }
  return false;
}

function makeMetadataPatch(next: NoteSnippet) {
  if (next.metadata) {
    return next.metadata;
  }

  return undefined;
}

export function makePatches(
  prevSnippets: NoteSnippet[],
  nextSnippets: NoteSnippet[],
) {
  const patches: Patches = {};
  const length = Math.max(prevSnippets.length, nextSnippets.length);
  const ensurePatchList = (index: number) => {
    if (patches[index] === undefined) {
      patches[index] = [];
    }
  };

  for (let i = 0; i < length; i += 1) {
    const prev = prevSnippets[i];
    const next = nextSnippets[i];

    if (prev === undefined && next !== undefined) {
      ensurePatchList(i);
      patches[i].push({
        type: 'added',
        snippetType: next.type,
        valuePatch: api.makePatch('', next.value),
        metadata: makeMetadataPatch(next),
      });
    } else if (prev !== undefined && next === undefined) {
      ensurePatchList(i);
      patches[i].push({
        type: 'deleted',
      });
    } else if (prev !== undefined && next !== undefined) {
      ensurePatchList(i);

      if (prev.type === next.type) {
        const valuePatch = api.makePatch(prev.value, next.value);

        if (isMetadataChanged(prev, next) || valuePatch.length > 0) {
          patches[i].push({
            type: 'changed',
            valuePatch: api.makePatch(prev.value, next.value),
            metadata: makeMetadataPatch(next),
          });
        }
      } else {
        patches[i].push(
          {
            type: 'deleted',
          },
          {
            type: 'added',
            snippetType: next.type,
            valuePatch: api.makePatch('', next.value),
            metadata: makeMetadataPatch(next),
          },
        );
      }
    }
  }

  return patches;
}

function applyPatch(
  snippets: NoteSnippet[],
  index: number,
  patch: Patch,
) {
  switch (patch.type) {
    case 'added':
      snippets[index] = {
        type: patch.snippetType,
        value: api.applyPatch('', patch.valuePatch),
        metadata: patch.metadata,
      };
      break;
    case 'deleted':
      snippets[index] = null;
      break;
    case 'changed':
      if (snippets[index] == null) {
        throw new Error(`Cannot apply changed patch null or undefined on index: ${index}`);
      }

      snippets[index].value = api.applyPatch(
        snippets[index].value,
        patch.valuePatch,
      );

      if (patch.metadata) {
        snippets[index].metadata = patch.metadata;
      }
      break;
  }
}

export function applyPatches(
  prevSnippets: NoteSnippet[],
  patches: Patches,
) {
  const snippets = [...prevSnippets];

  for (const index of Object.keys(patches)) {
    for (const patch of patches[+index]) {
      applyPatch(snippets, +index, patch);
    }
  }

  return snippets.filter(s => s != null);
}
