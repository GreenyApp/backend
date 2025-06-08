import { User } from '../entity/user.entity';
import { Exclude } from 'class-transformer';

export class UserResponse {
  id: number;
  email: string;
  isAdmin: string;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  passwordHash: string;

  @Exclude()
  refreshTokenHash: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
