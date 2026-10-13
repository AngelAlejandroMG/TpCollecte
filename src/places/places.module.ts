import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlacesService } from './places.service.js';
import { PlacesController } from './places.controller.js';
import { Place, PlaceSchema } from './schemas/place.shema.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Place.name, schema: PlaceSchema }])],
  controllers: [PlacesController],
  providers: [PlacesService],
  exports: [PlacesService],
})
export class PlacesModule {}