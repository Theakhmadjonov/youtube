import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('/api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(
    session({
      secret: '10e91 092e 12je10 9',
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.useStaticAssets(join(process.cwd(), '..', 'uploads'), {
    prefix: '/uploads/',
  });
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
