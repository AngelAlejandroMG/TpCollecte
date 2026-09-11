import { Module } from '@nestjs/common';
import { PlacesService } from './places.service.js';
import { PlacesController } from './places.controller.js';

@Module({
  providers: [PlacesService],
  controllers: [PlacesController]
})
export class PlacesModule {}
