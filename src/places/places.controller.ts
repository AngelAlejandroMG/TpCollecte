import { PlacesService } from './places.service.js';
import { CreatePlaceDto } from './dto/create-place.dto.js';
import { UpdatePlaceDto } from './dto/update-place.dto.js';
import { PaginationPlaceDto } from './dto/pagination-place.dto.js';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOperation, ApiTags, ApiOkResponse, ApiParam, ApiNotFoundResponse, ApiConflictResponse, ApiNoContentResponse } from '@nestjs/swagger';
import { Place } from './schemas/place.shema.js';
import { Controller, Get, Post, Body, Patch, Delete, Query, HttpCode, HttpStatus, Param, Res } from '@nestjs/common';
import type { Response } from 'express';

@ApiTags('Places')
@Controller('api/v1/places')
export class PlacesController {
    constructor(private readonly placesService: PlacesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Créer un endroit',
        description: 'Ajoute un nouvel endroit au campus et l’initialise.',
    })
    @ApiCreatedResponse({ description: 'Endroit créé avec succès.', type: Place })
    @ApiBadRequestResponse({ description: 'Données d’entrée invalides.' })
    async create(@Body() createPlaceDto: CreatePlaceDto, @Res({ passthrough: true }) res: Response) {
        const place = await this.placesService.create(createPlaceDto);
        res.location(`/api/v1/places/${place.id}`);
        return place;
    }

    @Get()
    @ApiOperation({
        summary: 'Lister les endroits',
        description: 'Récupère la collection des endroits avec filtrage et pagination.',
    })
    @ApiOkResponse({ description: 'Liste des endroits récupérée.' })
    @ApiBadRequestResponse({ description: 'Paramètres de requête invalides.' })
    findAll(@Query() paginationDto: PaginationPlaceDto) {
        return this.placesService.findAll(paginationDto);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Consulter un endroit',
        description: 'Retourne les détails d’un endroit spécifique.',
    })
    @ApiParam({ name: 'id', description: 'Identifiant MongoDB de l’endroit', example: '6720f1c2a1b2c3d4e5f60718' })
    @ApiOkResponse({ description: 'Endroit trouvé.', type: Place })
    @ApiBadRequestResponse({ description: 'Identifiant invalide.' })
    @ApiNotFoundResponse({ description: 'Endroit introuvable.' })
    findOne(@Param('id') id: string) {
        return this.placesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Modifier un endroit',
        description: 'Met à jour partiellement les informations d’un endroit.',
    })
    @ApiParam({ name: 'id', description: 'Identifiant MongoDB de l’endroit', example: '6720f1c2a1b2c3d4e5f60718' })
    @ApiOkResponse({ description: 'Endroit mis à jour.', type: Place })
    @ApiBadRequestResponse({ description: 'Identifiant ou données de mise à jour invalides.' })
    @ApiNotFoundResponse({ description: 'Endroit introuvable.' })
    update(@Param('id') id: string, @Body() updatePlaceDto: UpdatePlaceDto) {
        return this.placesService.update(id, updatePlaceDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Supprimer un endroit',
        description: 'Supprime un endroit s’il ne possède aucune appréciation.',
    })
    @ApiParam({ name: 'id', description: 'Identifiant MongoDB de l’endroit', example: '6720f1c2a1b2c3d4e5f60718' })
    @ApiNoContentResponse({ description: 'Endroit supprimé.' })
    @ApiBadRequestResponse({ description: 'Identifiant invalide.' })
    @ApiNotFoundResponse({ description: 'Endroit introuvable.' })
    @ApiConflictResponse({ description: 'Suppression impossible car des avis existent.' })
    remove(@Param('id') id: string) {
        return this.placesService.remove(id);
    }
}