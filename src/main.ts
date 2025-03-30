import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const port = process.env.PORT || 3000;
  const APP_FRONTEND_URL = process.env.APP_FRONTEND_URL;
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.use(cookieParser());

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: APP_FRONTEND_URL,
    credentials: true,
  });

  await app.listen(port, '0.0.0.0').then(() => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
bootstrap();
