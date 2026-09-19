import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PlaceCategory } from '../enums/place-category.enum.js';

export class PaginationPlaceDto {
    @ApiProperty({ enum: PlaceCategory, required: false })
    @IsEnum(PlaceCategory)
    @IsOptional()
    category?: PlaceCategory;

    @ApiProperty({ required: false, default: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @ApiProperty({ required: false, default: 10 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50) 
    @IsOptional()
    limit?: number = 10;
    }