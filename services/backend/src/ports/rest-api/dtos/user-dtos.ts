import { IsDefined, IsEmail, Length } from 'class-validator';

export class CreateLocalUserDto {
  @IsDefined()
  @IsEmail()
  email: string;

  @IsDefined()
  @Length(4, 20)
  username: string;

  @IsDefined()
  @Length(6, 50)
  password: string;

  @IsDefined()
  userAgent: string;
}
