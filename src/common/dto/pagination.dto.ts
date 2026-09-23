import { ApiPropertyOptional } from "@nestjs/swagger";
import { PlaceCategory } from "../../places/enums/place-category.enum.js";
import { IsEnum, IsOptional, IsInt, Min, Max } from "class-validator";
import { Type } from 'class-transformer';

export class PaginationPlaceDto {
    @ApiPropertyOptional({
        enum: PlaceCategory,
        description: 'Filtre exact par catégorie'
    })
    @IsEnum(PlaceCategory)
    @IsOptional()
    category?: PlaceCategory;


  @ApiPropertyOptional({ default: 1, description: 'Page demandée' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, description: 'Taille de page' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50) 
  @IsOptional()
  limit?: number = 10;
}