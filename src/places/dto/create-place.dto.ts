import { IsEnum, IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlaceCategory } from '../enums/place-category.enum.js';


export class CreatePlaceDto {
    @ApiProperty({example: 'Bibliothèque principale'})
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Espace calme avec prises.' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ enum: PlaceCategory, example: PlaceCategory.STUDY_SPACE })
    @IsEnum(PlaceCategory)
    @IsNotEmpty()
    category: PlaceCategory;

    @ApiProperty({ example: 'Pavillon A, local A-210' })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({ example: ['WIFI', 'POWER_OUTLETS'], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    services?: string[];


}