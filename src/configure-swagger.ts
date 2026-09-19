    import { INestApplication } from '@nestjs/common';
    import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

    export function configureSwagger(app: INestApplication): void {
      const config = new DocumentBuilder()
        .setTitle('Campus Rate')
        .setDescription(
          'API REST de gestion de données pour le campus, incluant les places et les critiques des utilisateurs.',
        )
        .setVersion('1.0.0')
        .addTag('Places', 'Gestion des places')
        .addTag('Reviews', 'Gestion des critiques')
        .build();

      const documentFactory = () =>
        SwaggerModule.createDocument(app, config);

      SwaggerModule.setup('docs', app, documentFactory, {
        jsonDocumentUrl: 'docs/openapi.json',
        customSiteTitle: 'Campus Rate - Documentation',
      });
    }