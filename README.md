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
- Persistance des données dans MongoDB via Mongoose (survit à un redémarrage)
- Sécurité HTTP de base : Helmet, CORS restreint, limite de taille du corps

## Technologies

- [NestJS](https://nestjs.com/) (TypeScript)
- `class-validator` / `class-transformer` pour la validation des DTO
- `@nestjs/swagger` pour la documentation OpenAPI
- MongoDB (Atlas) et Mongoose (`@nestjs/mongoose`) pour la persistance
- `@nestjs/config` et Joi pour la configuration validée au démarrage
- `helmet` pour les en-têtes HTTP de sécurité
- Postman / Swagger UI pour les essais manuels

## Installation

Prérequis : Node.js 20 ou plus récent, et une base MongoDB (Atlas ou locale).

```bash
npm ci
```

## Configuration

Copier le fichier d'exemple et l'adapter au besoin :

```bash
cp .env.example .env
```

| Variable | Description | Exemple |
|---|---|---|
| `NODE_ENV` | Environnement (`development`, `production`, `test`). Swagger est désactivé en production | `development` |
| `PORT` | Port d'écoute du serveur | `3000` |
| `MONGO_URI` | URI de connexion MongoDB, avec le nom de la base | `mongodb://localhost:27017/campusrate` |
| `CORS_ORIGINS` | Origines autorisées par CORS, séparées par des virgules | `http://localhost:5173` |

Le fichier `.env` n'est jamais versionné. Seul `.env.example`, sans secret, l'est.
L'application refuse de démarrer si une variable obligatoire est absente ou invalide (validation Joi).

### Configurer MongoDB Atlas

1. **Security → Database & Network Access → Database Users** : créer un utilisateur avec un mot de passe généré automatiquement.
2. **Security → Database & Network Access → IP Access List** : ajouter son adresse IP actuelle (éviter `0.0.0.0/0`).
3. **Clusters → Connect → Drivers** : copier l'URI, remplacer `<db_password>` et ajouter `/campusrate` avant le `?`.
4. Coller l'URI dans `MONGO_URI` du fichier `.env`.

## Démarrage

```bash
# Mode développement (rechargement automatique)
npm run start:dev

# Compilation et démarrage en mode production
npm run build
npm run start:prod
```

L'API écoute sur `http://localhost:3000` (ou le port défini par `PORT`).

## Documentation Swagger UI

Une fois le serveur démarré, la documentation interactive est disponible à :

```
http://localhost:3000/docs
```

Elle décrit toutes les ressources, les paramètres, les corps de requête, les exemples et les réponses possibles (succès et erreurs).

Le document OpenAPI est disponible sur `/docs/openapi.json`. Swagger n'est pas publié lorsque `NODE_ENV=production`.

## Contrat de l'API

### Ressources et versionnement

Toutes les routes sont préfixées par une version majeure explicite dans le chemin (`/api/v1/...`), ce qui permet de faire évoluer le contrat sans casser les clients existants.

### Table des routes — Places

| Méthode | URI | Rôle | Succès | Erreurs |
|---|---|---|---|---|
| POST | `/api/v1/places` | Créer un endroit | 201 Created (+ en-tête `Location`) | 400 |
| GET | `/api/v1/places` | Lister avec filtre et pagination | 200 OK | 400 |
| GET | `/api/v1/places/:id` | Consulter un endroit | 200 OK | 400, 404 |
| PATCH | `/api/v1/places/:id` | Modifier partiellement | 200 OK | 400, 404 |
| DELETE | `/api/v1/places/:id` | Supprimer | 204 No Content | 400, 404, 409 |

### Table des routes — Reviews

| Méthode | URI | Rôle | Succès | Erreurs |
|---|---|---|---|---|
| POST | `/api/v1/places/:placeId/reviews` | Ajouter une appréciation | 201 Created | 400, 404 |
| GET | `/api/v1/places/:placeId/reviews` | Lister les appréciations d'un endroit | 200 OK | 400, 404 |

Toutes les erreurs sont retournées au format `application/problem+json` (RFC 9457).

### Justification des principaux choix (section 4 de l'énoncé)

| Choix | Décision | Justification |
|---|---|---|
| Nom des ressources | `places`, `reviews` (anglais, pluriel, sans verbe) | Convention REST standard, cohérente dans le code et OpenAPI |
| Versionnement | `/api/v1/...` dans le chemin | Simple à lire, visible immédiatement dans l'URI, stable dans le temps |
| Imbrication | `reviews` imbriquées sous `places/:placeId` | Une appréciation n'existe jamais sans son endroit ; la relation est réelle et obligatoire |
| Paramètres de chemin | `id` pour un endroit, `placeId` pour la relation | Évite l'ambiguïté quand les deux identifiants coexistent dans une même route |
| Code 201 + `Location` | Sur la création d'un endroit | Indique au client où trouver la ressource nouvellement créée |
| Code 204 | Sur suppression réussie | Aucun contenu à retourner, corps vide conforme au standard HTTP |
| Code 409 | Suppression d'un endroit avec appréciations | Conflit avec l'état courant de la ressource, pas une erreur de validation |
| Pagination | `{ data: [], pagination: {...} }` | Sépare clairement les données des métadonnées, format prévisible pour le client |
| Identifiants | ObjectId MongoDB exposé sous le nom `id` | `_id` et `__v` sont des détails internes de MongoDB ; le client garde un champ `id` comme au TP1 |
| Id mal formé | 400 plutôt que 404 | Distingue une requête invalide d'une ressource absente |
| Champs non autorisés | Rejet (400) plutôt que retrait silencieux | Le client est informé que son contrat est incorrect |


## Persistance

Les données sont conservées dans MongoDB via Mongoose, dans deux collections :

| Collection | Schéma | Particularités |
|---|---|---|
| `places` | `src/places/schemas/place.shema.ts` | `averageRating` et `reviewCount` calculés par le serveur ; index sur `category` |
| `reviews` | `src/reviews/schemas/review.schema.ts` | `placeId` (ObjectId, `ref: Place`) relie l'avis à son endroit ; index sur `placeId` |

- `createdAt` et `updatedAt` sont gérés par l'option `timestamps` de Mongoose.
- L'identifiant MongoDB `_id` est exposé sous le nom `id`. `_id` et `__v` ne sont jamais retournés.
- À chaque nouvel avis, une agrégation (`$avg`, `$sum`) recalcule `averageRating` (arrondie à une décimale) et `reviewCount` à partir des avis réels. La valeur reste juste même si un calcul précédent a échoué.
- Les mises à jour utilisent `runValidators: true` : les contraintes du schéma s'appliquent aussi au `PATCH`.
- Les filtres de requête sont construits champ par champ : aucun objet du client n'est transmis directement à MongoDB.
- Les contraintes importantes sont vérifiées deux fois, dans le DTO (frontière HTTP) et dans le schéma Mongoose (persistance).

## Sécurité

| Contrôle | Mise en œuvre |
|---|---|
| Validation des entrées | `ValidationPipe` global : `whitelist`, `forbidNonWhitelisted`, `transform` |
| Champs contrôlés par le serveur | `id`, `createdAt`, `updatedAt`, `averageRating`, `reviewCount` absents des DTO → **400** s'ils sont envoyés |
| Identifiants | Format ObjectId vérifié → **400** si mal formé, **404** si inexistant |
| Pagination | `limit` plafonné à 50 |
| Injection NoSQL | Filtres construits en liste blanche ; paramètres inconnus rejetés ; option `sanitizeFilter` de Mongoose |
| En-têtes HTTP | `helmet` (CSP, HSTS, `X-Content-Type-Options`, suppression de `X-Powered-By`, etc.) |
| CORS | Origines explicites (`CORS_ORIGINS`), méthodes et en-têtes limités, jamais `*` |
| Taille du corps | 100 ko maximum → **413** |
| Erreurs | Format `application/problem+json` ; aucun détail interne exposé (500 générique, détail dans les journaux) |
| Secrets | `MONGO_URI` uniquement dans `.env`, ignoré par Git ; `.env.example` sans secret |
| Configuration | Validée au démarrage par Joi : l'application refuse de démarrer si elle est invalide |
| Documentation | Swagger désactivé si `NODE_ENV=production` |

> CORS ne protège que les navigateurs : il empêche une page web d'une autre origine de **lire** les réponses. Il ne bloque pas les clients comme curl ou Postman, et ne remplace pas l'authentification.

## Fonctionnalités optionnelles réalisées

| Code | Option | Mise en œuvre |
|---|---|---|
| M2 | Agrégation MongoDB | `ReviewsService.refreshPlaceStats` : pipeline `$match` + `$group` (`$avg`, `$sum`) qui recalcule `averageRating` et `reviewCount` à chaque nouvel avis |
| M3 | Référence plutôt qu'imbrication | Voir ci-dessous |
| H2 | Limite de taille du corps et 413 | `useBodyParser('json', { limit: '100kb' })` ; le filtre d'erreurs renvoie **413** au format Problem Details |
| H5 | Méthodes HTTP restreintes | CORS n'autorise que `GET`, `POST`, `PATCH`, `DELETE` et l'en-tête `Content-Type` |
| P1 | Allowlist explicite de filtres | Seul `category` (validé par `@IsEnum`) est transmis au filtre MongoDB ; tout autre paramètre d'URL est rejeté (**400**) |
| P3 | Protection supplémentaire contre l'injection NoSQL | `mongoose.set('sanitizeFilter', true)` et `strictQuery` ; les objets du type `{ "$ne": ... }` sont rejetés |
| T1 | Rôle de HTTPS | Voir ci-dessous |

### Référence plutôt qu'imbrication (M3)

Les avis sont stockés dans une collection `reviews` séparée et référencent leur endroit par `placeId` (ObjectId, `ref: Place`), au lieu d'être imbriqués dans le document `places` :

- le nombre d'avis d'un endroit n'est pas borné : un tableau imbriqué ferait grossir le document sans limite (plafond de 16 Mo par document MongoDB) ;
- les avis sont lus et paginés indépendamment de l'endroit, sans charger tout le document ;
- la liste des endroits reste légère, car elle ne transporte pas tous les commentaires ;
- l'index sur `placeId` rend la recherche des avis d'un endroit efficace.

Le résumé utile à l'affichage (`averageRating`, `reviewCount`) est tout de même conservé dans `places` et recalculé par agrégation, ce qui évite une jointure à chaque consultation.

### Rôle de HTTPS (T1)

HTTPS ajoute TLS au-dessus de HTTP. TLS chiffre les échanges, ce qui empêche une personne sur le réseau de lire ou de modifier les requêtes et les réponses (données, jetons, mots de passe). Le certificat permet aussi au client de vérifier qu'il parle bien au bon serveur. En local, l'API fonctionne en HTTP. En production, elle doit être servie en HTTPS, généralement derrière un proxy inverse ou un service d'hébergement qui gère le certificat. Les en-têtes HSTS ajoutés par Helmet demandent ensuite au navigateur de toujours utiliser HTTPS.

## Vérifications manuelles

Scénarios réalisés dans Swagger UI (`/docs`), Postman ou `curl.exe`. `{id}` désigne l'identifiant renvoyé au scénario 1.

### Création valide

| # | Scénario | Requête | Résultat attendu |
|---|---|---|---|
| 1 | Créer un endroit | `POST /api/v1/places` avec `name`, `description`, `category`, `address` | **201**, en-tête `Location: /api/v1/places/{id}`, `reviewCount: 0`, `averageRating: null`, pas de `_id` |
| 2 | Ajouter un avis | `POST /api/v1/places/{id}/reviews` avec `{ "authorName": "Samira", "rating": 4, "comment": "Bien" }` | **201** |
| 3 | Ajouter un 2e avis | Même requête avec `"rating": 5` | **201** |

### Consultation

| # | Scénario | Requête | Résultat attendu |
|---|---|---|---|
| 4 | Consulter l'endroit | `GET /api/v1/places/{id}` | **200**, `reviewCount: 2`, `averageRating: 4.5` |
| 5 | Lister les avis | `GET /api/v1/places/{id}/reviews` | **200**, 2 avis, le plus récent en premier |
| 6 | Filtrer et paginer | `GET /api/v1/places?category=STUDY_SPACE&page=1&limit=5` | **200**, `pagination.limit` vaut 5 |

### Persistance

| # | Scénario | Requête | Résultat attendu |
|---|---|---|---|
| 7 | Redémarrage | Arrêter le serveur, relancer `npm run start:dev`, refaire le scénario 4 | Mêmes données |
| 8 | Vérification dans Atlas | Data Explorer → base `campusrate` | Collections `places` et `reviews` présentes |

### Gestion des erreurs

| # | Scénario | Requête | Résultat attendu |
|---|---|---|---|
| 9 | Id mal formé | `GET /api/v1/places/abc` | **400**, `Content-Type: application/problem+json` |
| 10 | Id inexistant | `GET /api/v1/places/6720f1c2a1b2c3d4e5f60718` | **404**, `title: "Ressource introuvable"` |
| 11 | Champ obligatoire absent | `POST /api/v1/places` sans `name` | **400**, `errors` contient « name should not be empty » |
| 12 | Note hors limites | `POST /api/v1/places/{id}/reviews` avec `"rating": 7` | **400** |
| 13 | Catégorie invalide | `POST /api/v1/places` avec `"category": "PISCINE"` | **400** |
| 14 | Suppression avec avis | `DELETE /api/v1/places/{id}` | **409** |
| 15 | Pagination trop grande | `GET /api/v1/places?limit=1000` | **400** |
| 16 | JSON mal formé | `POST /api/v1/places` avec le corps `{ "name": ` | **400**, format Problem Details |
| 17 | Corps trop gros | `POST` avec une description de plus de 100 ko | **413** |
| 18 | Suppression sans avis | Créer un endroit, puis `DELETE` sur celui-ci | **204** |

### Champs interdits

| # | Scénario | Requête | Résultat attendu |
|---|---|---|---|
| 19 | Imposer les statistiques | `POST /api/v1/places` avec `"averageRating": 5, "reviewCount": 99` | **400**, « property averageRating should not exist » |
| 20 | Imposer l'id et les dates | `POST /api/v1/places` avec `"id": "x", "createdAt": "2020-01-01"` | **400** |
| 21 | Modifier les statistiques | `PATCH /api/v1/places/{id}` avec `{ "reviewCount": 0 }` | **400** |
| 22 | Modification autorisée | `PATCH /api/v1/places/{id}` avec `{ "status": "TEMPORARILY_CLOSED" }` | **200**, `reviewCount` toujours à 2 |
| 23 | Paramètre d'URL inconnu | `GET /api/v1/places?foo=bar` | **400** |
| 24 | Injection NoSQL | `GET /api/v1/places?category[$ne]=X` | **400** |

### Sécurité HTTP et configuration

| # | Scénario | Commande | Résultat attendu |
|---|---|---|---|
| 25 | Helmet | `curl.exe -i http://localhost:3000/api/v1/places` | En-têtes `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Content-Security-Policy` ; **pas** de `X-Powered-By` |
| 26 | CORS, origine autorisée | `curl.exe -i -H "Origin: http://localhost:5173" http://localhost:3000/api/v1/places` | `Access-Control-Allow-Origin: http://localhost:5173` |
| 27 | CORS, origine refusée | `curl.exe -i -H "Origin: http://evil.example" http://localhost:3000/api/v1/places` | **Pas** d'en-tête `Access-Control-Allow-Origin` (la réponse reste 200 : seul un navigateur bloque la lecture) |
| 28 | Configuration absente | Retirer `MONGO_URI` du `.env`, puis relancer | L'application refuse de démarrer : `Config validation error: "MONGO_URI" is required` |

## Limites connues

- Aucune authentification ni autorisation : l'API est ouverte.
- Pas de limitation de débit (`@nestjs/throttler`).
- La suppression et la modification d'une appréciation ne sont pas couvertes.
- Les identifiants du TP1 (`plc_...`) ne sont pas repris : les données ont été recréées dans MongoDB.

## Usage de l'intelligence artificielle

Une IA générative a été utilisée pour la compréhension du tp, des messages d'erreur, la création du README et au diagnostic de problèmes de configuration (NestJS, Git). 
