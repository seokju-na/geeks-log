import { IsDefined, IsEmail, Length } from 'class-validator';

export class FindUserByEmailQuery {
  @IsDefined()
  @IsEmail()
  email: string;
}

export class FindUserByNameQuery {
  @IsDefined()
  @Length(4, 20)
  username: string;
}
