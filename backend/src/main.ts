// src/main.ts

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // API prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000', // Next.js
      'http://localhost:5173', // Vite
    ],
    credentials: true,
  });

  // Port
  const PORT = process.env.PORT || 3001;

  await app.listen(PORT);

  console.log(`🚀 Server running on port ${PORT}`);
}

bootstrap();