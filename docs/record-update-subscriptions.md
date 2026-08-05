# Souscriptions `recordUpdate` — état des lieux

> Périmètre : le trigger pub/sub `RECORD_UPDATE` et ses consommateurs. Les autres triggers
> (`TREE_EVENT`, `APPLICATION_EVENT`, `TASK`…, cf. `apps/core/src/_types/eventsManager.ts`)
> suivent la même mécanique de transport mais ne sont pas détaillés ici.

## Vue d'ensemble

```
saveValue / saveValueBatch / deleteValue / updateRecord / filesManager
        │  sendRecordUpdateEvent (helper)
        ▼
eventsManagerDomain.sendPubSubEvent ──► RabbitMQ (routing pubsub_events)
                                              │  fan-out : 1 queue par instance core
                                              ▼
                    initPubSubEventsConsumer (chaque instance core)
                                              │
                                              ▼
                    PubSub graphql-subscriptions in-process
                                              │  1 asyncIterator par souscription websocket
                                              ▼
                    withFilter (recordApp) : ignoreOwnEvents + records/libraries
                                              │
                                              ▼
                    clients GraphQL (Explorer, kanban, RecordEdition, TreeExplorer…)
```

## Émission (core)

`eventsManagerDomain` ([apps/core/src/domain/eventsManager/eventsManagerDomain.ts](../apps/core/src/domain/eventsManager/eventsManagerDomain.ts))
expose deux canaux RabbitMQ distincts :

| Canal               | Routing         | Consommateurs                                                | Sert aux souscriptions GraphQL ? |
| ------------------- | --------------- | ------------------------------------------------------------ | -------------------------------- |
| `sendDatabaseEvent` | `data_events`   | indexationManager, history…                                  | Non                              |
| `sendPubSubEvent`   | `pubsub_events` | chaque instance core (queue préfixée `pubsub_events_prefix`) | Oui                              |

Chaque instance core consomme sa propre queue et re-publie dans un `PubSub`
graphql-subscriptions **in-process** (`eventsManagerDomain.ts:39,85`), qui alimente les
websockets de cette instance. Le multi-instance K8s est donc déjà couvert par le fan-out
RabbitMQ.

### Qui émet `RECORD_UPDATE`

Toujours via le helper
[`sendRecordUpdateEvent`](../apps/core/src/domain/record/helpers/sendRecordUpdateEvent.ts) :

| Source                       | Détail                                                                      |
| ---------------------------- | --------------------------------------------------------------------------- |
| `valueDomain.saveValue`      | 1 événement **par valeur** sauvée (`valueDomain.ts:887`)                    |
| `valueDomain.saveValueBatch` | 1 événement groupé portant les N valeurs (`valueDomain.ts:1060`)            |
| `valueDomain.deleteValue`    | `valueDomain.ts:594`                                                        |
| `recordDomain.updateRecord`  | métadonnées record, `updatedValues: []` (`recordDomain.ts:381`)             |
| filesManager                 | previews, événements FS (`handleFileUtilsHelper`, `handlePreviewResponse`…) |

`updateRecordLastModif` (appelé à chaque sauvegarde de valeur) passe directement par le repo
([apps/core/src/domain/helpers/updateRecordLastModif.ts](../apps/core/src/domain/helpers/updateRecordLastModif.ts)),
pas par `recordDomain.updateRecord` : **pas de double événement** par `saveValue`.

### Cycle de vie et événements — comportement voulu

Le cycle actif/inactif structure ce qui est observable, et c'est un choix assumé :
l'utilisateur ne voit que les records **actifs** (les inactifs n'apparaissent que via un
filtre explicite), et la suppression ne porte que sur des records déjà inactifs.

- **La création n'émet pas d'événement pub/sub** : `createRecord` n'envoie qu'un database
  event (`RECORD_SAVE`). Cohérent avec le cycle de vie : un record naît inactif, donc
  invisible ; c'est son **activation** (`saveValue('active')`) qui le fait apparaître — et
  c'est elle qui émet l'événement.
- **La suppression/purge n'émet pas d'événement pub/sub**
  ([`deleteRecord.ts:159`](../apps/core/src/domain/record/helpers/deleteRecord.ts) : database
  event seul). Même logique : on ne supprime que de l'inactif, déjà invisible ; c'est la
  **désactivation** qui fait disparaître un record des listes, et elle émet un événement.

La bascule `active` est donc le signal « ce record apparaît / disparaît » — c'est sur elle
que s'appuient les consommateurs qui rafraîchissent des listes.

## Filtrage serveur

`Subscription.recordUpdate`
([apps/core/src/app/core/recordApp/recordApp.ts:434-448](../apps/core/src/app/core/recordApp/recordApp.ts)) :
`withFilter` évalué **par souscripteur et par événement** :

1. `ignoreOwnEvents` (optionnel) : `event.userId === ctx.userId`
   ([`subscriptions.ts:20`](../apps/core/src/app/core/helpers/subscriptions.ts)) — comparaison
   par **user**, pas par session/onglet. Impossible de distinguer « mon autre onglet » ou
   « un autre panneau du même écran » de « moi » : un client qui l'active n'entend plus ses
   propres écritures, y compris celles d'un autre composant du même écran.
2. `_filterRecordSubscribeEvents` (`recordApp.ts:101-112`) : simple inclusion dans les listes
   `records` / `libraries` fournies par le client.

