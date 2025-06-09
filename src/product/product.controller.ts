import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/user/entity/user.entity';
import { ProductDto } from './dto/product.dto';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import * as admin from 'firebase-admin';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    @Inject('GREENY_SERVICE') private readonly mqttClient: ClientProxy,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  @MessagePattern('update-product-props')
  async updateProductProps(@Payload() data: ProductDto) {
    try {
      console.log('Received data:', data);
      const product = await this.productService.getOneByCode(data.code);
      await this.productService.update(product.id, {
        waterLevel: data.waterLevel,
        airHumidity: data.airHumidity,
        airQuality: data.airQuality,
        lightLevel: data.airQuality,
        temperature: data.temperature,
        soilMoisture: data.soilHumidity,
      });

      if (data.waterLevel < 5) {
        console.log('Потрібно полити');
      }

      if (data.tankWaterLevel < 5) {
        console.log('Бачок порожній');
      }
    } catch (e) {
      console.log(e.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user')
  async getAllUserProducts(@CurrentUser() user: User) {
    try {
      return await this.productService.getAllByUser(user.id);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  async getAllProducts(@CurrentUser() user: User) {
    try {
      if (!user.isAdmin) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

      return await this.productService.getAll();
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createProduct(@CurrentUser() user: User, @Body('code') code: string) {
    try {
      if (!user.isAdmin) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

      return await this.productService.create(code);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('/user/:id')
  async updateByUser(
    @CurrentUser() user: User,
    @Param('id') id: number,
    @Body('name') name: string,
  ) {
    try {
      const product = await this.productService.getOneById(id);

      if (product.user.id !== user.id) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

      return await this.productService.update(id, { name });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/user/:id')
  async deleteByUser(@CurrentUser() user: User, @Param('id') id: number) {
    try {
      const product = await this.productService.getOneById(id);
      if (product.user.id !== user.id) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
      await this.productService.update(id, { user: null, name: '' });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('/admin/:id')
  async updateByAdmin(
    @CurrentUser() user: User,
    @Param('id') id: number,
    @Body('code') code: string,
  ) {
    try {
      if (!user.isAdmin) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

      return await this.productService.update(id, { code });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('/add')
  async addToUser(
    @CurrentUser() user: User,
    @Body() body: { code: string; name: string },
  ) {
    try {
      const product = await this.productService.getOneByCode(body.code);
      const updatedProduct = await this.productService.update(product.id, {
        user,
        name: body.name,
      });

      const job = new CronJob('0 0 1 * *', () => {
        console.log('a');
      });

      this.schedulerRegistry.addCronJob(`log-a-${product.id}`, job);
      job.start();

      return updatedProduct;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('/water-action/:id')
  async waterAction(@CurrentUser() user: User, @Param('id') id: number) {
    try {
      const product = await this.productService.getOneById(id);

      if (product.user.id !== user.id) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

      console.log('water action for product ' + product.id);
      const topic = `water-action/${product.code}`;
      const message = { action: 'water' };

      this.mqttClient.emit(topic, message);
      return true;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/firebase-token-test')
  async firebaseTokenTest() {
    try {
      const message = {
        notification: {
          title: 'Тестове повідомлення',
          body: 'Це тестове повідомлення від Greeny',
        },
        token:
          'eDjkQM9xLtxliNXd8ZKtN3:APA91bGcsd7CK91OqxfN3vSRNcz0ARvsqfIkakus4RD63mTFQgTg4joIqGdbn68bA0NsFCeXGMy6P8iUL3w2Twuh0NYN0QQEtKXix3yrrzrYXkEmQ0QjsTg', // Replace with actual device token
      };

      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Error sending message:', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
