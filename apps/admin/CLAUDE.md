# apps/admin — CLAUDE.md

Interface d'administration d'une instance LEAV : gestion des libraries, attributs,
permissions, arbres, vues, profils de versioning.
Inclut une feature **history** pour consulter l'historique des actions (remplace Kibana interne).

> Un effort de mise à jour a été fait : les versions React, Apollo, GraphQL, Vite et TypeScript
> sont alignées avec `app-studio`. La migration vers `aristid-ds` est en cours —
> `semantic-ui-react` coexiste encore avec le design system le temps de la transition.

## Stack

- React + Vite + TypeScript
- Apollo Client + GraphQL
- Redux + Redux Toolkit (state management)
- `aristid-ds` (design system cible) + `semantic-ui-react` (migration en cours)
- Formik (formulaires), react-dnd (drag & drop)
- i18next, Jest

## Structure

> ⚠️ **Toute nouvelle fonctionnalité va dans `modules/`** — c'est la seule destination pour du nouveau code.
> Les autres dossiers (`components/`, `hooks/`, `queries/`, etc.) sont du code existant et ne doivent pas recevoir de nouvelles features.

> Le **shell applicatif** lui-même migre progressivement de `components/` vers `modules/`.
> Le **header** en est le premier exemple : il vit désormais dans `modules/layout/` (`Header`),
> `modules/switch-language/` (`LanguageSelector`, un `KitSelect` calqué sur app-studio) et
> `modules/applications-switcher/` (bouton + `KitDropDown` de changement d'application), en
> remplacement de l'ancien header `semantic-ui-react` supprimé de `components/app/`. Il s'aligne sur
> le `KitHeader` d'`apps/app-studio` (`modules/layout/RootHeader.tsx`).

```
src/
├── modules/       # ✅ Cible pour toutes les nouvelles features + shell migré (layout, history, navigation-menu, routes…)
├── components/    # Shell applicatif legacy (ApolloHandler, App, Navigation…)
├── hooks/         # Hooks custom legacy
├── queries/       # Opérations GraphQL legacy
├── reduxStore/    # Slices Redux + store legacy
├── context/       # Providers React legacy
├── _gqlTypes/     # Types GraphQL générés — ne pas modifier
├── config/        # Initialisation du router
└── utils/         # Utilitaires
```

## Build

```bash
yarn build:install  # Build vers apps/core/applications/admin/
```

### ⚠️ Le build est dominé par la compilation LESS de Fomantic

Le `vite build` de cette app était le plus lent des fronts du monorepo, à cause du hook
`vite:css transform` : la compilation de l'entrée LESS de Fomantic représentait **91 % du temps de
build** (36,6 s sur 40,2 s). C'est du compile LESS, pas du poids de fonts — piège classique, les
fonts n'apparaissent dans les logs qu'après le trou de temps, ce qui les fait accuser à tort.

Trois leviers sont donc en place, et il faut les connaître avant de toucher au theming :

1. **`src/semantic-ui/semantic.less`** est une **copie locale** de
   `node_modules/fomantic-ui-less/semantic.less` privée de `elements/emoji` et `elements/flag` —
   c'est elle qu'importe `src/index.tsx`, pas l'entrée du package. `elements/emoji` coûtait à lui
   seul **~5,2 s de compile et 767 ko de CSS** (une `@emoji-map` de 3 841 lignes → ~3 800 règles
   `[data-emoji]`) alors que `Emoji` n'existe pas dans `semantic-ui-react` 2.x ; `elements/flag`
   (~570 ms + un sprite) est mort aussi, les drapeaux venant de `react-flag-kit`.
   → **Lors d'un bump de `fomantic-ui-less`, resynchroniser cette liste d'imports** : un nouveau
   composant upstream n'y apparaît pas tout seul.
2. **`site/globals/site.variables`** : `@importFonts: false` supprime les 8 `@font-face` Lato
   (16 fichiers, 1,9 Mo d'assets) — inutiles puisque `src/index.css` met déjà le `body` en
   `sans-serif`. `@supportIE: false` supprime les doublons `.woff` et les hacks `-ms-*`.
   Ne pas vider `@fontName` pour autant : il ouvre la liste `@pageFont`/`@headerFont`, qui
   commencerait alors par une virgule — `font-family` invalide. Les `.ui.*` déclarent donc toujours
   `font-family: Lato, system-ui, …`, mais la fonte n'étant pas chargée, c'est `system-ui` qui
   s'applique.
3. **`site/elements/icon.variables`** : `@variationIconBrand: false` coupe les 506 brand-icons, mais
   **seulement les règles CSS** — le `@font-face` est émis par `each(@fonts)` sous `@importIcons`,
   d'où la redéclaration de la map `@fonts` sans l'entrée brand. Les **outline-icons doivent
   rester** (`edit outline`, `save outline`, `trash alternate outline`, `plus square outline`).

Résultat : build **40,2 s → 7,8 s**, CSS 2 727 → 1 929 ko, et 2 fichiers de font émis (91 ko) au
lieu de 22 (2,63 Mo).

Un tri plus fin (n'importer que les 31 définitions réellement rendues au lieu de 50) descendrait à
~1,9 s / 1,41 Mo, mais n'a pas été retenu : gain marginal contre le risque d'oublier un composant
utilisé via une classe brute (`className="ui placeholder segment"` par exemple, qui n'apparaît dans
aucun import `semantic-ui-react`).

---

## Dépendances à usage non évident

Pour auditer, utiliser le skill [`audit-dependencies`](../../.claude/skills/audit-dependencies/).

### Non importées par leur nom, mais indispensables

| Package                    | Pourquoi                                                                                                                                                                                                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@leav/ui`                 | **Jamais importé sous ce nom** : le code passe par l'alias `_ui/*` (défini dans [`vite-config-common.mjs`](../../vite-config-common.mjs) et `vitest.config.ts`), qui pointe vers `libs/ui/src`. La dépendance workspace reste ce qui garantit l'installation des deps de `libs/ui`. |
| `fomantic-ui-less`         | Jamais importé par son nom : `src/index.tsx` fait un import **nu** de l'entrée locale `./semantic-ui/semantic.less` (voir § Build), qui `@import` les définitions du package. Aussi `@import` dans `src/semantic-ui/theme.config` + `scripts/fixSemanticUiCss.js` (postinstall).    |
| `less`                     | Vite compile les `.less`, le package n'est jamais importé.                                                                                                                                                                                                                          |
| `@graphql-codegen/add`     | Le plugin `add:` est une **clé de config** dans [`codegen.ts`](codegen.ts), invisible à un scan d'imports.                                                                                                                                                                          |
| `vite-plugin-dynamic-base` | Importé par [`vite.config.js`](vite.config.js) uniquement.                                                                                                                                                                                                                          |
| `graphql`, `jsoneditor`    | Satisfont les `peerDependencies` de `@apollo/client`/`graphql-ws` et de `jsoneditor-react`.                                                                                                                                                                                         |
| `happy-dom`                | `environment: 'happy-dom'` dans `vitest.config.ts` (chaîne).                                                                                                                                                                                                                        |

### Non déclarées à dessein

`antd` (imports de type uniquement) et `@fortawesome/*` sont importés sans être déclarés : ce sont des
dépendances d'`aristid-ds`, distribué en commit-pin. Les pinner ici créerait un couplage de version
avec le design system — cf. [`libs/ui/CLAUDE.md`](../../libs/ui/CLAUDE.md).

### ⚠️ ~109 fichiers de test entièrement commentés

Une grande partie des `*.test.tsx` de `components/` est **intégralement en commentaires** (héritage
`enzyme` + `react-test-renderer`, incompatibles React 18). Deux conséquences :

- un scan d'imports naïf les lit et réclame `enzyme`, `react-router-dom-v5`, `react-sortable-tree`
  ou `react-test-renderer` comme dépendances manquantes — **ne pas les déclarer** ;
- inversement, `react-test-renderer` et `@types/react-test-renderer` sont encore déclarés alors
  qu'ils ne servent plus qu'à ce code mort : candidats au retrait.

La suppression de ces fichiers est un chantier à part (rien ne les exécute : `vitest` les compte
comme « skipped »).
