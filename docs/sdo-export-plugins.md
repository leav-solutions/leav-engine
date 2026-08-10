# Étendre un export SDO depuis un plugin

Le core sait exporter une bibliothèque en SDO de façon **déclarative** : la config
`globalSettings.settings.sdo.mapping` associe un chemin SDO (`info.label`) à un `leavAttributeId`.
Ce document décrit ce qu'il faut faire quand cette config ne suffit pas, et les deux pièges qui
attendent le plugin.

> Types : [`apps/core/src/_types/sdo.ts`](../apps/core/src/_types/sdo.ts) ·
> Construction du SDO : [`apps/core/src/domain/sdo/sdoDomain.ts`](../apps/core/src/domain/sdo/sdoDomain.ts) ·
> Déclenchement : [`apps/core/src/domain/sdo/export/sdoExportDomain.ts`](../apps/core/src/domain/sdo/export/sdoExportDomain.ts) ·
> Exemple complet : le fixture e2e [`fakeplugin`](../apps/core/src/__tests__/e2e/api/_fixtures/fakeplugin/index.ts)
> et sa config [`sdoConfig.ts`](../apps/core/src/__tests__/e2e/api/sdo/sdoConfig.ts).

## Deux points d'extension, à ne pas confondre

|                            | Par attribut                                       | Sur tout le SDO                                 |
| -------------------------- | -------------------------------------------------- | ----------------------------------------------- |
| Clé de config              | `sdoAttributes["<chemin>"].exportFunction`         | `extendSDOFunction` (frère de `leavLibraryId`)  |
| Enregistrement             | `registerSDOExportMappingFunctions`                | `registerExtendSDOFunctions`                    |
| Signature                  | `(value, attributeProps, ctx) => Promise<unknown>` | `({record, sdo, config, ctx}) => Promise<ISDO>` |
| Exige un `leavAttributeId` | **oui**                                            | non                                             |
| Moment de l'appel          | pendant la boucle sur les attributs                | **en dernier**, sur le SDO déjà mappé           |

Une `exportFunction` ne peut transformer **qu'une valeur d'un attribut**. Dès qu'un bloc SDO doit
agréger des enregistrements liés, ou lire un attribut différent à chaque niveau d'une hiérarchie, il
faut une `extendSDOFunction`.

## Écrire une extend function

```ts
const myExtendFunction: IExtendSDOFunction = async ({record, sdo, config, ctx}) => ({
    ...sdo,
    content: {...sdo.content, myBlock: await buildMyBlock(record, config, ctx)},
});
```

Puis, dans le `init` du plugin :

```ts
extensionPoints.registerExtendSDOFunctions({myFunction: myExtendFunction});
```

et dans la config du mapping : `"extendSDOFunction": "myFunction"`. Un nom référencé mais non
enregistré fait échouer l'export avec `Unknown extend SDO function` — donc **le plugin qui enregistre
la fonction doit être dans le `PLUGINS_PATH`** de tout environnement où le mapping est posé.

### Toujours spread `sdo.content`

Le résultat repasse par la validation JSON Schema
([`generic.json`](../apps/core/src/domain/sdo/_jsonSchemas/generic.json)), qui exige `system` **et**
`info`. Remplacer `content` au lieu de l'étendre casse l'export. En revanche le schéma n'a pas
d'`additionalProperties: false` : un nouveau bloc de premier niveau passe tel quel.

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

## `extendSDOFunctionConfig` — la config d'instance de la fonction

Champ **opaque** du mapping, jamais interprété par le core, passé tel quel en `config`. Il existe
parce qu'une extend function a souvent besoin de valeurs propres à l'instance (ids de LOV,
correspondances métier, comportements) : les mettre là les rend éditables dans l'administration, sans
redéploiement, à côté du reste de la config SDO.

```json
{
    "leavLibraryId": "campaigns",
    "extendSDOFunction": "campaignFraming",
    "extendSDOFunctionConfig": {"dimensionGroups": [{"treeId": "…", "behavior": "NESTED"}]},
    "sdoAttributes": {}
}
```

C'est au plugin de valider la forme reçue (zod ou équivalent) : côté core le type est
`Record<string, unknown>`.

## `additionalAttributeTriggers` — sinon rien ne se déclenche

**Le piège principal.** Un `UPDATE` ne produit un export que si l'attribut sauvé apparaît dans le
mapping (`hasSDOAttribute`, [`utils/sdo/sdo.ts`](../apps/core/src/utils/sdo/sdo.ts)). Or un bloc
construit par une extend function lit des attributs qui, par définition, ne sont mappés à **aucun**
chemin SDO : sans rien de plus, les éditer n'émet jamais de SDO.

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
xStream `bff-amont-cadrage` et utilise les trois mécanismes ci-dessus : `extendSDOFunction` pour
construire le bloc, `extendSDOFunctionConfig` pour la table « groupe de dimensions → type SDO » propre
à l'instance, `additionalAttributeTriggers` + `additionalLibraryTriggers` pour le déclenchement.
