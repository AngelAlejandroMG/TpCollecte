import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateReviewDto {
    @ApiProperty({ example: 'Samira', description: 'Nom ou pseudonyme', maxLength: 80 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    authorName: string;

    @ApiProperty({ example: 4, description: 'Note de 1 à 5', minimum: 1, maximum: 5 })
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @ApiProperty({ example: 'Super endroit pour étudier !', description: 'Commentaire', maxLength: 1000 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    comment: string;
}