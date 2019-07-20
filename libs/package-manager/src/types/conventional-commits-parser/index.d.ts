declare module 'conventional-commits-parser' {
  interface Options {
    mergePattern: RegExp | string | null;
    mergeCorrespondence: string[] | string | null;
    headerPattern: RegExp | string;
    headerCorrespondence: string[] | string;
    referenceActions: string[] | string;
    issuePrefixes: string[] | string;
    noteKeywords: string[] | string;
    fieldPattern: RegExp | string;
    revertPattern: RegExp | string;
    revertCorrespondence: string[] | string;
    commentChar: string | null;
    warn: Function | boolean;
  }

  interface ParseResult {
    type: string;
    scope: string;
    subject: string;
    header: string;
    body: string | null;
    footer: string | null;
    notes: string[];
    references: {
      action: string;
      owner: string | null;
      repository: string | null;
      issue: string;
      raw: string;
    }[];
    revert: string | null;
  }

  export function sync(commit: string, options: Partial<Options>): ParseResult;
}
