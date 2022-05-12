import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors(
    {
      origin: ['http://localhost:8080/'],
      methods: ['POST', 'PUT', 'DELETE', 'GET']
    }
  );
  await app.listen(3000);
}
bootstrap();
