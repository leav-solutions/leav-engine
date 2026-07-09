# Tests e2e — `apps/core`

Mémo Claude pour écrire un test e2e.

## Quand

- Valider l'**API GraphQL** au niveau du bord, contre un vrai serveur `core` qui tourne.
- Cibles : chemins critiques CRUD, permissions/ACL, contrats GraphQL, scénarios multi-mutations.
- La logique métier reste couverte par les unitaires (`*.spec.ts`) et l'intégration ([`__tests__/integration/`](../integration/)). N'ajoute pas un e2e si un test moins coûteux suffit.

## Pattern moderne (à suivre pour tout nouveau test)

1. **Écrire un fichier `.graphql`** co-localisé avec le test (ex. `myFeature/MyFeature.graphql` ↔ `myFeature/myFeature.test.ts`). Plusieurs opérations dans le même fichier sont OK et même encouragées si elles couvrent un domaine cohérent.
2. **Régénérer le SDK** : `yarn graphql-generate` (depuis `apps/core/`). Cela met à jour [`_gqlTypes/index.ts`](_gqlTypes/index.ts) — un seul fichier global qui contient tous les types et le `getSdk()`. Pré-requis :
    - le serveur `core` tourne (la config [`codegen.ts`](../../../codegen.ts) introspecte `http://core.leav.localhost/graphql`) ;
    - le fichier `apps/core/apolloApiKey.js` existe localement (cf. `apolloApiKey.js.example`).
3. **Importer** depuis `_gqlTypes` (types/enums/inputs) et le SDK pré-authentifié depuis [`api/e2eUtils.ts`](api/e2eUtils.ts).
4. **Écrire le test** : appel direct sur le SDK, assertions Vitest.

Pas de regen nécessaire si tu modifies seulement le `.test.ts` (ou les valeurs de variables) sans toucher aux opérations `.graphql`.

## Référence canonique

[`api/automation/Automation.graphql`](api/automation/Automation.graphql) + [`api/automation/automation.test.ts`](api/automation/automation.test.ts). Calquer dessus.

## Conventions GraphQL

- Une opération **nommée** par bloc : `query GetXxx(...)`, `mutation CreateXxx(...)`. Le nom devient la méthode du SDK (`adminUserSdk.GetXxx`) et le préfixe des types (`GetXxxQuery`, `GetXxxQueryVariables`).
- **PascalCase** pour les noms d'opérations.
- Variables GraphQL (`$rule: CreateAutomationRuleInput!`) plutôt que valeurs inline.
- Fragments autorisés mais à éviter sauf gain réel ; les exemples actuels n'en utilisent quasiment pas.

## Pièges codegen (à lire avant d'écrire)

Le codegen est configuré avec [`enumValues: 'keep'`](../../../codegen.ts) — les **clés** des enums TypeScript générés sont les **valeurs littérales** déclarées dans le schéma GraphQL, pas les clés des enums source côté serveur. Cela conduit à des asymétries surprenantes :

| Côté serveur (`src/_types/`)              | Côté SDK (`_gqlTypes`)             | Pourquoi                                                                                                                    |
| ----------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `enum ViewV2Types { LIST = 'list' }`      | `ViewV2Types.list` (minuscule !)   | Le schéma GraphQL est généré via `Object.values(enum).join(' ')`, donc la valeur `'list'` devient la clé de l'enum codegen. |
| `enum ViewV2Sizes { SMALL = 'SMALL' }`    | `ViewV2Sizes.SMALL` (majuscule)    | Ici la valeur source est déjà en majuscule, donc la clé codegen tombe juste.                                                |
| `AttributeCondition.EQUAL` (domain TS)    | `RecordFilterCondition.EQUAL`      | Le **nom** GraphQL diffère du nom TS — l'enum est exposé sous un autre identifiant dans le schéma.                          |
| `IRecordSortLight.order: 'asc' \| 'desc'` | `SortOrder.asc` / `SortOrder.desc` | Pas d'enum source côté domain, juste un union de string ; le schéma déclare un vrai enum nommé `SortOrder`.                 |

**Règles à appliquer systématiquement :**

- **Importer** enums, inputs et types d'opérations **uniquement depuis `_gqlTypes`** — jamais depuis `src/_types/`. Mélanger les deux mondes finit toujours par un cast ou une erreur runtime.
- **Vérifier le nom exact** d'un enum/input avant de le citer : `grep -E "^export (enum|type) NomCherché" apps/core/src/__tests__/e2e/_gqlTypes/index.ts`. C'est un seul fichier de ~2000 lignes, grep est instantané.
- **Si une méthode du SDK n'existe pas** (`Property 'CreateXxx' does not exist on type ...`), c'est presque toujours que tu as oublié de relancer `yarn graphql-generate` après avoir modifié un `.graphql`.

## SDK et utilisateurs

Les trois SDK pré-authentifiés exportés par [`api/e2eUtils.ts`](api/e2eUtils.ts) :

