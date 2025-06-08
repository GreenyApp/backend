import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserInput {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
