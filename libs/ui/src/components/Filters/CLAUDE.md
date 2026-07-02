# Filters — CLAUDE.md

`@leav/ui/components/Filters` — moteur de **filtres de recherche de records** d'une Library.
Construit la liste de conditions `RecordFilterInput[]` envoyée à la query GraphQL `records`, et fournit
l'UI d'édition de chaque filtre (chips `KitFilter` + dropdowns par type d'attribut).

Composant **public** : consommé en interne par l'Explorer (`@leav/ui`), et **publié sur npm** pour les
consommateurs externes — notamment **xStream** (qui monte son propre `FiltersProvider` / `FiltersContext`
et appelle `prepareFiltersForRequest` pour sa propre query records).

> ⚠️ Symboles publics réels (cf. [`libs/ui/CLAUDE.md`](../../../CLAUDE.md) § API publique) :
> `CommonFilterItem`, `FiltersContext`, `useFilters`, `useFiltersContext`, `useFiltersReducer`,
> `prepareFiltersForRequest`, `UIFilter`, `AttributeConditionFilter`, `ThroughConditionFilter`.
> Tout le reste est interne et peut bouger sans préavis.

---

## Le concept central : `UIFilter`

Un **`UIFilter`** (`_types.ts`) est la représentation d'un filtre **en cours d'édition dans l'UI** : il
porte l'attribut ciblé, sa condition, sa valeur courante, et de quoi s'afficher (label, valeur formatée).
C'est la **monnaie d'échange** du module — tout transite par lui.

Trois formats coexistent, à ne pas confondre :

| Format                  | Qui le produit / consomme                     | Forme                                                                 |
| ----------------------- | --------------------------------------------- | --------------------------------------------------------------------- |
| **Filtre stocké**       | une vue sauvegardée (`view.filters`, GraphQL) | `{field, condition, value, hidden, withEmptyValues}` — `value` mono   |
| **`UIFilter`**          | l'état du reducer, l'édition, les chips       | objet riche typé par type d'attribut (`value` parfois `string[]`)     |
| **`RecordFilterInput`** | la query `records` (core)                     | liste plate avec opérateurs `AND/OR` et brackets `OPEN/CLOSE_BRACKET` |

Les conversions :

```
view.filters (stocké)                         UIFilter[]                       RecordFilterInput[]
─────────────────────         toUIFilters         ─────────       prepareFiltersForRequest    ───────────
{field,condition,value}  ───────────────────►   UIFilter   ──────────────────────────────►  query records
        ▲                  (useTransformFilters)     │
        │                                            │  édition utilisateur (dropdowns) via dispatch
        └──── toValidFilters (filtre/découpe) ◄──────┘     CHANGE_FILTER_CONFIG / ADD_FILTER / …
```

- **`toValidFilters`** ([useTransformFilters.tsx](useTransformFilters.tsx)) : nettoie une liste stockée
  (rejette les filtres sans `field`) et **découpe les filtres "through"** : un `field` contenant un `.`
  (ex. `link.subAttr`) devient un `IUIFilterThrough` (`field` + `subField` + `subCondition`). C'est un hack
  documenté : la vue ne stocke pas assez d'info, on reconstruit depuis le `field`.
- **`toUIFilters`** : enrichit chaque filtre valide avec les **métadonnées d'attribut** (type, format,
  valuesList, linked_library/linked_tree, smart_filter) résolues via `useExplorerAttributesQuery`, et
  produit le `UIFilter` typé correspondant (standard / link / through / valueList / tree / smartFilter).
  Les attributs introuvables ou sans permission `access_attribute` sont **silencieusement écartés** (warn).
- **`prepareFiltersForRequest`** ([prepareFiltersForRequest.ts](prepareFiltersForRequest.ts)) : transforme
  les `UIFilter` en `RecordFilterInput[]`. C'est ici que se joue toute la logique de **format de query**
  (voir plus bas).

---

## Les pièces

