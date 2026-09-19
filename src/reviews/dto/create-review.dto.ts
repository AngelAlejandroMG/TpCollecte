import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class CreateReviewDto {
    @ApiProperty({ example: 'Samira', description: 'Nom ou pseudonyme' })
    @IsString()
    @IsNotEmpty()
    authorName: string;

    @ApiProperty({ example: 4, description: 'Note de 1 à 5' })
    @IsNotEmpty()
    @IsInt()
    rating: number;

    @ApiProperty({ example: 'Super endroit pour étudier !', description: 'Commentaire' })
    @IsString()
    @IsNotEmpty()
    comment: string;

}