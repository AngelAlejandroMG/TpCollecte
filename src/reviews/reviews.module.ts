import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { ReviewsController } from './reviews.controller.js';
import { PersistenceModule } from '../persistence/persistence.module.js';
@Module({
  providers: [ReviewsService],
  controllers: [ReviewsController],
  imports: [PersistenceModule],
})
export class ReviewsModule {}
