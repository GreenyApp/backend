import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignDto } from './dto/sign.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/user/entity/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/add-admin')
  async addAdmin(@Body() signUpInput: SignUpDto, @CurrentUser() user: User) {
    try {
      if (!user.isAdmin) {
        throw new Error('You are not a admin');
      }

      signUpInput.isAdmin = true;

      return await this.authService.signUp(signUpInput);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/signUp')
  async signUp(@Body() signUpInput: SignUpDto) {
    try {
      return await this.authService.signUp({
        email: signUpInput.email,
        password: signUpInput.password,
        isAdmin: false,
      });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/signin')
  async signIn(@Body() signInInput: SignDto) {
    try {
      return await this.authService.signIn(signInInput);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/refresh')
  async refreshTokens(@Body('refreshToken') refreshToken: string) {
    try {
      return await this.authService.refreshTokens(refreshToken);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
