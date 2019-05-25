import Dummy, { StringIdDummy, TextDummy } from '../../../testing/dummies';
import NoteSnippet from '../types/NoteSnippet';

interface Options {
  type: NoteSnippet['type'];
}

export default class NoteSnippetDummy extends Dummy<NoteSnippet> {
  private value = new TextDummy('NoteSnippetValue');
  private languageId = new StringIdDummy('language');

  create({ type }: Options = { type: 'text' }): NoteSnippet {
    switch (type) {
      case 'text':
        return {
          type: 'text',
          value: this.value.create(),
        };
      case 'code':
        return {
          type: 'code',
          language: this.languageId.create(),
          value: this.value.create(),
        };
    }
  }
}
