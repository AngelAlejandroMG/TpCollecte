import { Injectable, NotFoundException } from '@nestjs/common';
import { PersistenceService } from '../persistence/persistence.service.js';
import { Review } from './entities/review.entity.js';
import { Place } from '../places/entities/place.entity.js';
import { CreateReviewDto } from './dto/create-review.dto.js';

@Injectable()
export class ReviewsService {
    private readonly RKEY = 'reviews';
    private readonly PKEY = 'places';

    constructor(private readonly persistenceService: PersistenceService) {}

    async create(placeId: string, createReviewDto: CreateReviewDto): Promise<Review> {
        
        const places = await this.persistenceService.readData<Place>(this.PKEY);
        const reviews = await this.persistenceService.readData<Review>(this.RKEY);

        const place = places.find(p => p.id === placeId);

        if(!place) {
            throw new NotFoundException(`Place with id ${placeId} not found`);
        }

        const newReview: Review = {
            id: `rev_${Date.now()}`,
            placeId: placeId,
            authorName: createReviewDto.authorName,
            rating: createReviewDto.rating,
            comment: createReviewDto.comment,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        reviews.push(newReview);

        await this.persistenceService.saveData<Review>(this.RKEY, reviews);
        
        return newReview;
    }

    async findAllByPlaceId(placeId: string): Promise<Review[]> {
        const places = await this.persistenceService.readData<Place>(this.PKEY);
        const place = places.find(p => p.id === placeId);

        if (!place) {
            throw new NotFoundException(`Place with id ${placeId} not found`);
        }

        const reviews = await this.persistenceService.readData<Review>(this.RKEY);
        return reviews.filter(review => review.placeId === placeId);
    }

}