> ⚠️ **Point de danger — aucun contrôle de permission.** N'importe quel client authentifié
> peut souscrire à `{libraries: [x]}` et recevoir tous les événements de la bibliothèque,
> permissions contextuelles ou pas. Les filtres `records`/`libraries` sont déclarés par le
> client : ce sont des filtres de confort, pas une barrière de sécurité. Toute refonte doit
> traiter ce point côté resolver.

Le payload transporte l'identité complète du record (`RecordIdentity` : label, subLabel,
preview, color) et `updatedValues[].value`
([libs/ui/src/_queries/records/getRecordUpdatesSubscription.ts](../libs/ui/src/_queries/records/getRecordUpdatesSubscription.ts)).

`recordNewComment` (`recordApp.ts:450-465`) suit exactement le même schéma de filtrage.

## Consommation (front)

### Explorateurs : le module `watch-record-updates`

Les trois chemins de l'explorateur (table ExplorerV2, kanban, table Explorer v1) partagent
**une seule mécanique** :
[`libs/ui/src/modules/watch-record-updates/`](../libs/ui/src/modules/watch-record-updates/)
(structure feature-based `modules/`, cf. MR !2219).

- **Souscription minimale** `RECORD_UPDATE_LIGHT` : `record { id }` + `updatedValues
{ attribute }` — aucune donnée métier ne transite. Les données fraîches sont récupérées par
  des **queries**, qui appliquent les permissions côté serveur. La fuite du point de danger
  ci-dessus est ainsi réduite à de la métadonnée d'existence (« le record X a changé
  l'attribut Y ») ; le vrai fix (filtrage permissions dans le resolver) reste à faire côté
  core.
- **Classification** de chaque événement (`classifyRecordUpdateEvent`) : record affiché →
  `visibleRecordTouched` ; non affiché + bascule `active` → `listContentMaybeChanged`
  (apparition/disparition : création, [dés]activation) ; sinon ignoré.
- **Debounce trailing** (300 ms) : une rafale (action de masse, import — un événement par
  record) s'effondre en **un seul** flush ; si la rafale contient un `listContentMaybeChanged`,
  seul le rechargement complet est déclenché (il couvre aussi les records visibles touchés).
- **Rejets avalés** : le déclencheur est l'action d'un autre utilisateur, il n'y a rien à
  relancer côté utilisateur courant — pas d'unhandled rejection.
- **`shouldIgnoreEvent`** : point d'extension pour l'echo-suppression (le kanban y branche sa
  fenêtre `selfWriteEchoTimersRef` pour ne pas recharger le board sur l'écho de son propre
  drag & drop).

| Consommateur                                                                                     | Réaction au flush                                                                                             |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| ExplorerV2 [`useExplorerData`](../libs/ui/src/components/ExplorerV2/_queries/useExplorerData.ts) | 1 record visible touché → refetch unitaire ; plusieurs → reload liste ; contenu changé → reload liste + count |
| Explorer v1 [`useExplorerData`](../libs/ui/src/components/Explorer/_queries/useExplorerData.ts)  | idem                                                                                                          |
| [`useKanbanColumnsData`](../libs/ui/src/components/ExplorerV2/kanban/useKanbanColumnsData.ts)    | reset/reload complet du board (profondeur de colonnes préservée) dans les deux cas                            |

### Autres consommateurs (souscription riche)

Wrapper : [`useGetRecordUpdatesSubscription`](../libs/ui/src/hooks/useGetRecordUpdatesSubscription/useGetRecordUpdatesSubscription.ts)
— son `onData` exécute `updateValuesCache` (patch du cache Apollo) sur **chaque** événement
reçu, indépendamment de ce qu'en fait le composant.

| Consommateur                                                                                                                                | Filtre                                    | Usage                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Explorateurs (entrypoint **link**)                                                                                                          | `{libraries, records: ids liés}`          | patch du cache des records liés (scopé donc permission-safe : ils sont affichés)                         |
| [`EditRecordContent`](../libs/ui/src/components/RecordEdition/EditRecordContent/EditRecordContent.tsx)                                      | `{records: [id], ignoreOwnEvents: true}`  | bannière « modifié par un autre utilisateur »                                                            |
| [`TreeExplorer`](../apps/app-studio/src/modules/ApplicationRouting/content/panel-tree-explorer/tree-explorer/TreeExplorer.tsx) (app-studio) | `{libraries: toutes les libs de l'arbre}` | rafraîchissement de la navigation — ⚠️ library-wide **riche** : porte encore la fuite du point de danger |

## Limites structurelles

- **Pas de contrôle de permission côté resolver** — cf. le point de danger ci-dessus. Le
  module `watch-record-updates` réduit l'exposition à de la métadonnée d'existence pour les
  explorateurs, mais l'API reste ouverte : un ticket core est nécessaire pour le fix résolveur.
- **`isOwnEvent` par userId** : trop grossier pour distinguer « ma propre écriture dans ce
  composant » d'« un autre onglet / un autre panneau du même user » — inutilisable pour les
  explorateurs (il avalerait la création faite depuis le panel voisin). L'echo-suppression
  reste côté client (`shouldIgnoreEvent`).
- **Pas d'événement de niveau liste/vue** : la granularité record par record est compensée
  côté client par la classification + le debounce du module, pas exprimable côté serveur.
