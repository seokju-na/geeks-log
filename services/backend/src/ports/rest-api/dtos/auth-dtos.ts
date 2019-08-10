import { IsDefined, IsEmail, Length } from 'class-validator';

export class SignInWithEmailAndPasswordDto {
  @IsDefined()
  @IsEmail()
  email: string;

  @IsDefined()
  @Length(6, 50)
  password: string;

  @IsDefined()
  userAgent: string;
}

