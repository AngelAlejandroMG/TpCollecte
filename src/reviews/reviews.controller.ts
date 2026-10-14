import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { Review } from './schemas/review.schema.js';
import { ProblemDetailsDto } from '../common/dto/problem-details.dto.js';

@ApiTags('Reviews')
@Controller('api/v1/places/:placeId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ajouter une appréciation', description: 'Crée un avis pour un endroit et recalcule sa note moyenne et son nombre d’avis.' })
  @ApiParam({ name: 'placeId', description: 'Identifiant MongoDB de l’endroit', example: '6720f1c2a1b2c3d4e5f60718' })
  @ApiCreatedResponse({ description: 'Appréciation ajoutée avec succès.', type: Review })
  @ApiBadRequestResponse({ description: 'Identifiant invalide ou données invalides (ex. note hors de 1 à 5).', type: ProblemDetailsDto })
  @ApiNotFoundResponse({ description: 'Endroit introuvable.', type: ProblemDetailsDto })
  create(@Param('placeId') placeId: string, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(placeId, createReviewDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les appréciations', description: 'Récupère tous les avis d’un endroit, du plus récent au plus ancien.' })
  @ApiParam({ name: 'placeId', description: 'Identifiant MongoDB de l’endroit', example: '6720f1c2a1b2c3d4e5f60718' })
  @ApiOkResponse({ description: 'Liste des appréciations récupérée.', type: [Review] })
  @ApiBadRequestResponse({ description: 'Identifiant invalide.', type: ProblemDetailsDto })
  @ApiNotFoundResponse({ description: 'Endroit introuvable.', type: ProblemDetailsDto })
  findAllByPlaceId(@Param('placeId') placeId: string) {
    return this.reviewsService.findAllByPlaceId(placeId);
  }
}
