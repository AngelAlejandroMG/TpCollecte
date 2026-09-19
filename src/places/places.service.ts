import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PersistenceService } from '../persistence/persistence.service.js';
import { CreatePlaceDto } from './dto/create-place.dto.js';
import { UpdatePlaceDto } from './dto/update-place.dto.js';
import { PaginationPlaceDto } from './dto/pagination-place.dto.js';
import { Place } from './entities/place.entity.js';
import { PlaceStatus } from './enums/place-status.enum.js';

@Injectable()
export class PlacesService {
    private readonly KEY = 'places';

    constructor(private readonly persistenceService: PersistenceService) {}

    async create(dto: CreatePlaceDto): Promise<Place>{
        const places = await this.persistenceService.readData<Place>(this.KEY);

        const now = new Date().toISOString();
        const newPlace: Place = {
            id: `plc_${Date.now()}`,
            name: dto.name,
            description: dto.description,
            category: dto.category,
            address: dto.address,
            services: dto.services ?? [],
            status: PlaceStatus.ACTIVE,
            averageRating: null,
            reviewCount: 0,
            createdAt: now,
            updatedAt: now,
        };
        places.push(newPlace);

        await this.persistenceService.saveData<Place>(this.KEY, places);
        
        return newPlace;
    }

    async findAll(paginationDto: PaginationPlaceDto) {
        let places = await this.persistenceService.readData<Place>(this.KEY);

        if (paginationDto.category) {
            places = places.filter(place => place.category === paginationDto.category);
        }

        const totalItems = places.length;
        const page = paginationDto.page ?? 1;
        const limit = paginationDto.limit ?? 10;
        const totalPages = Math.ceil(totalItems / limit);

        const startIndex = (page - 1) * limit;
        const paginatedPlaces = places.slice(startIndex, startIndex + limit);

        return {
            data: paginatedPlaces,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
            },
        };
        

    }

    async findOne(id: string): Promise<Place> {
        const places = await this.persistenceService.readData<Place>(this.KEY);
        const place = places.find((p) => p.id === id);

        if (!place) {
            throw new NotFoundException(`Aucun endroit trouvé avec l'id : ${id}`);
        }

            return place;
    }

    async update(id: string, dto: UpdatePlaceDto): Promise<Place> {
        const places = await this.persistenceService.readData<Place>(this.KEY);
        const index = places.findIndex((p) => p.id === id);

        if(index < 0){
            throw new NotFoundException(`Aucun endroit trouvé avec l'id : ${id}`);
        }

        const updatePlace: Place = {
            ...places[index],
            ...dto,
            updatedAt: new Date().toISOString(),
        }

        places[index] = updatePlace;
        await this.persistenceService.saveData<Place>(this.KEY, places);

        return updatePlace;
    }

    async remove(id: string): Promise<void> {
        const places = await this.persistenceService.readData<Place>(this.KEY);
        const place = places.find((p) => p.id === id);

        if (!place) {
            throw new NotFoundException(`Aucun endroit trouvé avec l'id : ${id}`);
        }

        if(place.reviewCount > 0){
            throw new ConflictException(`Impossible de supprimer l'endroit avec l'id : ${id} car il a des avis associés.`);
        }

        const filtredPlaces = places.filter((p) => p.id !== id);
        await this.persistenceService.saveData<Place>(this.KEY, filtredPlaces);

    }


    
}
