import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';

const TITLES: Record<number, string> = {
  400: 'Requête invalide',
  404: 'Ressource introuvable',
  409: 'Conflit',
  413: 'Corps de requête trop volumineux',
  500: 'Erreur interne',
};

// Toutes les erreurs sont renvoyées au format Problem Details (RFC 9457)
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Erreurs');

  catch(exception: any, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<Request>();
    const response = host.switchToHttp().getResponse<Response>();

    let status = 500;
    let detail = 'Une erreur inattendue est survenue.';
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body: any = exception.getResponse();
      const message = body.message ?? body;
      if (Array.isArray(message)) {
        detail = 'Les données envoyées sont invalides.';
        errors = message;
      } else {
        detail = message;
      }
    } else if (exception instanceof MongooseError.ValidationError) {
      status = 400;
      detail = 'Les données ne respectent pas le schéma.';
      errors = Object.values(exception.errors).map((e) => e.message);
    } else if (exception?.status === 400 || exception?.status === 413) {
      // Erreurs d'Express : JSON mal formé ou corps trop gros
      status = exception.status;
      detail = status === 413 ? 'Le corps de la requête dépasse la taille permise.' : 'Corps de requête invalide.';
    }

    // La stack reste dans la console, jamais dans la réponse
    if (status === 500) {
      this.logger.error(`${request.method} ${request.originalUrl}`, exception?.stack);
    }

    response.status(status).type('application/problem+json').json({
      type: 'about:blank',
      title: TITLES[status] ?? 'Erreur',
      status,
      detail,
      instance: request.originalUrl,
      errors,
    });
  }
}
