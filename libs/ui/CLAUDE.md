# libs/ui — CLAUDE.md

`@leav/ui` — Composants React partagés du framework LEAV.
Consommé en interne par `app-studio`.
Publié sur npm pour les applications tierces qui utilisent LEAV : **AMP** et **xStream**.

---

## API publique réelle (consommée par AMP et xStream)

Ce sont les seuls symboles réellement utilisés par les consommateurs externes. Tout ce qui n'est pas dans cette liste est potentiellement un internal.

Pour mettre à jour cette liste, exécuter depuis `leav-engine/` :

```bash
grep -rh --include="*.ts" --include="*.tsx" "from '@leav/ui'" \   # cherche les lignes d'import de @leav/ui dans tous les .ts/.tsx (-r récursif, -h sans nom de fichier)
  ../amp-front ../xstream 2>/dev/null \                           # dans les deux repos consommateurs (erreurs silencieuses)
  | grep -v node_modules \                                        # exclut les dépendances installées
  | perl -ne 'if (/\{([^}]+)\}/) { print "$1\n" }' \              # extrait le contenu entre { et }
  | tr ',' '\n' \                                                 # découpe par virgule → un symbole par ligne
  | sed 's/^[[:space:]]*//' \                                     # supprime les espaces en début de ligne
  | sed 's/[[:space:]]*$//' \                                     # supprime les espaces en fin de ligne
  | grep -v '^$' \                                                # supprime les lignes vides
  | sort -u                                                       # trie et déduplique
```

**Composants :** `Explorer`, `EditRecordPage`, `EditRecordSkeleton`, `ErrorDisplay`, `InitNotificationsSubscription`, `AttributeConditionFilter`, `ThroughConditionFilter`, `CommonFilterItem`, `SelectTreeNode`

**Hooks :** `useAuth`, `useRedirectToLogin`, `useLang`, `useFilters`, `useFiltersContext`, `useFiltersReducer`, `useIFrameMessengerClient`, `useExecuteSaveValueBatchMutation`, `useGetRecordUpdatesSubscription`

**Contextes / Classes :** `LangContext`, `FiltersContext`, `IFrameMessengerClient`

**Utilitaires :** `gqlPossibleTypes`, `prepareFiltersForRequest`

**Constantes :** `NEW_RECORD_ID`, `SUCCESS_ALERT_DURATION`

**Types :** `ILangContext`, `UIFilter`, `IRecordIdentityWhoAmI`, `ITreeNodeWithRecord`, `ErrorDisplayTypes`

---

## Deux composants centraux

### Explorer (`src/components/Explorer/`) — voir [`Explorer/CLAUDE.md`](src/components/Explorer/CLAUDE.md)

Tableau interactif de records d'une Library : filtres, tri, vues sauvegardées,
actions primaires, actions par ligne, actions en masse.
**Architecture modulaire de référence** (organisation par feature, un dossier ≈ une feature) —
à suivre pour la structure de tout nouveau composant.

> ⚠️ Pour le **développement de vues**, cibler **ExplorerV2** (ci-dessous), pas ce composant.
> Explorer (v1) est **legacy** et sera remplacé.
>
> 📄 Corollaire documentaire : un savoir **commun aux deux copies** s'écrit dans
> `ExplorerV2/CLAUDE.md`, et `Explorer/CLAUDE.md` y renvoie — **jamais l'inverse**, puisque la doc
> v1 disparaîtra avec son dossier.

### ExplorerV2 (`src/components/ExplorerV2/`) — voir [`ExplorerV2/CLAUDE.md`](src/components/ExplorerV2/CLAUDE.md)

Fork **contrôlé** de l'Explorer, futur remplaçant (sera renommé `Explorer` une fois ViewV2
intégré — TODO dans `index.ts`). Ne possède aucune config de vue ni
volet : la vue lui est fournie en prop `currentView` par app-studio (source de vérité, cf.
ADR-006). C'est la cible de tout nouveau développement lié aux vues.

