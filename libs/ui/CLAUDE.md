# libs/ui — CLAUDE.md

`@leav/ui` — Composants React partagés du framework LEAV.
Consommé en interne par `app-studio` (et historiquement `data-studio`, en cours de suppression).
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

**Constantes :** `NEW_RECORD_ID`, `SUCCESS_ALERT_DURATION`, `TOOLTIP_DEFAULT_DELAY_IN_SECONDS`

**Types :** `ILangContext`, `UIFilter`, `IRecordIdentityWhoAmI`, `ITreeNodeWithRecord`, `ErrorDisplayTypes`

---

## Deux composants centraux

### Explorer (`src/components/Explorer/`)

Tableau interactif de records d'une Library : filtres, tri, vues sauvegardées,
actions primaires, actions par ligne, actions en masse.
**C'est la structure de référence** — modulaire, récente, à suivre pour tout nouveau développement.

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

- Framework : Jest + Testing Library
- Wrapper obligatoire : `TestProviders` (`src/_tests/TestProviders.tsx`)
  — fournit MockedProvider Apollo, MemoryRouter, contextes User/Lang, Design System
- Fichiers de test colocalisés avec le composant : `MonComposant.test.tsx`

---

## Build

```bash
# Depuis libs/ui
yarn build               # Génère dist/ — doit être commité pour être consommé par les apps
yarn test                # Tests unitaires
yarn graphql-generate    # Régénère _gqlTypes/index.ts
```

> ⚠️ Le dossier `dist/` doit être commité après chaque modification publiable.
