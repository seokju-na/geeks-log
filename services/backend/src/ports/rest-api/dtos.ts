import { IsDefined, IsEmail, Length } from 'class-validator';
import { CreateLocalUserCommandDto } from '../../app/dtos';

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

export class CreateLocalUserDto extends CreateLocalUserCommandDto {
}
