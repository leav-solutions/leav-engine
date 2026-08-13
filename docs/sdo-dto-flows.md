# Flux SDO / DTO — implémentation côté leav

> Le **contrat fonctionnel** (formats des messages, catalogue des codes d'erreur, cycle de vie) est la
> propriété du repo `engine-knowledge` : [`sdo-dto/docs/func/sdo/`](https://gitlab.aristid.com/dev/xstream/engine/engine-knowledge/-/tree/main/sdo-dto/docs/func/sdo)
> (`message-formats.md`, `rabbitmq-contract.md`). Ce fichier ne le reproduit pas : il consigne
> uniquement ce qui est **propre à l'implémentation leav** et non déductible du code.

Le code vit exclusivement dans `apps/core` : `app/sdo/` (consumers), `domain/sdo/` (export, import,
statement), `infra/sdo/` (canaux AMQP, snapshot des contenus exportés), `interface/sdo.ts` (binding
des consumers au boot).

## Les trois exchanges — et leur type réel

| Config                       | Exchange                      | Sens            | Type déclaré |
| ---------------------------- | ----------------------------- | --------------- | ------------ |
| `sdo.exchange`               | `<c>_sdo`                     | export + import | `fanout`     |
| `sdo.dto.import.exchange`    | `<c>_dto_import`              | Data Platform → | `direct`     |
| `sdo.dto.statement.exchange` | `<c>_dto_operation_statement` | → Data Platform | `fanout`     |

⚠️ **Le type n'est pas uniforme sur le flux DTO** : `dto_import` a dû passer en `direct` (commit
`b36fb1b32`) pour correspondre au bus réel, alors que le statement est bien en `fanout` comme l'annonce
le contrat. Ne pas déduire le type d'un exchange de celui de son voisin. Un type qui ne correspond pas
à celui déjà déclaré sur le broker fait répondre `PRECONDITION_FAILED` et fermer le canal : **le type
est donc surchargeable par env** (`DTO_IMPORT_EXCHANGE_TYPE`, `DTO_STATEMENT_EXCHANGE_TYPE`) pour ne
pas exiger une livraison de code si un environnement diverge.

Les trois canaux vivent sur une **connexion AMQP dédiée** (`config.sdo.amqp`), distincte de celle du
core (`config.amqp`) : seul le canal des data events de l'export est sur celle du core.

## Import DTO — ack, nack et statement

Deux natures d'échec, deux comportements (`app/sdo/dtoImportApp.ts`) :

| Nature                                      | Message AMQP                    | Statement                    |
| ------------------------------------------- | ------------------------------- | ---------------------------- |
| **Rejet fonctionnel** (`DTORejectionError`) | **acké** — opération traitée    | `ERROR` + `details` du rejet |
| **Erreur technique** (toute autre erreur)   | rethrow → **nack sans requeue** | `ERROR` / `INTERNAL_ERROR`   |

Conséquences à connaître :

- un rejet fonctionnel n'est **pas** une panne du consumer : le requeue-er en boucle serait inutile,
  la réponse à l'émetteur _est_ le statement `ERROR` ;
- le nack étant sans requeue (contrat `consume()` de `@leav/message-broker`), un message en erreur
  technique est **perdu** — d'où le statement `INTERNAL_ERROR` publié malgré tout avant le rethrow ;
- une opération à laquelle manque **l'un** de ses trois ids de traçabilité (`requestId`,
  `operationId`, `correlationId` — ce dernier étant la clé de corrélation _de l'émetteur_) est
  rejetée, mais **aucun statement n'est publié** : il ne pourrait pas être rattaché à l'opération. Le
  contrat ne traitant pas ce cas, c'est une décision leav.

Statuts émis : `SUCCESS`, `NO_CHANGE` (un `CREATE` sur un `systemId` déjà existant est _skippé_ par
l'import — rien n'est écrit), `ERROR`. **Il n'y a pas de détection fine du non-changement** : un
`UPDATE` appliqué vaut toujours `SUCCESS`, même si aucune valeur ne diffère réellement.

`sdo_identifier` est construit depuis le **record leav** (uuid + dates), pas depuis le document reçu —
c'est la raison pour laquelle `ISDOImportDomain.create/update` retournent `{record, changed}` au lieu
de `void`. Son bloc `identifier` (identifiants métier) suit la même règle **dès que le record
préexistait** (`UPDATE`, ou `CREATE` skippé) : il est relu depuis le record via les entrées de mapping
`identifier.*` (`sdoDomain.getRecordSDOIdentifier`), et non réécho du document — un patch peut ne pas
porter ce bloc, et un `CREATE` skippé n'a rien appliqué. Sur une **création réelle**, c'est le document
reçu qui fait foi. Cas particuliers : `{}` si le mapping ne déclare aucune clé `identifier.*` (leav ne
stocke alors aucun identifiant métier pour ce type, et aucune lecture n'est faite), et repli sur le
réécho si la relecture échoue — le bloc `identifier` ne doit jamais coûter le statement entier.

⚠️ La `date` d'un statement est en **secondes** (contrat), alors que celle de l'enveloppe d'export SDO
est en **millisecondes** (`Date.now()`). Ne pas s'inspirer de l'une pour l'autre.

## Activation de l'import par entité (`importEnable`) et exclusion d'attributs (`skipImport`)

Le mapping étant **partagé entre l'export et l'import**, une entité doit déclarer explicitement
qu'elle est importable (LEAVC-1091) — sans quoi la seule façon d'empêcher son import serait de la
retirer du mapping, ce qui casserait son export.

⚠️ **Les deux niveaux de `importEnable` n'ont pas le même défaut**, et c'est volontaire :

| Niveau                                          | Test effectué                   | Absent signifie |
| ----------------------------------------------- | ------------------------------- | --------------- |
| Racine — `settings.sdo.importEnable`            | `=== false` ⇒ coupé (permissif) | **actif**       |
| Entité — `settings.sdo.mapping[x].importEnable` | `!== true` ⇒ coupé (restrictif) | **inactif**     |

La racine reste le commutateur global : imports coupés à la racine ⇒ aucune entité n'est importée,
quelle que soit sa configuration.

Ce que fait chaque consumer d'une entité **non importable** :

| Flux    | Comportement                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------- |
| **SDO** | message **acké**, rien d'importé, aucun log d'import ; trace via `debug && logger.debug` (`config.sdo.debug`) |
| **DTO** | rejet fonctionnel `NOT_AUTHORIZED` ⇒ message acké + statement `ERROR` + `DTO_IMPORT_ERROR`                    |

L'asymétrie tient au contrat : l'émetteur d'un DTO attend une réponse, celui d'un SDO non.

> Un type **absent** du mapping n'est pas concerné : ça reste une anomalie de configuration, donc une
> erreur (`SDO_IMPORT_ERROR` + nack côté SDO, `INVALID_TYPE` côté DTO). Le contrôle `importEnable` ne
> s'applique qu'à une entité effectivement mappée.

Au niveau de l'attribut, `skipImport: true` l'exclut de l'import sans toucher à son export. Il n'a de
sens que sur une entité `importEnable: true`, et **neutralise `valueRequired`** pour cet attribut (cf.
section suivante) : exiger un attribut qu'on a décidé de ne pas importer rejetterait l'opération pour
rien.

**Déploiement** : le défaut restrictif couperait les imports des instances déjà configurées. La
migration `028-enableSdoImportOnMappedLibraries` pose donc `importEnable: true` sur chaque entité du
mapping existant qui ne se prononce pas — sauf si les imports sont déjà coupés à la racine. Elle ne
remplit que les clés **absentes**, donc un `false` posé ensuite par les ops survit à un rejeu. Les
entités **ajoutées après** au mapping devront porter `importEnable: true` explicitement.

## `valueRequired` : uniquement sur l'import DTO

Le flag `valueRequired` du mapping (`globalSettings.settings.sdo.mapping`) n'est lu **que** par le
consumer DTO (LEAVC-956) — ni à l'export, ni à l'import SDO, où il reste une donnée inerte.

- `CREATE` : tout attribut requis doit être présent **et** non vide ;
- `UPDATE` : c'est un patch, donc un attribut absent = « inchangé » (accepté) ; seul un attribut
  **présent mais vidé** (`null` / `''` / `[]`) est rejeté.
- un attribut `skipImport: true` n'est jamais requis, quel que soit son `valueRequired`.

## Tests

Les e2e du flux publient et consomment de vrais messages : `src/__tests__/e2e/api/sdo/rabbitMQUtils.ts`
tient **un canal par usage** (un exchange sur lequel publier, une queue à écouter). C'est structurel :
le `setup` d'un canal ne s'exécute qu'à sa création, donc un canal partagé n'asserterait
silencieusement que le premier exchange/queue et rendrait la suite dépendante de l'ordre des appels.

⚠️ **`waitForMessage` doit impérativement annuler son consumer**, y compris quand le message arrive
avant que `consume()` ait résolu son tag — d'où le `await` sur la promesse de `consume()` dans
`stop()`. Un consumer resté attaché continue de concurrencer la queue et **jette** (`nack` sans
requeue) les messages qu'attend l'appel suivant : symptôme, un `No matching message on "…"` qui ne
tombe que par intermittence, typiquement sous la charge des suites tournant en parallèle.

Les queues e2e sont **durables et jamais reset entre deux runs** : purger celles qu'on consomme
(`purgeQueue`) évite d'avoir à drainer tout l'historique avant le message attendu.