### RecordEdition (`src/components/RecordEdition/`)

Formulaire d'édition d'un record : rendu des champs selon le schéma de la Library,
gestion des valeurs (standard, link, tree), versioning, sidebar.
**Structure legacy** — plus monolithique, organisée par type de champ UI plutôt que par feature.
Les champs disponibles : `StandardField`, `LinkField`, `TreeField`, `FormTabs`, `FormDivider`, `TextBlock`, `Frame`.

> Pour tout nouveau composant ou refacto significatif, s'inspirer de la structure de l'Explorer,
> pas de RecordEdition.

---

## Structure

```
src/
├── components/          # Composants React (un dossier par composant)
│   ├── Explorer/        # ← structure de référence (voir section dédiée)
│   ├── RecordEdition/   # ← formulaire d'édition (legacy)
│   └── …               # autres composants (RecordCard, SearchModal, SelectTreeNode…)
├── hooks/               # Hooks globaux (auth, lang, user, cache, iFrame…)
├── _queries/            # Opérations GraphQL par domaine (attributes, records, trees…)
├── _gqlTypes/           # index.ts auto-généré — NE PAS MODIFIER À LA MAIN
├── gqlFragments/        # Fragments GraphQL réutilisables
├── contexts/            # UserContext, LangContext, EditRecordModalContext
├── _utils/              # Fonctions utilitaires (filtres, type guards…)
├── types/               # Types TypeScript du domaine UI
└── _tests/              # TestProviders + testUtils pour les tests
```

---

## GraphQL — pattern

1. Écrire l'opération dans un dossier `_queries/` **proche de l'usage**
   (ex: `src/components/Explorer/_queries/`) — c'est la convention de l'Explorer à suivre.
   Le dossier global `src/_queries/` est legacy et ne doit pas être alimenté pour du nouveau code.
2. Lancer `yarn graphql-generate` pour régénérer `src/_gqlTypes/index.ts`
3. Importer le hook généré depuis `_ui/_gqlTypes`

> ⚠️ Ne jamais modifier `src/_gqlTypes/index.ts` à la main — entièrement régénéré.
> La génération requiert un `apolloApiKey.js` valide (introspection du schéma de `apps/core`).
> Le schéma GraphQL complet est disponible sur **`http://core.leav.localhost/graphql`**
> quand le core est lancé (`docker compose up`).
>
> ⚠️ **Le générateur introspecte le core qui tourne, pas les sources** : un champ serveur tout juste
> ajouté (`apps/core`) impose de **redémarrer le core** avant `yarn graphql-generate`, sinon le champ
> est absent du schéma introspecté et donc du fichier généré — même si le code source du resolver est
> déjà là. Et dans un **worktree neuf**, `apolloApiKey.js` est **gitignoré donc absent** : le recopier
> depuis un worktree existant (ou le recréer, cf. commentaire du fichier) avant de lancer le codegen.

> ⚠️ **Collision de noms au codegen entre `Explorer/_queries/` et `ExplorerV2/_queries/`** :
> [`codegen.ts`](codegen.ts) agrège tous les `src/**/*.graphql` dans un **seul** fichier généré. Un
> nom d'opération/fragment partagé entre les deux dossiers ne casse la génération que tant que les
> deux documents restent **byte-identiques** — c'est ainsi que plusieurs `.graphql` de v1 et v2 ont pu
> partager un nom pendant longtemps. Dès que l'un des deux diverge, il faut le **renommer côté v2**
> (v1 est legacy et ne bouge pas). Piège : après un renommage oublié, l'ancien nom v1 **existe
> toujours** dans `_gqlTypes` (v1 le fournit encore) → un import v2 non renommé compile
> **silencieusement** et repart chercher le document v1. Garde-fou à lancer après toute modification
> d'un `.graphql` partagé (doit ne rien retourner, en adaptant les noms à l'opération concernée) :
>
> ```bash
> grep -rn "NomDeLOpérationV1Oublié" libs/ui/src/components/ExplorerV2
> ```

