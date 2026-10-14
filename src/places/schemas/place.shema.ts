import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { PlaceCategory } from '../enums/place-category.enum.js';
import { PlaceStatus } from '../enums/place-status.enum.js';
import { toJsonTransform } from '../../common/mongoose/to-json.transform.js';

export type PlaceDocument = HydratedDocument<Place>;

@Schema({
  collection: 'places',
  timestamps: true,
  versionKey: false,
  toJSON: { transform: toJsonTransform },
})
export class Place {
  @ApiProperty({ example: '6720f1c2a1b2c3d4e5f60718' })
  id: string;

  @ApiProperty({ example: 'Bibliothèque principale' })
  @Prop({ required: true, trim: true, maxlength: 120 })
  name: string;

  @ApiProperty({ example: 'Espace calme avec prises.' })
  @Prop({ required: true, trim: true, maxlength: 1000 })
  description: string;

  @ApiProperty({ enum: PlaceCategory })
  @Prop({ type: String, required: true, enum: Object.values(PlaceCategory), index: true })
  category: PlaceCategory;

  @ApiProperty({ example: 'Pavillon A, local A-210' })
  @Prop({ required: true, trim: true, maxlength: 200 })
  address: string;

  @ApiProperty({ type: [String], example: ['WIFI', 'POWER_OUTLETS'] })
  @Prop({ type: [String], default: [] })
  services: string[];

  @ApiProperty({ enum: PlaceStatus, default: PlaceStatus.ACTIVE })
  @Prop({ type: String, enum: Object.values(PlaceStatus), default: PlaceStatus.ACTIVE })
  status: PlaceStatus;

  @ApiProperty({ type: Number, nullable: true, example: null })
  @Prop({ type: Number, default: null, min: 1, max: 5 })
  averageRating: number | null;

  @ApiProperty({ example: 0 })
  @Prop({ type: Number, default: 0, min: 0 })
  reviewCount: number;

  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export const PlaceSchema = SchemaFactory.createForClass(Place);