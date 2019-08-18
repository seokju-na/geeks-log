interface NoteSnippetBase {
  value: string;
  metadata?: any;
}

export interface NoteTextSnippet extends NoteSnippetBase {
  type: 'text';
}

export interface NoteCodeSnippet extends NoteSnippetBase {
  type: 'code';
  metadata?: {
    languageId?: string;
    filename?: string;
  };
}
export type NoteSnippet = NoteTextSnippet | NoteCodeSnippet;

export interface AddedPatch {
  type: 'added';
  snippetType: NoteSnippet['type'];
  valuePatch: any;
  metadata: NoteSnippet['metadata'];
}

export interface DeletedPatch {
  type: 'deleted';
}

export interface ChangedPatch {
  type: 'changed';
  valuePatch: any;
  metadata: NoteSnippet['metadata'];
}

export type Patch = AddedPatch | DeletedPatch | ChangedPatch;

export interface Patches {
  [index: number]: Patch[];
}
