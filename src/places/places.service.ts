import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePlaceDto } from './dto/create-place.dto.js';
import { UpdatePlaceDto } from './dto/update-place.dto.js';
import { PaginationPlaceDto } from './dto/pagination-place.dto.js';
import { Place, PlaceDocument } from './schemas/place.shema.js';
import { isObjectIdOrHexString, Model, Types } from 'mongoose';

@Injectable()
export class PlacesService {
  constructor(@InjectModel(Place.name) private readonly placeModel: Model<Place>) {}

  async create(dto: CreatePlaceDto): Promise<PlaceDocument> {
    return this.placeModel.create({
      name: dto.name,
      description: dto.description,
      category: dto.category,
      address: dto.address,
      services: dto.services ?? [],
    });
  }

  async findAll(query: PaginationPlaceDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const filter: Record<string, unknown> = {};
    if (query.category) filter.category = query.category;

    const [data, totalItems] = await Promise.all([
      this.placeModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.placeModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }

  async findOne(id: string): Promise<PlaceDocument> {
    this.assertValidId(id);
    const place = await this.placeModel.findById(id).exec();
    if (!place) {
      throw new NotFoundException(`Aucun endroit trouvé avec l'id : ${id}`);
    }
    return place;
  }

  async update(id: string, dto: UpdatePlaceDto): Promise<PlaceDocument> {
    this.assertValidId(id);
    const place = await this.placeModel
      .findByIdAndUpdate(id, dto, { returnDocument: 'after', runValidators: true })
      .exec();
    if (!place) {
      throw new NotFoundException(`Aucun endroit trouvé avec l'id : ${id}`);
    }
    return place;
  }

  async remove(id: string): Promise<void> {
    const place = await this.findOne(id);
    if (place.reviewCount > 0) {
      throw new ConflictException(
        `Impossible de supprimer l'endroit avec l'id : ${id} car il a des avis associés.`,
      );
    }
    await place.deleteOne();
  }

  private assertValidId(id: string): void {
    if (!isObjectIdOrHexString(id)) {
      throw new BadRequestException(`Identifiant invalide : ${id}`);
    }
  }

  async updateRatingStats(
    placeId: Types.ObjectId,
    averageRating: number | null,
    reviewCount: number,
  ): Promise<void> {
    await this.placeModel
      .updateOne({ _id: placeId }, { averageRating, reviewCount }, { runValidators: true })
      .exec();
  }
}