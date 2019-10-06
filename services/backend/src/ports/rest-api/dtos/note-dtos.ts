import { IsDefined } from 'class-validator';

export class TmpNotePublishDto {
  @IsDefined()
  title: string;

  @IsDefined()
  content: string;

  @IsDefined()
  pathname: string;
}
