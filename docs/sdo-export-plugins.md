# Étendre un export SDO depuis un plugin

Le core sait exporter une bibliothèque en SDO de façon **déclarative** : la config
`globalSettings.settings.sdo.mapping` associe un chemin SDO (`info.label`) à un `leavAttributeId`.
Ce document décrit ce qu'il faut faire quand cette config ne suffit pas, et les pièges qui attendent
le plugin.

> Types : [`apps/core/src/_types/sdo.ts`](../apps/core/src/_types/sdo.ts) ·
> Construction du SDO : [`apps/core/src/domain/sdo/sdoDomain.ts`](../apps/core/src/domain/sdo/sdoDomain.ts) ·
> Déclenchement : [`apps/core/src/domain/sdo/export/sdoExportDomain.ts`](../apps/core/src/domain/sdo/export/sdoExportDomain.ts) ·
> Exemple complet : le fixture e2e [`fakeplugin`](../apps/core/src/__tests__/e2e/api/_fixtures/fakeplugin/index.ts)
> et sa config [`sdoConfig.ts`](../apps/core/src/__tests__/e2e/api/sdo/sdoConfig.ts).

## Deux points d'extension

|                   | Par chemin SDO                                                       | Sur tout le SDO                                |
| ----------------- | -------------------------------------------------------------------- | ---------------------------------------------- |
| Clé de config     | `sdoAttributes["<chemin>"].exportFunction`                           | `extendSDOFunction` (frère de `leavLibraryId`) |
| Enregistrement    | `registerSDOExportMappingFunctions`                                  | `registerExtendSDOFunctions`                   |
| Signature         | `({record, value, attributeProps, config, ctx}) => Promise<unknown>` | `(record, sdo, ctx) => Promise<ISDO>`          |
| Config d'instance | `exportFunctionConfig` sur l'entrée                                  | —                                              |
| Moment de l'appel | pendant la boucle sur les entrées                                    | **en dernier**, sur le SDO déjà mappé          |

**Préférer `exportFunction` par défaut.** Il produit la valeur d'un chemin SDO **déclaré dans le
mapping**, donc quelqu'un qui lit la config voit d'où vient chaque champ. `extendSDOFunction` reçoit le
SDO **déjà construit** : c'est le seul moyen de post-traiter l'ensemble (croiser deux champs déjà
mappés, par exemple), mais le mapping ne dit alors pas ce que la fonction injecte ni où.

## Une fonction d'export peut produire un bloc entier

Une `exportFunction` n'est pas limitée à transformer la valeur d'un attribut : elle reçoit le
**record complet** et peut agréger ce qu'elle veut. C'est ainsi qu'un bloc calculé — parcourir des
enregistrements liés, lire un attribut différent à chaque niveau d'une hiérarchie — s'exporte tout en
restant déclaré dans le mapping :

```jsonc
"sdoAttributes": {
    "framing": {
        "valueRequired": false,
        "format": "object",
        "exportFunction": "campaignFraming",
        "exportFunctionConfig": {"dimensionGroups": [{"treeId": "…", "behavior": "NESTED"}]}
    }
}
```

```ts
const myExportFunction: ISDOExportMappingFunction = async ({record, config, ctx}) => buildMyBlock(record, config, ctx);
```

Puis, dans le `init` du plugin :

```ts
extensionPoints.registerSDOExportMappingFunctions({campaignFraming: myExportFunction});
```

Un nom référencé mais non enregistré fait échouer l'export avec `Unknown mapping function` — donc **le
plugin qui enregistre la fonction doit être dans le `PLUGINS_PATH`** de tout environnement où le
mapping est posé.

### `leavAttributeId` est optionnel — et c'est important

Une entrée dont la valeur est **calculée** ne désigne aucun attribut source : on omet
`leavAttributeId`. La fonction reçoit alors `record`, `config` et `ctx`, mais **ni `value` ni
`attributeProps`** (il n'y a pas d'attribut porteur dont les tirer).

Ce n'est pas cosmétique, c'est **le garde-fou côté import**. L'import ne sait écrire que dans un
attribut unique : il écarte les entrées sans `leavAttributeId`, exactement comme il écarte les chemins
pointés ([`sdoImportDomain.ts`](../apps/core/src/domain/sdo/import/sdoImportDomain.ts)). Réutiliser un
attribut réel comme faux porteur — `leavAttributeId: "campaigns_objectives"` pour un bloc `framing` —
le rendrait **importable** : un document entrant écrirait le bloc calculé dans cet attribut, et
écraserait la donnée. Ne pas le faire.

Rappels sur les valeurs falsy :

