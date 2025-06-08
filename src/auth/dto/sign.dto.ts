import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
