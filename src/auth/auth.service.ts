import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import config from 'src/config';
import { SignDto } from './dto/sign.dto';
import { User } from 'src/user/entity/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtTokenService: JwtService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async generateJwtCredentials(user: User) {
    const accessTokenPayload = {
      email: user.email,
      sub: user.id,
      isAdmin: user.isAdmin,
    };

    const refreshTokenPayload = {
      uid: user.id,
    };

    const accessToken = this.jwtTokenService.sign(accessTokenPayload);
    const refreshToken = this.jwtTokenService.sign(refreshTokenPayload, {
      secret: config.jwt.refreshSecret,
      expiresIn: config.jwt.refreshExpired,
    });

    await this.userService.setRefreshToken(user.id as number, refreshToken); // Storing hashed refresh token in database

    return {
      accessToken,
      refreshToken,
      expireAccessToken: config.jwt.accessExpired,
      expireRefreshToken: config.jwt.refreshExpired,
    };
  }

  async validate(userInput: SignDto): Promise<User | null> {
    const user = await this.userService.findByEmail(userInput.email);

    if (user && (await argon2.verify(user.passwordHash, userInput.password))) {
      // Check if user exists and if password does not match the hashed password stored in the database
      return user;
    }

    return null;
  }

  async signUp(userInput: SignUpDto) {
    const existUser = await this.userService.findByEmail(userInput.email);

    if (existUser) {
      throw new Error('User with this email exists already');
    }

    const user = await this.userService.createUser({
      ...userInput,
    });

    return await this.generateJwtCredentials(user);
  }

  async signIn(userInput: SignDto) {
    const user = await this.validate(userInput);

    if (!user) {
      throw new Error('Email or password is wrong');
    }

    return await this.generateJwtCredentials(user);
  }

  async refreshTokens(refreshToken: string) {
    const payload = this.jwtTokenService.verify(refreshToken, {
      secret: config.jwt.refreshSecret,
    });
    const user = await this.userService.findById(payload.uid);

    if (!user || !(await argon2.verify(user.refreshTokenHash, refreshToken))) {
      // Check if user does not exist or if the refresh token does not match the hashed refresh token stored in the database
      throw new Error('Invalid refresh token');
    }

    return await this.generateJwtCredentials(user);
  }
}
