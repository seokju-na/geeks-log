import Dummy, { StringIdDummy, TextDummy, TimestampDummy } from '../../../testing/dummies';
import { FirstParameter } from '../../../utils/types';
import Note from '../types/Note';
import NoteSnippetDummy from './NoteSnippetDummy';

interface Options {
  snippetOptions: FirstParameter<typeof NoteSnippetDummy.prototype.create>[];
  createdAt?: Date;
  updatedAt?: Date;
}

export default class NoteDummy extends Dummy<Note> {
  private id = new StringIdDummy('note');
  private authorId = new StringIdDummy('user');
  private title = new TextDummy('NoteTitle');
  private snippet = new NoteSnippetDummy();
  private createdTimestamp = new TimestampDummy();
  private updatedTimestamp = new TimestampDummy();

  create({
    snippetOptions,
    createdAt,
    updatedAt,
  }: Options = {
    snippetOptions: [],
  }): Note {
    return {
      id: this.id.create(),
      authorId: this.authorId.create(),
      title: this.title.create(),
      snippets: snippetOptions.map(this.snippet.create),
      createdTimestamp: this.createdTimestamp.create(createdAt),
      updatedTimestamp: this.updatedTimestamp.create(updatedAt),
    };
  }
}
