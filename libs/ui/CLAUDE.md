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

Deux approches coexistent. **styled-components** reste majoritaire ; les **CSS Modules**
(`*.module.css`) sont supportés et à privilégier pour le nouveau code (alignement avec
`app-studio`, AMP et xStream, tous en Vite + lightningcss).

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
  `vite/client` a été retiré des `tsconfig` (son `*.module.css` _default-export-only_ bloquait
  les named imports) ; `import.meta.env` est typé par `src/typings/viteEnv.d.ts`.
