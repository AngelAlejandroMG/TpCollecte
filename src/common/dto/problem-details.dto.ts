import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProblemDetailsDto {
  @ApiProperty({ example: 'about:blank' })
  type: string;

  @ApiProperty({ example: 'Requête invalide' })
  title: string;

  @ApiProperty({ example: 400 })
  status: number;

  @ApiProperty({ example: 'Les données envoyées sont invalides.' })
  detail: string;

  @ApiProperty({ example: '/api/v1/places' })
  instance: string;

  @ApiPropertyOptional({ type: [String], example: ['rating must not be greater than 5'] })
  errors?: string[];
}
