import { Module } from '@nestjs/common';
import { PlacesService } from './places.service.js';
import { PlacesController } from './places.controller.js';
import { PersistenceModule } from '../persistence/persistence.module.js';

@Module({
  providers: [ PlacesService],
  imports: [PersistenceModule],
  controllers: [PlacesController],
  exports: [PlacesService],
})
export class PlacesModule {}