---

## Explorer — structure de référence

> Détails v1 vs ExplorerV2, état contrôlé/non contrôlé, props et câblage avec app-studio :
> [`Explorer/CLAUDE.md`](src/components/Explorer/CLAUDE.md) et
> [`ExplorerV2/CLAUDE.md`](src/components/ExplorerV2/CLAUDE.md).

| Sous-dossier                   | Rôle                                                                       |
| ------------------------------ | -------------------------------------------------------------------------- |
| `actions-primary/`             | Boutons "Créer" et "Lier"                                                  |
| `actions-item/`                | Actions par ligne (éditer statut, remplacer)                               |
| `actions-mass/`                | Actions en masse (désactiver, exporter, éditer attribut, générer previews) |
| `actions-mass/edit-attribute/` | Modal d'édition en masse d'attributs tree avec dépendances                 |
| `manage-view-settings/`        | Panneau latéral : filtres, tris, colonnes, vues sauvegardées               |
| `_queries/`                    | Requêtes spécifiques à l'Explorer                                          |

**Props clés :**

- `entrypoint` — Library cible (obligatoire)
- `defaultMassActions` — `'deactivate' | 'export' | 'editAttribute' | 'generatePreviews'`
- `defaultPrimaryActions` — `'create'`
- `defaultActionsForItem` — `'replaceLink' | 'remove' | 'activate'`

**API compound exposée :**

```tsx
Explorer.EditSettingsContextProvider;
Explorer.useEditSettings;
Explorer.SettingsSidePanel;
```

---

## Tests

- Framework : Vitest + Testing Library
- Wrapper obligatoire : `TestProviders` (`src/_tests/TestProviders.tsx`)
  — fournit MockedProvider Apollo, MemoryRouter, contextes User/Lang, Design System
- Fichiers de test colocalisés avec le composant : `MonComposant.test.tsx`

---

## Build

```bash
# Depuis libs/ui
yarn build               # Génère dist/ (build local optionnel — voir ci-dessous)
yarn test                # Tests unitaires
yarn graphql-generate    # Régénère _gqlTypes/index.ts
```

> ℹ️ Le dossier `dist/` est **gitignoré** : il n'est pas committé. C'est le job CI
> `build-npm-leav-ui` (`.gitlab-ci.yml`, déclenché sur tout changement dans `libs/ui/**`)
> qui reconstruit et publie le package `@leav/ui` consommé par les apps.
> En local, `app-studio` résout `@leav/ui` vers `src/` (alias `_ui`), donc `tscheck` et les
> tests passent sans build préalable. Le `yarn build` local ne sert qu'à vérifier le bundle.

---

## Styling — styled-components & CSS Modules

Deux approches coexistent. **styled-components** reste majoritaire dans l'existant, mais les
**CSS Modules** (`*.module.css`) sont la cible : alignement avec `app-studio`, AMP et xStream
(tous en Vite + lightningcss), et pas de coût runtime.

**Règle :**

- **Nouveau composant** → CSS Modules, jamais de `styled-components`.
- **Composant existant** → dès qu'on y ajoute ou modifie du style, le passer en CSS Modules quand
  c'est raisonnablement possible (styles locaux au fichier, pas de composant styled exporté ni
  d'interpolation de props complexe). Pas de migration « big bang » : on migre au fil des touches.
  Si le style à ajouter s'insère dans un `styled` existant trop imbriqué pour être extrait
  proprement, rester cohérent avec le fichier plutôt que mélanger les deux dans le même bloc.
- Un style conditionnel se traduit par un **choix de classe** (`className={cond ? a : b}` ou
  `undefined`), pas par une interpolation de props.

- **Import** : toujours en **named import**, classes en **camelCase** —
  `import {tagsGroup} from './X.module.css'`, jamais `import styles from …`. Le camelCase est
  requis pour que la classe soit importable par son nom.
