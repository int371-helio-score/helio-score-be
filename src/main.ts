import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path'
import * as express from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors(
    {
      origin: ['http://localhost:8080', 'https://test-helioscore.sytes.net'],
      methods: ['POST', 'PATCH', 'DELETE', 'GET'],
      exposedHeaders: ['Content-Disposition']
    }
  );
  app.use('/public/images', express.static(join(__dirname, '..', 'public/images')));
  await app.listen(3000);
}
bootstrap();