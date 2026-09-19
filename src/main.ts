import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { configureSwagger } from './configure-swagger.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  
  configureSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
