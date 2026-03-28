import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import config from 'src/config';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AdminBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(private readonly userService: UserService) {}

  async onModuleInit() {
    const email = config.superAdmin?.email;
    const password = config.superAdmin?.password;

    if (!email || !password) {
      return;
    }

    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      if (!existingUser.isAdmin) {
        await this.userService.setAdminStatus(existingUser.id, true);
        this.logger.warn('Existing SUPER_ADMIN_EMAIL user was promoted to admin.');
      }
      return;
    }

    await this.userService.createUser({
      email,
      password,
      isAdmin: true,
    });
    this.logger.log('Bootstrap super admin created from environment variables.');
  }
}