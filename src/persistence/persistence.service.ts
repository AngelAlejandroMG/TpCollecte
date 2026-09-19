import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as promise from 'node:fs/promises';
import * as path from 'node:path';

@Injectable()
export class PersistenceService {
  private readonly filePath = path.join(process.cwd(), 'data', 'db.json');

  private async ensureFileExists(): Promise<void> {
    const dirPath = path.dirname(this.filePath);
    try {
      await promise.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error('Erreur lors de la création du dossier :', error);
    }

    try {
      await promise.access(this.filePath);
    } catch {
      console.log(`[INFO] Création du fichier manquant à : ${this.filePath}`);
      const initialDb = { places: [], reviews: [] };
      await promise.writeFile(
        this.filePath,
        JSON.stringify(initialDb, null, 2),
        'utf-8',
      );
    }
  }

  async readData<T>(key: string): Promise<T[]> {
    try {
      await this.ensureFileExists();
      const content = await promise.readFile(this.filePath, 'utf-8');
      const db = JSON.parse(content);
      return Array.isArray(db[key]) ? db[key] : [];
    } catch (error) {
      console.error('[ERREUR LECTURE]', error);
      return [];
    }
  }

  async saveData<T>(key: string, data: T[]): Promise<void> {
    try {
      await this.ensureFileExists();
      const content = await promise.readFile(this.filePath, 'utf-8');
      const db = JSON.parse(content);
      
      db[key] = data;

      await promise.writeFile(this.filePath, JSON.stringify(db, null, 2), 'utf-8');
      console.log(`Données sauvegardées dans : ${this.filePath}`);
    } catch (error) {
      console.error( error);
      throw new InternalServerErrorException(
        `Erreur lors de la sauvegarde : ${error}`,
      );
    }
  }
}