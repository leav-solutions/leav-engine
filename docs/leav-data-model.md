# Le modèle de données LEAV

Ce document décrit le méta-modèle LEAV : le pattern Library/Entity/Attribute/Value, les types
d'attributs et de liaisons, et le vocabulaire exposé aux administrateurs. À lire avant de
modéliser des données, de toucher au domaine `attribute` / `library` / `tree` du core, ou de
relier du code aux écrans de l'app Administration.

Pour les conventions de code, voir [`CODING_GUIDELINES.md`](../CODING_GUIDELINES.md). Pour les
décisions d'architecture, [`docs/adr/`](adr).

## Qu'est-ce que LEAV ?

**LEAV** (Libraries, Entities, Attributes, Values) est un framework NoCode/LowCode de gestion
de données à schéma dynamique.

Principe fondamental : **la structure des données n'est pas connue à l'avance**.
Le modèle métier se définit à l'exécution — l'utilisateur n'a pas besoin d'écrire de migration
DDL pour faire évoluer son schéma de données. En revanche, l'engine lui-même évolue : ses
structures internes (ex. `raw_values` → `payload`) font l'objet de migrations lors des mises à
jour. LEAV s'adapte à n'importe quel domaine métier (stocks, CRM, dossiers fiscaux, réservations…)
sans redéveloppement applicatif.

Il est **multi-modèle** :

- modèle tabulaire (colonnes classiques)
- modèle EAV (Entity-Attribute-Value) pour les données multivaluées
- modèle relationnel pour les liens entre entités

## Le pattern LEAV

C'est une extension du pattern classique **EAV (Entity-Attribute-Value)** :

- **Library** — le méta-modèle : définit ce qu'est une Entity, quels Attributs elle peut avoir,
  leurs types, leurs règles de validation. Le schéma est lui-même une donnée gérée par le système.
  La Library est aussi ce qui introduit les **relations entre éléments** : un Attribute peut être
  de type "liaison" (`link`) et pointer vers des Entities d'une autre Library. C'est ce qui élève
  LEAV au-dessus d'un EAV basique — le graphe de données est modélisable sans migration de schéma.
- **Entity** — une instance de donnée (ex : un produit, une personne, une session)
- **Attribute** — une propriété d'une Entity (ex : couleur, poids, durée). Deux types de liaisons
  permettent d'exprimer des relations inter-Library :
    - **`link`** — lien simple vers une Library classique (collection plate d'Entities)
    - **`tree`** — lien avancé vers une Library arborescente : c'est un type de Library à part
      entière dont les Entities sont organisées en hiérarchie de nœuds, avec ses propres règles de
      gestion. Permet de modéliser taxonomies, structures organisationnelles, workflows, etc.
- **Value** — la valeur concrète d'un Attribute pour une Entity donnée

## Modélisation côté Administration (vocabulaire admin/utilisateur)

Le paramétrage structurel se fait dans l'app **Administration** (back-office LEAV). Le vocabulaire
exposé aux administrateurs y est plus fin que les noms techniques `link`/`tree` ci-dessus. Utile à
connaître pour relier le code aux écrans et à la doc utilisateur.

**Les 4 comportements de bibliothèque** (`behavior`) :

| Comportement  | Usage                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------ |
| `standard`    | Comportement de base — grande majorité des cas                                             |
| `files`       | À la création, upload d'un fichier + sélection de l'emplacement dans l'arbre des fichiers  |
| `directories` | Même logique que `files`, pour les dossiers                                                |
| `join`        | **Bibliothèque jointure** — matérialise une relation N-N comme un objet métier manipulable |

**Les 5 types d'attributs** :

| Type        | Cardinalité   | Usage typique                                                                                       |
| ----------- | ------------- | --------------------------------------------------------------------------------------------------- |
| Simple      | Mono          | Valeur au format texte, numérique, booléen, date, période, couleur, texte enrichi, étendu           |
| Avancé      | Mono ou multi | Valeur avec versioning (axe contextuel), traduction ou métadonnées                                  |
| Lien simple | Mono          | Clé étrangère (FK) directe vers une entité d'une autre bibliothèque, sans donnée portée sur le lien |
| Lien avancé | Mono ou multi | Relation vers une autre bibliothèque, peut porter des données sur le lien (collection edge)         |
| Arbre       | Mono ou multi | Référence à un nœud d'un arbre                                                                      |

> Le choix du type est **définitif**. Simple vs Avancé est un contrat fonctionnel (UX + features),
> pas une question de perf. Préférer **Arbre** dès qu'on anticipe un besoin de permissions
> contextuelles ou de formulaires conditionnels, même si les valeurs sont une liste fermée.

**Nuances de liaisons** :

- **Lien simple** → mono, FK directe, pas de donnée sur le lien.
- **Lien avancé** → peut être multivalué, peut pointer vers une bibliothèque de comportement `join`.
- **Liaison inverse** → vue de la relation dans l'autre sens. Pas un type autonome, pas de donnée stockée à ce niveau.
- **Bibliothèque jointure (`join`)** → traite une relation N-N comme un objet métier (ex : la **SIC** matérialise la relation Élément de structure ↔ Catégorie marché dans Campaigns Manager). Le comportement `join` est une propriété de la bibliothèque _cible_, pas du lien qui pointe vers elle.
- **Liaison directe** (vs avancée) → modélise une bibliothèque _dépendante/fille_ dont les entités n'existent pas sans leur entité père (ex : adresses d'un contact). Supprimer le père supprime réellement les entités liées ; on ne « détache » pas, on supprime. À l'inverse, supprimer une liaison _avancée_ supprime le lien, pas l'entité liée.

**Les arbres** : structure hiérarchique parent-enfant (racine unique, pas de cycle). Spécificité LEAV :
chaque nœud est lié à une entité d'une bibliothèque, une même entité peut être liée à plusieurs nœuds,
et les nœuds d'un même arbre peuvent provenir de bibliothèques différentes. Les arbres servent aussi de
listes de valeurs configurables et de support aux **permissions contextuelles**, aux **formulaires
conditionnels** et au **versionning de valeurs**. Côté API GraphQL, on parcourt un arbre via
`treeContent`, ou via la valeur d'un attribut de type `tree`.

> 📖 Doc utilisateur (Confluence) :
>
> - [Choisir le type d'un attribut](https://aristid.atlassian.net/wiki/spaces/XSTREAM/pages/1743519867)
> - [Choisir le bon sens d'une liaison](https://aristid.atlassian.net/wiki/spaces/XSTREAM/pages/1743913050)
> - [Créer une liaison bidirectionnelle](https://aristid.atlassian.net/wiki/spaces/XSTREAM/pages/1743257764)
> - [Trame de formation LEAV — PO/PM](https://aristid.atlassian.net/wiki/spaces/PRODUIT/pages/2233204749)
