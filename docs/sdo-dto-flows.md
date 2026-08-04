# Flux SDO / DTO — implémentation côté leav

> Le **contrat fonctionnel** (formats des messages, catalogue des codes d'erreur, cycle de vie) est la
> propriété du repo `engine-knowledge` : [`sdo-dto/docs/func/sdo/`](https://gitlab.aristid.com/dev/xstream/engine/engine-knowledge/-/tree/main/sdo-dto/docs/func/sdo)
> (`message-formats.md`, `rabbitmq-contract.md`). Ce fichier ne le reproduit pas : il consigne
> uniquement ce qui est **propre à l'implémentation leav** et non déductible du code.

Le code vit exclusivement dans `apps/core` : `app/sdo/` (consumers), `domain/sdo/` (export, import,
statement), `infra/sdo/` (canaux AMQP, snapshot des contenus exportés), `interface/sdo.ts` (binding
des consumers au boot).

## Les trois exchanges — et leur type réel

| Config                        | Exchange                        | Sens             | Type déclaré |
| ----------------------------- | ------------------------------- | ---------------- | ------------ |
| `sdo.exchange`                | `<c>_sdo`                       | export + import  | `fanout`     |
| `sdo.dto.import.exchange`     | `<c>_dto_import`                | Data Platform →  | `direct`     |
| `sdo.dto.statement.exchange`  | `<c>_dto_operation_statement`   | → Data Platform  | `direct`     |

⚠️ **Le contrat affirme que tous ses exchanges sont en `fanout` ; c'est faux sur le bus réel** pour le
flux DTO — d'où le passage de `dto_import` en `direct` (commit `b36fb1b32`), et le même défaut pour le
statement. Un type qui ne correspond pas à celui déjà déclaré sur le broker fait répondre
`PRECONDITION_FAILED` et fermer le canal : **le type est donc surchargeable par env**
(`DTO_IMPORT_EXCHANGE_TYPE`, `DTO_STATEMENT_EXCHANGE_TYPE`) pour ne pas exiger une livraison de code
si un environnement diverge.

Les trois canaux vivent sur une **connexion AMQP dédiée** (`config.sdo.amqp`), distincte de celle du
core (`config.amqp`) : seul le canal des data events de l'export est sur celle du core.

## Import DTO — ack, nack et statement

Deux natures d'échec, deux comportements (`app/sdo/dtoImportApp.ts`) :

| Nature                                                    | Message AMQP                    | Statement                    |
| --------------------------------------------------------- | ------------------------------- | ---------------------------- |
| **Rejet fonctionnel** (`DTORejectionError`)               | **acké** — opération traitée    | `ERROR` + `details` du rejet |
| **Erreur technique** (toute autre erreur)                 | rethrow → **nack sans requeue** | `ERROR` / `INTERNAL_ERROR`   |

Conséquences à connaître :

- un rejet fonctionnel n'est **pas** une panne du consumer : le requeue-er en boucle serait inutile,
  la réponse à l'émetteur *est* le statement `ERROR` ;
- le nack étant sans requeue (contrat `consume()` de `@leav/message-broker`), un message en erreur
  technique est **perdu** — d'où le statement `INTERNAL_ERROR` publié malgré tout avant le rethrow ;
- une opération **sans `operationId`** ne peut être corrélée par l'émetteur : elle est rejetée, mais
  **aucun statement n'est publié** (il serait inexploitable). Limite assumée.

Statuts émis : `SUCCESS`, `NO_CHANGE` (un `CREATE` sur un `systemId` déjà existant est *skippé* par
l'import — rien n'est écrit), `ERROR`. **Il n'y a pas de détection fine du non-changement** : un
`UPDATE` appliqué vaut toujours `SUCCESS`, même si aucune valeur ne diffère réellement.

`sdo_identifier` est construit depuis le **record leav** (uuid + dates), pas depuis le document reçu —
c'est la raison pour laquelle `ISDOImportDomain.create/update` retournent `{record, changed}` au lieu
de `void`.

⚠️ La `date` d'un statement est en **secondes** (contrat), alors que celle de l'enveloppe d'export SDO
est en **millisecondes** (`Date.now()`). Ne pas s'inspirer de l'une pour l'autre.

## `valueRequired` : uniquement sur l'import DTO

Le flag `valueRequired` du mapping (`globalSettings.settings.sdo.mapping`) n'est lu **que** par le
consumer DTO (LEAVC-956) — ni à l'export, ni à l'import SDO, où il reste une donnée inerte.

- `CREATE` : tout attribut requis doit être présent **et** non vide ;
- `UPDATE` : c'est un patch, donc un attribut absent = « inchangé » (accepté) ; seul un attribut
  **présent mais vidé** (`null` / `''` / `[]`) est rejeté.

## Tests

Les e2e du flux publient et consomment de vrais messages : `src/__tests__/e2e/api/sdo/rabbitMQUtils.ts`
tient **un canal par usage** (un exchange sur lequel publier, une queue à écouter). C'est structurel :
le `setup` d'un canal ne s'exécute qu'à sa création, donc un canal partagé n'asserterait
silencieusement que le premier exchange/queue et rendrait la suite dépendante de l'ordre des appels.
