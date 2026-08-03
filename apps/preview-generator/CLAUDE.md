# apps/preview-generator — CLAUDE.md

Service backend de génération de previews pour les fichiers médias
(images, vidéos, PDFs, documents Office) en plusieurs tailles/qualités.

## Fonctionnement

Service Node.js qui consomme des messages RabbitMQ, génère les fichiers de preview
(format PNG) et les écrit dans un dossier de sortie configurable.
Supporte le découpage multi-pages (documents).

## Stack

- Node.js + TypeScript
- RabbitMQ via `@leav/message-broker` (`createAmqpConnection`) — communication asynchrone AMQP,
  résiliente (reconnexion automatique)
- `@leav/config-manager` pour la configuration

## Structure

```
src/
├── index.ts              # Point d'entrée
├── amqp/
│   └── startConsume.ts   # Écoute la queue RabbitMQ
├── generatePreview/
│   └── generatePreview.ts # Logique de génération
└── handleDocument/        # Traitement multi-pages
```

## Configuration

JSON-based : connexion AMQP, chemins d'entrée/sortie, profils de couleur ICC.

---

## Deux images Docker, à ne pas confondre

| Image                                                                                                                          | Usage                      | Contenu                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`DOCKERFILES/PREVIEW_GENERATOR/Dockerfile`](../../docker/DOCKERFILES/PREVIEW_GENERATOR/Dockerfile)                            | **local** (docker-compose) | Uniquement les outils système (imagemagick, ffmpeg, inkscape, ghostscript, libreoffice, unoconv). Ni `yarn install` ni code : le compose monte le monorepo et les volumes `node_modules`. |
| [`DOCKERFILES/build/generic.Dockerfile`](../../docker/DOCKERFILES/build/generic.Dockerfile) (cible `runner-preview-generator`) | **CI / production**        | L'image réelle, buildée par le job `build-docker-preview-generator`.                                                                                                                      |

⚠️ C'est la seconde qui impose le contrat de dépendances — voir la règle générale
`yarn workspaces focus` dans le [CLAUDE.md racine](../../CLAUDE.md#gestion-des-dépendances) : elle
s'applique à tous les services buildés par `generic.Dockerfile`. Concrètement, `@leav/logger` était
importé dans 6 fichiers de cette app **sans être déclaré** : invisible en local (tout le monorepo est
monté), absent de l'image de prod.

Auditer avec le skill [`audit-dependencies`](../../.claude/skills/audit-dependencies/) après toute
modification des imports.
