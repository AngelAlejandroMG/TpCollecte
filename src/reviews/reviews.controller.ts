import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { Review } from './entities/review.entity.js';

@ApiTags('Reviews')
@Controller({ path: 'places/:placeId/reviews', version: '1' })
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({summary: 'Ajouter une appréciation', description: 'Crée un avis pour un endroit spécifique et met à jour sa note moyenne.', })
  @ApiParam({ name: 'placeId', description: 'Identifiant de l’endroit', example: 'plc_01JABC123' })
  @ApiCreatedResponse({ description: 'Appréciation ajoutée avec succès.', type: Review })
  @ApiBadRequestResponse({ description: 'Données invalides (ex: note hors de 1-5).' })
  @ApiNotFoundResponse({ description: 'Endroit introuvable.' })
  create(@Param('placeId') placeId: string, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(placeId, createReviewDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les appréciations',
    description: 'Récupère tous les avis d’un endroit spécifique.',
  })
  @ApiParam({ name: 'placeId', description: 'Identifiant de l’endroit', example: 'plc_01JABC123' })
  @ApiOkResponse({ description: 'Liste des appréciations récupérée.' })
  @ApiNotFoundResponse({ description: 'Endroit introuvable.' })
  findAllByPlaceId(@Param('placeId') placeId: string) {
    return this.reviewsService.findAllByPlaceId(placeId);
  }
}