- `leavAttributeId` absent **ou** `""` : même comportement (pas d'attribut porteur). `""` reste la
  convention pour « chemin SDO déclaré dans la config, attribut pas encore choisi ».
- `exportFunction` renseigné ⇒ **la fonction s'exécute**, avec ou sans `leavAttributeId`. Un nom
  inconnu **jette**, plutôt que d'exporter un `null` silencieux qui masquerait la faute de frappe.
- ni l'un ni l'autre ⇒ le chemin est exporté à `null`, sans erreur.

### `format` s'applique au résultat

Le retour passe par `_cleanValue(valeur, format)`. Pour un bloc, c'est `format: "object"`
(passe-plat). Attention : `undefined` devient `null`, donc une fonction qui ne renvoie rien exporte
`"<chemin>": null` — souvent exactement ce qu'on veut (« pas de donnée »), mais autant le savoir.

⚠️ **Un seul chemin par bloc.** Les entrées sont mappées en `Promise.all` avec `_.set` sur un `content`
partagé : deux entrées sœurs (`framing.structure` et `framing.objectives`) courent l'une contre
l'autre à la création de l'objet intermédiaire. Déclarer `framing` en `object`.

### Le `record` reçu

Il vient de `recordDomain.find`, c'est-à-dire le document ArangoDB :

- les attributs `SIMPLE` (y compris de format `extended`) sont des **champs du document**, donc déjà
  des objets JS — pas des chaînes JSON ;
- les attributs de type lien ou arbre **n'y sont pas** : il faut les lire via
  `valueDomain.getRecordFieldValue` (qui sait suivre un chemin multi-sauts) ;
- pour les attributs présents dans le mapping, `record[leavAttributeId]` a été **écrasé** par la
  valeur mappée. Si la forme brute est nécessaire, la relire soi-même.

### Une exception annule tout l'export

L'erreur remonte à `exportApp.onDataEvent`, qui la logge, émet un `SDO_LOG_ERROR` et la relance : le
message AMQP est nacké et **aucun** SDO ne part. Conséquence pratique : ne jeter que sur une
**configuration invalide**, jamais sur une donnée partielle ou une valeur inattendue — celles-ci se
loggent et se dégradent.

## `exportFunctionConfig` — la config d'instance de la fonction

Champ **opaque** de l'entrée de mapping, jamais interprété par le core, passé tel quel en `config`. Il
existe parce qu'une fonction d'export a souvent besoin de valeurs propres à l'instance (ids de LOV,
correspondances métier, comportements) : les mettre là les rend éditables dans l'administration, sans
redéploiement, **à côté du chemin SDO qu'elles servent**.

C'est au plugin de valider la forme reçue (zod ou équivalent) : côté core le type est
`Record<string, unknown>`.

## `additionalAttributeTriggers` — sinon rien ne se déclenche

**Le piège principal.** Un `UPDATE` ne produit un export que si l'attribut sauvé apparaît dans le
mapping (`hasSDOAttribute`, [`utils/sdo/sdo.ts`](../apps/core/src/utils/sdo/sdo.ts)). Or un bloc
calculé lit des attributs qui, par définition, ne sont mappés à **aucun** chemin SDO : sans rien de
plus, les éditer n'émet jamais de SDO.

```jsonc
"additionalAttributeTriggers": ["campaigns_objectives", "campaigns_velocities"]
```

déclare ces attributs de `leavLibraryId` comme déclencheurs, sans leur donner de chemin SDO.

### Et pour les autres bibliothèques : `additionalLibraryTriggers`

Quand le bloc agrège des enregistrements d'**autres** bibliothèques, il faut aussi dire au core
comment remonter de l'enregistrement modifié vers la cible à réexporter. Le chemin est résolu **depuis
l'événement vers la cible**, et peut traverser plusieurs liens :

```jsonc
"additionalLibraryTriggers": [
    { "leavLibraryId": "structure_items", "leavAttributePath": "structure_items_campaign" },
    {
        "leavLibraryId": "structure_items_categories",
        "leavAttributePath": "structure_items_categories_thematic.structure_items_campaign"
    }
]
```

Deux conséquences à connaître :

- ces déclencheurs ne passent **pas** par le filtre `hasSDOAttribute` : n'importe quelle modification
  d'un `structure_items` réexporte la campagne. C'est volontaire, mais ça se paie en volume ;
- la résolution lit l'état **courant** de la base. Délier l'attribut de liaison ne réexporte donc pas
  l'ancienne cible, devenue inatteignable (limitation connue, documentée dans `sdoDomain.ts`).

## Cas réel

L'export du cadrage d'une campagne (`content.framing`, LEAVC-992) est implémenté dans le plugin
xStream `bff-amont-cadrage` et utilise les trois mécanismes ci-dessus : une entrée `framing` sans
`leavAttributeId` avec son `exportFunction`, un `exportFunctionConfig` portant la table « groupe de
dimensions → type SDO » propre à l'instance, et `additionalAttributeTriggers` +
`additionalLibraryTriggers` pour le déclenchement.
