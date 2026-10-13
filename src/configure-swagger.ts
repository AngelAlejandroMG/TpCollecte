import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ProblemDetailsDto } from './common/dto/problem-details.dto.js';

export function configureSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Campus Rate')
    .setDescription(
      'API REST de gestion des endroits du campus et de leurs appréciations. ' +
        'Persistance MongoDB. Les erreurs suivent le format Problem Details (RFC 9457).',
    )
    .setVersion('2.0.0')
    .addTag('Places', 'Gestion des endroits')
    .addTag('Reviews', 'Gestion des appréciations')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, { extraModels: [ProblemDetailsDto] });

  SwaggerModule.setup('docs', app, documentFactory, {
    jsonDocumentUrl: 'docs/openapi.json',
    customSiteTitle: 'Campus Rate - Documentation',
  });
}
