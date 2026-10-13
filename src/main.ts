import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { AppModule } from './app.module.js';
import { configureSwagger } from './configure-swagger.js';
import { ProblemDetailsFilter } from './common/filters/problem-details.filter.js';


mongoose.set('sanitizeFilter', true);
mongoose.set('strictQuery', true);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  
  app.use(helmet());

  const origins = config
    .getOrThrow<string>('CORS_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    exposedHeaders: ['Location'],
  });

  app.useBodyParser('json', { limit: '100kb' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            
      forbidNonWhitelisted: true, 
      transform: true,          
    }),
  );

  app.useGlobalFilters(new ProblemDetailsFilter());

  if (config.get<string>('NODE_ENV') !== 'production') {
    configureSwagger(app);
  }

  await app.listen(config.get<number>('PORT') ?? 3000);
}
await bootstrap();
