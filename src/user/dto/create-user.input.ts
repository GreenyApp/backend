import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserInput {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  isAdmin?: boolean;
}
