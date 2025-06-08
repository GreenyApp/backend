import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from './entity/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserResponse } from './dto/user.response';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getMe(@CurrentUser() user: User) {
    try {
      return new UserResponse(await this.userService.findById(user.id));
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(@CurrentUser() user: User) {
    try {
      if (!user.isAdmin) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

      const users = await this.userService.findAllUsers();
      return users.map((user) => new UserResponse(user));
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('/change-password')
  async changePassword(
    @CurrentUser() user: User,
    @Body('newPassword') newPassword: string,
  ) {
    try {
      await this.userService.changePassword(user.id, newPassword);
      return true;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteUser(@CurrentUser() user: User) {
    try {
      await this.userService.deleteUser(user.id);
      return true;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