| SDK               | Rôle                                                    |
| ----------------- | ------------------------------------------------------- |
| `adminUserSdk`    | Admin global. À utiliser par défaut.                    |
| `nonAdminUserSdk` | Utilisateur sans droits — pour tester les rejets ACL.   |
| `guestUserSdk`    | Utilisateur guest — pour tester les vues "shared", etc. |

Cas particulier (utilisateur custom) : `getSdkWithUser(e2eAdminUser())` ou `getSdkWithUser({userId, getAuthToken})` — rare, ne fais ça que si les trois SDK ne suffisent pas.

## Structure d'un test

```ts

import {SomeEnum} from '../../_gqlTypes';
import {adminUserSdk, nonAdminUserSdk} from '../e2eUtils';

describe('MyFeature', () => {
    test('does the thing', async () => {
        const {myMutation: result} = await adminUserSdk.MyMutation({input: {...}});
        expect(result).toMatchObject({id: expect.any(String)});
    });

    test('non-admin is rejected', async () => {
        await expect(nonAdminUserSdk.MyQuery()).rejects.toThrow('Action forbidden');
    });
});
```

## Patterns d'assertion (calqués sur `automation.test.ts`)

```ts
// Cas nominal — destructurer la racine GraphQL
const {createAutomationRule: newRule} = await adminUserSdk.CreateAutomationRule({rule: {...}});
expect(newRule).toMatchObject({id: expect.any(String), label: 'Test rule'});

// Liste & objets imbriqués
expect(rules.automationRules.list).toEqual([
    expect.objectContaining({id: newRule.id, createdAt: expect.any(Number)}),
]);

// Permissions / validation serveur — l'erreur GraphQL est rethrown par le SDK
await expect(nonAdminUserSdk.GetAutomationRules()).rejects.toThrow('Action forbidden');
await expect(adminUserSdk.CreateAutomationRule({rule: invalidRule})).rejects.toThrow();
```

## Lancer les tests

| Cible                      | Commande                                                                       |
| -------------------------- | ------------------------------------------------------------------------------ |
| Localement, hors container | `yarn run test:e2e:api`                                                        |
| Dans le container `core`   | `docker exec -i $(docker container ls -aqf "name=core") yarn run test:e2e:api` |
| Filtrer une suite          | `yarn run test:e2e:api -- myFeature`                                           |

Pré-requis : core tourne, ArangoDB joignable. Config Vitest : [`vitest.e2e-api.config.ts`](../../../vitest.e2e-api.config.ts). Setup partagé : [`api/globalSetup.ts`](api/globalSetup.ts) et [`e2eVitestSharedContext.ts`](e2eVitestSharedContext.ts).

> ⚠️ **Env obligatoire pour un run isolé.** Le `globalSetup` provisionne les utilisateurs (dont le
> guest) uniquement quand `CONFIG_IGNORE_LOCAL=true NODE_ENV=test NODE_OPTIONS='--import tsx'` sont
> posés — c'est ce que fait le script `test:e2e:api`. Un `npx vitest run <fichier>` **brut** (sans ces
> vars) échoue au setup avec `Cannot destructure property 'userId' of 'undefined'` (`e2eGuestUser`).
> Pour lancer **une seule suite** de façon fiable, garder les vars et passer le motif en positionnel :
> `docker exec -i $(docker container ls -aqf "name=core") sh -c "CONFIG_IGNORE_LOCAL=true NODE_ENV=test NODE_OPTIONS='--import tsx' npx vitest run -c vitest.e2e-api.config.ts <motif>"`.
> Préférer **le container** (env complet) au run local. Certaines suites dépendent de services
> optionnels (ex. `mailpit` → profil docker `mail`) : sans eux, elles échouent indépendamment de ton code.

## Hors `api/`

Les répertoires [`filesManager/`](filesManager/) et [`indexationManager/`](indexationManager/) ont leurs propres configs Vitest (`vitest.e2e-filesManager.config.ts`, `vitest.e2e-indexationManager.config.ts`) et leurs propres scripts (`yarn run test:e2e:filesManager`, `yarn run test:e2e:indexationManager`). Le SDK GraphQL généré est partagé — la config codegen scanne `src/__tests__/e2e/**/*.graphql`.

## À éviter (pattern legacy)

**N'utilise jamais ces APIs dans un nouveau test :**

- `makeGraphQlCall(query: string, ...)` — l'ancien helper qui prend une string GraphQL ([`api/e2eUtils.ts:105`](api/e2eUtils.ts#L105)).
- `importFileGraphQlCall(...)` — variante upload de fichier, même problème.
- Les helpers historiques basés sur `makeGraphQlCall` exportés par `api/e2eUtils.ts` : `gqlSaveAttribute`, `gqlSaveTree`, `gqlCreateRecord`, `gqlAddElemToTree`, `gqlSaveLibrary`, etc. Ils restent uniquement pour la maintenance des tests existants.

S'il manque une opération CRUD partagée (ex. créer une library de fixture), écris-la dans un `.graphql` partagé plutôt que de réutiliser un de ces helpers string-based.
