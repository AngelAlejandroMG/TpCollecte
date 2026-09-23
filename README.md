# CampusRate

API REST permettant à la communauté étudiante de consulter des endroits ou services du campus et de publier des appréciations accompagnées d'une note.

Projet réalisé dans le cadre du cours **420-514 Collecte et interprétation des données** (Techniques de l'informatique, Automne 2026).

## Objectif

CampusRate expose deux ressources principales :

- **Places** — des endroits ou services du campus (bibliothèque, cafétéria, local d'étude, etc.)
- **Reviews** — des appréciations (note + commentaire) associées à un endroit précis

L'API permet de créer, consulter, filtrer, modifier et supprimer ces ressources en respectant les conventions REST et les codes de statut HTTP appropriés.

## Fonctionnalités

- Création, consultation, modification partielle et suppression des endroits
- Filtrage par catégorie et pagination sur la liste des endroits
- Publication et consultation des appréciations liées à un endroit
- Calcul automatique de la note moyenne et du nombre d'appréciations d'un endroit
- Blocage de la suppression d'un endroit qui possède déjà des appréciations (conflit)
- Validation stricte des entrées (DTO + `class-validator`)
- Gestion uniforme des erreurs au format `application/problem+json`
- Documentation interactive via Swagger UI
- Persistance des données dans un fichier JSON local (survit à un redémarrage)

## Technologies

- [NestJS](https://nestjs.com/) (TypeScript)
- `class-validator` / `class-transformer` pour la validation des DTO
- `@nestjs/swagger` pour la documentation OpenAPI
- `node:fs/promises` pour la persistance JSON asynchrone
- Postman / Swagger UI pour les essais manuels


## Configuration

Copier le fichier d'exemple et l'adapter au besoin :

```bash
cp .env.example .env
```

| Variable | Description | Exemple |
|---|---|---|
| `PORT` | Port d'écoute du serveur | `3000` |
| `DATA_FILE_PATH` | Chemin du fichier JSON de persistance | `./data/db.json` |

L'application refuse de démarrer si une configuration obligatoire est absente ou invalide.

## Démarrage

```bash
# Mode développement (rechargement automatique)
npm run start:dev

```

## Documentation Swagger UI

Une fois le serveur démarré, la documentation interactive est disponible à :

```
http://localhost:3000/api
```

Elle décrit toutes les ressources, les paramètres, les corps de requête, les exemples et les réponses possibles (succès et erreurs).

## Contrat de l'API

### Ressources et versionnement

Toutes les routes sont préfixées par une version majeure explicite dans le chemin (`/api/v1/...`), ce qui permet de faire évoluer le contrat sans casser les clients existants.

### Table des routes — Places

| Méthode | URI | Rôle | Succès | Erreurs |
|---|---|---|---|---|
| POST | `/api/v1/places` | Créer un endroit | 201 Created (+ en-tête `Location`) | 400 |
| GET | `/api/v1/places` | Lister avec filtre et pagination | 200 OK | 400 |
| GET | `/api/v1/places/:id` | Consulter un endroit | 200 OK | 404 |
| PATCH | `/api/v1/places/:id` | Modifier partiellement | 200 OK | 400, 404 |
| DELETE | `/api/v1/places/:id` | Supprimer | 204 No Content | 404, 409 |

### Table des routes — Reviews

| Méthode | URI | Rôle | Succès | Erreurs |
|---|---|---|---|---|
| POST | `/api/v1/places/:placeId/reviews` | Ajouter une appréciation | 201 Created | 400, 404 |
| GET | `/api/v1/places/:placeId/reviews` | Lister les appréciations d'un endroit | 200 OK | 404 |

### Justification des principaux choix (section 4 de l'énoncé)

| Choix | Décision | Justification |
|---|---|---|
| Nom des ressources | `places`, `reviews` (anglais, pluriel, sans verbe) | Convention REST standard, cohérente dans le code et OpenAPI |
| Versionnement | `/api/v1/...` dans le chemin | Simple à lire, visible immédiatement dans l'URI, stable dans le temps |
| Imbrication | `reviews` imbriquées sous `places/:placeId` | Une appréciation n'existe jamais sans son endroit ; la relation est réelle et obligatoire |
| Paramètres de chemin | `id` pour un endroit, `placeId` pour la relation | Évite l'ambiguïté quand les deux identifiants coexistent dans une même route |
| Code 201 + `Location` | Sur toute création réussie | Indique au client où trouver la ressource nouvellement créée |
| Code 204 | Sur suppression réussie | Aucun contenu à retourner, corps vide conforme au standard HTTP |
| Code 409 | Suppression d'un endroit avec appréciations | Conflit avec l'état courant de la ressource, pas une erreur de validation |
| Pagination | `{ data: [], pagination: {...} }` | Sépare clairement les données des métadonnées, format prévisible pour le client |


## Persistance

Les données sont conservées dans un fichier JSON local (`data/db.json` par défaut, configurable via `DATA_FILE_PATH`). La lecture et l'écriture utilisent les API asynchrones de `node:fs/promises`, isolées dans un `PersistenceService` dédié. Le fichier est initialisé automatiquement s'il est absent, et un JSON invalide produit une erreur contrôlée plutôt qu'un crash.

## Limites connues

- La persistance repose sur un fichier JSON local : elle ne supporte pas des accès concurrents à grande échelle ni des volumes de données importants.
- Aucune authentification n'est implémentée : l'API est ouverte, adaptée au contexte pédagogique du TP.
- La suppression d'une appréciation individuelle et la mise à jour de son contenu ne sont pas encore couvertes dans cette version.

## Usage de l'intelligence artificielle

Une IA générative a été utilisée pour la compréhension du tp, des messages d'erreur, la création du README et au diagnostic de problèmes de configuration (NestJS, Git). 