| Fichier                                   | Rôle                                                                                                                                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `_types.ts`                               | `UIFilter` (union) + ses sous-types + tous les type-guards (`isUIFilterTree`, `isUIFilterValueList`…)                                                                                |
| `context/filtersReducer.ts`               | Reducer pur : `ADD_FILTER`, `CHANGE_FILTER_CONFIG`, `RESET_FILTER`, `MOVE_FILTER`, `REMOVE_FILTER`, `RESET`…                                                                         |
| `context/useFiltersReducer.tsx`           | Branche le reducer aux queries (vues + attributs + arbres) et **seed** l'état via `RESET`                                                                                            |
| `context/filtersContext.tsx`              | `FiltersContext` (`{filtersData, dispatch}`)                                                                                                                                         |
| `FiltersProvider.tsx`                     | Provider clé-en-main : `useFiltersReducer` + `FiltersContext.Provider`                                                                                                               |
| `useFiltersContext.ts` / `useFilters.tsx` | Accès au contexte ; `useFilters` projette les filtres **non `hidden`** en props d'affichage                                                                                          |
| `useTransformFilters.tsx`                 | `toValidFilters` / `toUIFilters` (conversions stocké ↔ UIFilter)                                                                                                                     |
| `prepareFiltersForRequest.ts`             | `UIFilter[]` → `RecordFilterInput[]` (la query records)                                                                                                                              |
| `filter-items/CommonFilterItem.tsx`       | **La chip `KitFilter` éditable** : label + valeurs formatées + `FilterDropDown`                                                                                                      |
| `filter-items/filter-type/*`              | Un dropdown d'édition par type/format (Text, Numeric, Date, Boolean, Link, Tree, ValueList, Smart…)                                                                                  |
| `context/useGetTreeFilters.tsx`           | Charge les **valeurs par défaut d'arbres** liées aux permissions contextuelles (`view-by-default`)                                                                                   |
| `useViewFiltersConverter.tsx`             | Pont **ViewV2** : `{attributes,condition,values}` stocké → `UIFilter` (id stable = chemin d'attribut) ; exporte aussi `uiFilterToConfig` (UIFilter → `{id, condition, values}` lean) |
| `useResolveTreeFilterNodes.tsx`           | **ViewV2** : résout des `recordIds` arbre stockés → `{nodeId, libraryId, label}` (rechargement)                                                                                      |
| `useControlledFilterStore.tsx`            | **ViewV2** : store interne d'un spoke hub & spoke (ExplorerV2 ou volet) — see ci-dessous                                                                                             |

---

## Utilisation

### Cas 1 — provider clé-en-main (le plus simple)

Monter `<FiltersProvider>` au-dessus de l'UI ; il charge les vues/attributs et seed l'état. Lire l'état
via `useFilters()` / `useFiltersContext()`, rendre chaque filtre avec `<CommonFilterItem>`, et construire
la query avec `prepareFiltersForRequest(filtersData, filtersOperator)`.

```tsx
<FiltersProvider libraryId={libraryId} viewId={viewId} skip={false}>
    <MesChips /> {/* useFilters() → map → <CommonFilterItem filter=… /> */}
</FiltersProvider>
```

`IFiltersProviderProps` : `libraryId` (null = pas de fetch), `viewId`, `filters` (filtres par défaut),
`filtersOperator` (`'AND' | 'OR'`), `ignoreViewByDefault`, `skip`.

### Cas 2 — vue contrôlée ViewV2 : `useControlledFilterStore` (ExplorerV2)

Pour ExplorerV2 (et le volet app-studio), le store n'est **pas** un contexte partagé mais un store local
par spoke, alimenté depuis le hub lean (`currentView.filters`). Utiliser `useControlledFilterStore` :

```tsx
const {filtersData, dispatch} = useControlledFilterStore({
    leanFilters, // SerializedFilter[] non-hidden venant de currentView.filters
    libraryId,
    viewId,
    onChange, // (filters: SerializedFilter[]) => void — émis sur édition/suppression (echo-suppressed)
});
// Exposer via FiltersContext.Provider pour CommonFilterItem
```

Le hook orchestre trois effets coordonnés qui rendent le cycle hub ↔ spoke contractif (chaque hop est
un no-op ou converge en un tour) :

1. **SEED / reseed** (changement structurel ou résolution d'arbre) : convertit les filtres lean en
   `UIFilter[]` (`useViewFiltersConverter`) + résout les recordIds arbre (`useResolveTreeFilterNodes`) ;
   re-seed le store en préservant les sélections vivantes par id. Un tree vivant dont la valeur diffère
   du seed adopte la valeur du hub (seul chemin d'adoption pour les trees).
2. **ADOPT** (hub → store, valeur seulement) : quand une valeur change sur l'_autre_ spoke sans
   changement structurel, `CHANGE_FILTER_CONFIG` réconcilie le store. La **sélection de nœuds** d'un tree
   ne passe pas par ici (elle a besoin de la résolution → SEED), **mais** son flag `withEmptyValues` — sans
   résolution — **est adopté ici** (posé sur le filtre existant sans toucher aux nœuds) : sinon un changement
   de "non défini" venu du hub (RESET_VIEW, édition sur l'autre spoke) n'atteindrait jamais ce store.
3. **EMIT** (store → hub) : quand la projection lean du store diverge de `lastSyncedLeanRef`
   _et_ du hub, un `onChange(lean[])` est émis une seule fois. `lastSyncedLeanRef` (clé sur les valeurs,
   pas l'identité objet) supprime les échos : une valeur poussée par le hub n'est jamais re-émise.

> 🔁 **`initialFilters` (cible de `RESET_FILTER`)** est **stable** : reconstruit uniquement sur changement
> **structurel** (jamais sur une édition de valeur, qui rebaseline-rait à tort). Pour les arbres, les nœuds
> "initiaux" sont résolus séparément des recordIds **sauvegardés** (`useResolveTreeFilterNodes` sur un
> snapshot pré-édition, cache-hit), car une édition d'arbre déclenche un reseed via `resolvedById`. Sans ça,
> "Réinitialiser" restaurerait les nœuds courants, pas les nœuds sauvegardés.

> ℹ️ Ce hook remplace le Cas 3 legacy (voir ci-dessous). Ne pas mélanger les deux dans le même composant.

### Cas 3 — store direct (legacy / usage avancé)

Un consommateur peut aussi monter directement `FiltersContext.Provider` avec son propre
`useReducer(filtersReducer(...), ...)` (ou `useFiltersReducer`) pour partager **un seul store** entre
plusieurs surfaces. `CommonFilterItem` édite alors le même état partout. Réservé aux consommateurs
hors ViewV2 (ex. xStream, Explorer v1).

### Édition d'un filtre

`CommonFilterItem` rend une chip `KitFilter` ; son `FilterDropDown` choisit le bon éditeur selon le type
d'attribut et **dispatch** `CHANGE_FILTER_CONFIG` (valeur/condition), `RESET_FILTER` ou `REMOVE_FILTER`.
`useFilters(pinFilters)` ne renvoie que les filtres **non `hidden`** (les pré-filtres `hidden`, posés par
ex. par un panneau de liaison, restent dans la query mais ne s'affichent pas).

---

## Format de la query records (`prepareFiltersForRequest`)

Points à connaître avant de toucher à ce fichier :

- **Filtrage des filtres vides** : un filtre sans valeur est _écarté_, **sauf** si sa condition est une
  "no-value condition" (`nullValueConditions` : `IS_EMPTY`, `IS_NOT_EMPTY`, `TODAY`…) ou `withEmptyValues`.
- **Multi-valeurs** (valuesList, smartFilter, arbre) : génère un groupe `OPEN_BRACKET … OR … CLOSE_BRACKET`
  (ou `AND` si condition `NOT_EQUAL`). Cf. `_generateConditionsFromMultipleValues`.
- **`withEmptyValues` ("Non défini")** : enveloppe la condition dans `(condition OR <field> IS_EMPTY)`
  via `_addEmptyCondition`. **Persisté** (LEAVC-810) : porté par la forme lean (`SerializedFilter.withEmptyValues`),
  par le filtre stocké de la vue et par le core (`IViewV2Filter.withEmptyValues`, GraphQL `Boolean` nullable
  pour rétro-compat). Survit donc au pin/unpin et à un save/reload de vue. Côté ViewV2, un arbre **sans**
  sélection de nœuds mais avec `withEmptyValues` **n'est plus skippé** de la projection lean (sinon un filtre
  "non défini" seul serait perdu).
- **Lien + valuesList** : on filtre sur l'id du record lié → le `field` reçoit un suffixe `.id`.
- **Through** : `field` devient `link.subField`, condition = `subCondition`.
- **Date / Boolean** : transformations spécifiques (`date` recalée à midi, `boolean=false` → `NOT_EQUAL true`).

---

## Le cas arbre (`tree`) — le plus subtil

Un filtre arbre (`IUIFilterTree`) ne se filtre pas comme les autres. **Confirmé côté core**
([getAttributesFromField.ts](../../../../../apps/core/src/domain/record/helpers/getAttributesFromField.ts)) :
un filtre arbre en **champ nu** filtre sur les **labels** des bibliothèques de l'arbre. Pour filtrer par
`recordId`, il faut le `libraryId` → le champ envoyé est `attribut.<libraryId>.id` (construit dans
`_generateConditionsFromMultipleValues` à partir de `nodes[0].libraryId`).

Sémantique des champs d'`IUIFilterTree` :

- **`value` / `nodes`** : sélection "par défaut" issue des **permissions contextuelles** (`useGetTreeFilters`
  charge les nœuds `permissionTreeAttributes` de la library → `view-by-default`).
- **`userNodes` / `userFormattedValue`** : sélection **explicite de l'utilisateur** dans le dropdown.
  `userNodes == null` ⇒ **aucune sélection utilisateur** (≠ tableau vide). `prepareFiltersForRequest`
  s'appuie là-dessus : _pas de userNodes + pas de valeur initiale_ ⇒ filtre **skippé** (aucune condition).
- **`includeHiddenOptions`** : toggle "inclure les options masquées".
- Le **badge** affiché (`CommonFilterItem`) lit `userFormattedValue`, pas `value`.

> ⚠️ Désélectionner tout (`value = []`) dans `CHANGE_FILTER_CONFIG` **restaure** la sélection par défaut
> (`initialFilters`) et remet `userNodes = null` — on ne reste pas sur "rien sélectionné".

---

## Tests

Colocalisés (`*.test.tsx`), wrapper `TestProviders` (cf. [`libs/ui/CLAUDE.md`](../../../CLAUDE.md) § Tests).
Couverture principale : `filtersReducer.test.ts`, `useFiltersReducer.test.ts`, `CommonFilterItem.test.tsx`,
`FilterDropDown.test.tsx`, et les utils arbre (`tree/utils/__test__/`).
