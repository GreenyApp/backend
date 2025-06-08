import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from './entity/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SchedulerRegistry } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    ClientsModule.register([
      {
        name: 'GREENY_SERVICE',
        transport: Transport.MQTT,
        options: {
          url: 'mqtts://273efede1f9f4ecc8f8f6dcfe17f4492.s1.eu.hivemq.cloud:8883',
          username: 'greeny',
          password: 'Greeny1greeny',
          rejectUnauthorized: false,
        },
      },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService, SchedulerRegistry],
})
export class ProductModule {}
