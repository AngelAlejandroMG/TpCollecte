import { Module } from '@nestjs/common';
import { PersistenceService } from './persistence.service.js';

@Module({
  providers: [PersistenceService]
})
export class PersistenceModule {}
