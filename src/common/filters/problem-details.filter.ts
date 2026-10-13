import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import { ProblemDetailsDto } from '../dto/problem-details.dto.js';

const TITLES: Record<number, string> = {
  400: 'Requête invalide',
  404: 'Ressource introuvable',
  409: 'Conflit',
  413: 'Corps de requête trop volumineux',
  429: 'Trop de requêtes',
  500: 'Erreur interne',
};

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const problem = this.toProblem(exception, request.originalUrl);

    if (problem.status >= 500) {
      this.logger.error(`${request.method} ${request.originalUrl}`, exception instanceof Error ? exception.stack : String(exception));
    }

    response.status(problem.status).type('application/problem+json').json(problem);
  }

  private toProblem(exception: unknown, instance: string): ProblemDetailsDto {
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const message = typeof body === 'object' && body !== null && 'message' in body ? body.message : body;
      if (Array.isArray(message)) {
        return this.build(exception.getStatus(), 'Les données envoyées sont invalides.', instance, message.map(String));
      }
      return this.build(exception.getStatus(), String(message), instance);
    }

    if (exception instanceof MongooseError.ValidationError) {
      const errors = Object.values(exception.errors).map((e) => e.message);
      return this.build(400, 'Les données ne respectent pas le schéma.', instance, errors);
    }
    if (exception instanceof MongooseError.CastError) {
      return this.build(400, `Valeur invalide pour « ${exception.path} ».`, instance);
    }

    
    if (this.hasCode(exception, 11000)) {
      return this.build(409, 'Cette ressource existe déjà.', instance);
    }

   
    const status = this.clientErrorStatus(exception);
    if (status) {
      return this.build(status, status === 413 ? 'Le corps de la requête dépasse la taille permise.' : 'Corps de requête invalide.', instance);
    }


    return this.build(500, 'Une erreur inattendue est survenue.', instance);
  }

  private build(status: number, detail: string, instance: string, errors?: string[]): ProblemDetailsDto {
    return {
      type: 'about:blank',
      title: TITLES[status] ?? 'Erreur',
      status,
      detail,
      instance,
      ...(errors && { errors }),
    };
  }

  private hasCode(exception: unknown, code: number): boolean {
    return typeof exception === 'object' && exception !== null && 'code' in exception && exception.code === code;
  }

  private clientErrorStatus(exception: unknown): number | undefined {
    if (typeof exception === 'object' && exception !== null && 'status' in exception) {
      const status = Number(exception.status);
      if (status >= 400 && status < 500) return status;
    }
    return undefined;
  }
}
