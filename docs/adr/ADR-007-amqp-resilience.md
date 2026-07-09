# AMQP connection resilience & message-broker interface

Date: 09/07/2026

## Status

Proposed

## Context

`libs/message-broker/src/amqpService.ts` (sur `amqplib@2.0.1`) n'a aucune gestion
d'erreur/reconnexion : aucun listener `error`/`close` sur les connexions ou channels, aucun
retry/backoff, aucun heartbeat configuré. Si RabbitMQ redémarre ou que la connexion TCP tombe,
le service reste silencieusement mort — `publish`/`consume` finissent par échouer/bloquer sans
récupération, jusqu'au redémarrage manuel de l'app. C'est un trou de fiabilité en production.

Deux problèmes se cumulent :

1. **Pas de résilience de connexion** — objet principal de ce ticket (LEAVC-542).
2. **Interface `IAmqpService` percée** — elle expose les objets `amqplib` bruts
   (`publisher.connection/channel`, `consumer.connection/channel`), ce qui a conduit ~10 fichiers
   d'`apps/core` à appeler `ack`/`nack`/`cancel`/`assertQueue`/`bindQueue`/`createConfirmChannel`
   directement sur le channel natif. Le contrat d'ack/nack en cas d'erreur dans `onMessage`
   n'existe pas (`// TODO: add ack if msg has not been acked`, jamais implémenté).

Il faut décider quelle brique gère la connexion AMQP (garder `amqplib` nu et écrire la résilience,
l'envelopper, ou en changer), en pesant maintenance / fiabilité / sécurité, puis refaire
`IAmqpService`.

Contexte amqplib important : la série 1.x/2.x (mai 2026) n'est **pas** une réécriture — même lib,
mêmes mainteneurs. 1.2.0 a intégré les types TS nativement ; 2.0.0 introduit un **breaking** :
`heartbeat: 0` désactive désormais les heartbeats (avant : « pas de préférence », valeur serveur
utilisée) — piège direct pour un chantier de résilience ; 2.0.1 supprime la dernière dépendance
runtime. Le code tourne déjà sur cette série.

## Options

1. [amqplib nu + résilience maison](https://github.com/amqp-node/amqplib) — ~2,7 M dl/sem., 2 mainteneurs, MIT, types natifs, 0 dépendance.
    - Pros :
        - Client de référence RabbitMQ/Node, déjà en place — zéro changement de dépendance.
        - Surface d'attaque minimale (0 dep runtime), types natifs depuis 1.2.0.
    - Cons :
        - La reconnexion/backoff/re-consume/ré-attachement de listeners est **à écrire et maintenir nous-mêmes** — précisément la logique délicate et sujette aux bugs que le ticket veut fiabiliser.
2. [amqp-connection-manager](https://github.com/jwalton/node-amqp-connection-manager) — ~914 K dl/sem., 1 mainteneur, MIT, écrit en TS (types natifs), 1 dep.
    - Pros :
        - Conçu exactement pour ce manque : reconnexion auto, round-robin multi-broker, mise en file mémoire des messages pendant la coupure, ré-exécution des `setup` (assert/bind) au reconnect.
        - **Wrapper mince au-dessus d'amqplib** → conserve les types `ConfirmChannel`/`ConsumeMessage` déjà utilisés par les ~10 call sites `apps/core` → blast radius minimal.
    - Cons :
        - Un seul mainteneur (bus factor), 48 issues ouvertes.
        - peerDep `amqplib: "*"` mais dev-testé sur 0.10.x → compatibilité avec amqplib 2.x **à valider par prototype**.
3. [rabbitmq-client](https://github.com/cody-greene/node-rabbitmq-client) — ~87 K dl/sem., 1 mainteneur, MIT, types natifs, 0 dep, autonome.
    - Pros :
        - Meilleure histoire de résilience « clé en main » (reconnect + re-subscribe + retry publish + re-déclaration topologie), 0 dépendance, insensible au churn d'amqplib.
    - Cons :
        - API/types différents d'amqplib → réécriture de `types/amqp.ts` et de tous les usages de channel dans les call sites (blast radius maximal).
        - Communauté plus restreinte, mainteneur unique.
4. [rascal](https://github.com/onebeyond/rascal) — ~43 K dl/sem., org onebeyond, ISC, pas de types natifs, ~10 deps.
    - Pros :
        - Très complet : récupération auto, redelivery flood protection, channel pooling, topologies déclaratives.
    - Cons :
        - ~10 dépendances runtime (lodash, xregexp, async, generic-pool…) → surface d'attaque la plus large.
        - Modèle de config déclaratif en rupture avec la config JS/env actuelle (`config/default.js`) ; pas de types TS natifs ; dev-testé sur 0.10.x.

## Decision

Recommandation (statut Proposed, à confirmer par un prototype) : **envelopper `amqplib` avec
`amqp-connection-manager`**. C'est l'option qui comble le manque de résilience avec le plus petit
blast radius : étant un wrapper mince, elle préserve l'API channel d'amqplib sur laquelle
s'appuient déjà les ~10 call sites `apps/core`, ce qui rend la refonte d'`IAmqpService` et la
migration incrémentales plutôt qu'une réécriture. Fallback documenté si la validation amqplib 2.x
échoue : **amqplib nu + résilience maison** (option 1), le surcoût étant alors le code de
reconnexion à maintenir. `rabbitmq-client` reste l'alternative sérieuse si l'on accepte un coût de
migration plus élevé pour une résilience native et zéro dépendance.

La nouvelle interface `IAmqpService` (étape suivante du ticket) devra, quel que soit le moteur retenu :
n'exposer qu'une API contrôlée (plus de channel/connection bruts), définir un contrat ack/nack
explicite pour `onMessage`, exposer `onConnectionStateChange` pour découpler les apps du moteur AMQP,
et rendre `close()` résilient (`Promise.allSettled`).

## Consequences

- Nouvelle dépendance `amqp-connection-manager` (+ `promise-breaker` transitif) dans `libs/message-broker`.
- Le breaking `heartbeat: 0` d'amqplib 2.0 doit être pris en compte dans la config (ne pas mettre `0` en pensant « défaut »).
- La migration des ~10 call sites `apps/core` reste nécessaire (l'interface change même si le moteur reste amqplib-compatible), mais sans réécriture des appels channel.
- `apps/preview-generator` et `apps/automate-scan` (raw amqplib + `process.exit`) restent hors périmètre — cf. Open points.

## Sources

- amqplib : https://github.com/amqp-node/amqplib — changelog releases 1.2.0/2.0.0/2.0.1 (mai 2026).
- amqp-connection-manager : https://github.com/jwalton/node-amqp-connection-manager
- rabbitmq-client : https://github.com/cody-greene/node-rabbitmq-client
- rascal : https://github.com/onebeyond/rascal
- Downloads npm (semaine 29/06–05/07/2026) et métadonnées registre npm.

## Open points

| Subject                                                                                            | Status                        |
| -------------------------------------------------------------------------------------------------- | ----------------------------- |
| Valider `amqp-connection-manager` v5 contre `amqplib@2.0.1` (prototype) avant de figer la Decision | À faire                       |
| Forme définitive d'`IAmqpService` (API admin, contrat ack/nack, `onConnectionStateChange`)         | À concevoir (étape suivante)  |
| Migration de `apps/preview-generator` et `apps/automate-scan` vers l'interface partagée            | Différé (hors ce ticket)      |
| Config `heartbeat` explicite (piège du breaking `heartbeat: 0` en amqplib 2.0)                     | À trancher à l'implémentation |
