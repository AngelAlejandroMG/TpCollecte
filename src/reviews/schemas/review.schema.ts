import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';
import { Place } from '../../places/schemas/place.shema.js';
import { toJsonTransform } from '../../common/mongoose/to-json.transform.js';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({
  collection: 'reviews',
  timestamps: true,
  versionKey: false,
  toJSON: { transform: toJsonTransform },
})
export class Review {
  @ApiProperty({ example: '6720f2d9a1b2c3d4e5f60720' })
  id: string;

  @ApiProperty({ type: String, example: '6720f1c2a1b2c3d4e5f60718' })
  @Prop({ type: Types.ObjectId, ref: Place.name, required: true, index: true })
  placeId: Types.ObjectId;

  @ApiProperty({ example: 'Samira' })
  @Prop({ required: true, trim: true, maxlength: 80 })
  authorName: string;

  @ApiProperty({ minimum: 1, maximum: 5, example: 4 })
  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @ApiProperty({ example: 'Super endroit pour étudier !' })
  @Prop({ required: true, trim: true, maxlength: 1000 })
  comment: string;

  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);