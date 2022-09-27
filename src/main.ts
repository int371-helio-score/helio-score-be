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
      origin: ['http://localhost:8080', 'https://helioscore.sytes.net', 'http://20.82.6.4:80'],
      methods: ['POST', 'PATCH', 'DELETE', 'GET']
    }
  );
  app.use('/public/images', express.static(join(__dirname, '..', 'public/images')));
  await app.listen(3000);
}
bootstrap();