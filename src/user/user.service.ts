import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { CreateUserInput } from './dto/create-user.input';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(createInput: CreateUserInput): Promise<User> {
    const hashedPassword = await argon2.hash(createInput.password);
    const user = await this.userRepository.create({
      ...createInput,
      isAdmin: false,
      refreshTokenHash: null,
      passwordHash: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  async findAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOneBy({ email });
  }

  async findById(id: number): Promise<User> {
    return await this.userRepository.findOneBy({ id });
  }

  async setRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const refreshTokenHash = await argon2.hash(refreshToken);
    await this.userRepository.update(userId, { refreshTokenHash });
  }

  async changePassword(userId: number, newPassword: string): Promise<void> {
    const passwordHash = await argon2.hash(newPassword);
    await this.userRepository.update(userId, { passwordHash });
  }

  async deleteUser(userId: number): Promise<void> {
    await this.userRepository.delete({ id: userId });
  }
}
