import { PartialType } from '@nestjs/swagger';
import { CreatePlaceDto } from './create-place.dto.js';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlaceStatus } from '../enums/place-status.enum.js';

export class UpdatePlaceDto extends PartialType(CreatePlaceDto) {
  @ApiProperty({ enum: PlaceStatus, required: false, example: PlaceStatus.ACTIVE })
  @IsEnum(PlaceStatus)
  @IsOptional()
  status?: PlaceStatus;
}