- **Sélecteur global / spécificité** : `:global(.classe)` pour cibler une classe non scopée
  (ex. posée par le DS) ; répéter la classe locale (`.x.x.x`) pour monter en spécificité —
  équivalent du `&&&` de styled-components.
- **Build npm** : `tsc` n'émet pas les `.css`. `scripts/copy-css.mjs` (fin de `yarn build`)
  recopie `src/**/*.module.css` dans `dist/` à côté du JS compilé, pour que les consommateurs
  npm (AMP, xStream) les résolvent via leur bundler. En local, `app-studio` bundle directement
  `libs/ui/src` (alias `_ui`) et ne dépend pas de cette copie.
- **Typage** : `*.module.css` est déclaré non typé (`src/typings/cssModules.d.ts`).
  `vite/client` a été retiré du **tsconfig de build** (son `*.module.css` _default-export-only_
  bloquait les named imports) ; `import.meta.env` est typé par `src/typings/viteEnv.d.ts`.
  ⚠️ Il est **toujours présent dans `tsconfig.spec.json`** (`types: [… "vite/client"]`), ce qui rend
  la devDependency `vite` indispensable au `tscheck` bien qu'elle ne soit jamais importée.

---

## Dépendances — spécificités d'une lib publiée

`@leav/ui` est publiée sur npm : un consommateur externe n'installe que ses `dependencies` et ses
`peerDependencies`. La frontière entre code **publié** et code de **dev** est donnée par le `exclude`
de [`tsconfig.build.json`](tsconfig.build.json) (`**/*.test.*` et `**/_tests`) — d'où le placement en
`devDependencies` de `@testing-library/*` et `vitest`, importés uniquement depuis `src/_tests/`.

Pour auditer, utiliser le skill [`audit-dependencies`](../../.claude/skills/audit-dependencies/).

### Non déclarées à dessein

`antd`, `@fortawesome/{react-fontawesome,free-solid-svg-icons,fontawesome-svg-core}`, `classnames`,
`lodash` et `react-modal` sont **importés sans être déclarés**, y compris par du code publié (`antd` :
202 fichiers du `dist`). Ce sont des dépendances directes d'`aristid-ds`, notre `peerDependency`
hard-pinnée : les déclarer ici créerait un couplage de version avec le design system, et une seconde
copie d'`antd` chez le consommateur casserait le theming (contexte React).

> ⚠️ Conséquence assumée : un consommateur npm ne les obtient que par le hoisting d'`aristid-ds`.
> Si ce compromis devient gênant, la bonne réponse est de les passer en `peerDependencies`
> (le consommateur fournit l'instance unique), **pas** en `dependencies`.

### Non importées mais indispensables

| Package                      | Pourquoi                                                                                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vite`                       | `vite/client` dans les `types` de `tsconfig.spec.json` (cf. section Styling ci-dessus)                                                                                                    |
| `happy-dom`                  | `environment: 'happy-dom'` dans `vitest.config.ts` (chaîne, pas import)                                                                                                                   |
| `graphql`                    | Peer de `@apollo/client` et des plugins codegen                                                                                                                                           |
| `@graphql-codegen/*`         | Noms de plugins en chaînes dans [`codegen.ts`](codegen.ts), dont la clé `add:`                                                                                                            |
| `tsc-alias`, `typescript`    | Invoqués depuis les `scripts`                                                                                                                                                             |
| `@total-typescript/ts-reset` | Importé par `src/typings/reset.d.ts`. `tsc` ne ré-émet pas les `.d.ts` d'entrée, donc il n'atteint jamais `dist/` : `devDependencies` est bien le bon bloc, malgré ce que suggère un scan |

### Dette connue

`@ant-design/icons` est pinné en `5.6.1` alors qu'`antd@6.4.5` exige `^6.2.5` : **deux copies
coexistent** (5.6.1 à la racine, 6.3.2 sous `antd/node_modules`), d'où les warnings sourcemap au
build d'`app-studio`. Préexistant, à traiter à part.
