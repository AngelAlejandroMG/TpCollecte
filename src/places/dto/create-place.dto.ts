import { IsEnum, IsNotEmpty, IsString, IsArray, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlaceCategory } from '../enums/place-category.enum.js';

// id, status, averageRating, reviewCount et les dates sont gérés par le serveur
export class CreatePlaceDto {
    @ApiProperty({ example: 'Bibliothèque principale', maxLength: 120 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    name: string;

    @ApiProperty({ example: 'Espace calme avec prises.', maxLength: 1000 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    description: string;

    @ApiProperty({ enum: PlaceCategory, example: PlaceCategory.STUDY_SPACE })
    @IsEnum(PlaceCategory)
    category: PlaceCategory;

    @ApiProperty({ example: 'Pavillon A, local A-210', maxLength: 200 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    address: string;

    @ApiProperty({ example: ['WIFI', 'POWER_OUTLETS'], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    services?: string[];
}
