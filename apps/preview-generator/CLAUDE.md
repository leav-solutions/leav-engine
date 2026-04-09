# apps/preview-generator — CLAUDE.md

Service backend de génération de previews pour les fichiers médias
(images, vidéos, PDFs, documents Office) en plusieurs tailles/qualités.

## Fonctionnement

Service Node.js qui consomme des messages RabbitMQ, génère les fichiers de preview
(format PNG) et les écrit dans un dossier de sortie configurable.
Supporte le découpage multi-pages (documents).

## Stack

-   Node.js + TypeScript
-   RabbitMQ (`amqplib`) — communication asynchrone via AMQP
-   `@leav/message-broker` pour l'abstraction AMQP
-   `@leav/config-manager` pour la configuration

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
