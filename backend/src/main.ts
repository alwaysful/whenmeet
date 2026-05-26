import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // 전역 Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 속성 제거
      forbidNonWhitelisted: true, // DTO에 없는 속성 있으면 에러
      transform: true, // 자동 타입 변환
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('WhenMeet API')
    .setDescription('WhenMeet 일정 조율 서비스 API 문서')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 토큰을 입력하세요',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Auth', '인증 관련 API')
    .addTag('Users', '사용자 관련 API')
    .addTag('Rooms', '방 관련 API')
    .addTag('Availability', '날짜 선호도 관련 API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 새로고침해도 토큰 유지
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(` Application is running on: http://localhost:${port}`);
  console.log(` Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
