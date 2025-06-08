/* eslint-disable @typescript-eslint/no-var-requires */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import * as admin from 'firebase-admin';

async function bootstrap() {
  const serviceAccountPath =
    '../greeny-e064b-firebase-adminsdk-fbsvc-f721792f71.json';
  if (serviceAccountPath) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    console.warn(
      'FIREBASE_SERVICE_ACCOUNT_PATH not set. Firebase Admin SDK not initialized for push notifications.',
    );
  }
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // Replace with your frontend origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  app.connectMicroservice({
    transport: Transport.MQTT,
    options: {
      url: 'mqtts://273efede1f9f4ecc8f8f6dcfe17f4492.s1.eu.hivemq.cloud:8883',
      username: 'greeny',
      password: 'Greeny1greeny',
      rejectUnauthorized: false,
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
