import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Prefijo global para todos los endpoints
  app.setGlobalPrefix('api/v1');

  // Validación global de DTOs (buenas prácticas)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 API running on http://localhost:${process.env.PORT ?? 3000}/api/v1`);
}
bootstrap();
