import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PlacesService } from '../places/places.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { Review, ReviewDocument } from './schemas/review.schema.js';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    private readonly placesService: PlacesService,
  ) {}

  async create(placeId: string, dto: CreateReviewDto): Promise<ReviewDocument> {
   
    const place = await this.placesService.findOne(placeId);

    const review = await this.reviewModel.create({
      placeId: place._id,
      authorName: dto.authorName,
      rating: dto.rating,
      comment: dto.comment,
    });

    await this.refreshPlaceStats(place._id);
    return review;
  }

  async findAllByPlaceId(placeId: string): Promise<ReviewDocument[]> {
    const place = await this.placesService.findOne(placeId);
    return this.reviewModel.find({ placeId: place._id }).sort({ createdAt: -1 }).exec();
  }

  
  private async refreshPlaceStats(placeId: Types.ObjectId): Promise<void> {
    const [stats] = await this.reviewModel
      .aggregate<{ average: number; count: number }>([
        { $match: { placeId } },
        { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
      ])
      .exec();

    const averageRating = stats ? Math.round(stats.average * 10) / 10 : null;
    await this.placesService.updateRatingStats(placeId, averageRating, stats?.count ?? 0);
  }
}