# libs/utils — CLAUDE.md

`@leav/utils` — Fonctions utilitaires et types partagés entre toutes les apps.

## Exports clés

### Fonctions

| Fonction                                           | Description                                                                 |
| -------------------------------------------------- | --------------------------------------------------------------------------- |
| `getGraphqlTypeFromLibraryName()`                  | Dérive le nom de type GraphQL depuis l'ID d'une Library                     |
| `getGraphqlQueryNameFromLibraryName()`             | Dérive le nom de query GraphQL depuis l'ID d'une Library                    |
| `isFileAllowed()`                                  | Vérifie si un fichier est autorisé selon son type MIME                      |
| `getFileType()`                                    | Retourne le type de fichier (image, video, document…)                       |
| `localizedTranslation()`                           | Retourne la traduction d'un objet `{[lang]: string}` selon la langue active |
| `stringToColor()` / `getInvertColor()`             | Génère/inverse une couleur depuis une chaîne                                |
| `getInitials()`                                    | Extrait les initiales d'un nom                                              |
| `slugifyString()` / `simpleStringHash()`           | Transformations de chaînes                                                  |
| `objectToNameValueArray()` / `nameValArrayToObj()` | Conversion objet ↔ tableau `{name, value}`                                 |
| `omit()`                                           | Retire des clés d'un objet                                                  |
| `waitFor()`                                        | Promise utilitaire (délai async)                                            |
| `isTypeLink()` / `isTypeStandard()`                | Type guards sur les types d'attributs                                       |

### Types et enums notables

-   `AttributeType` — enum des types d'attributs (`SIMPLE`, `SIMPLE_LINK`, `ADVANCED`, `ADVANCED_LINK`, `TREE`)
-   `EventAction` — actions d'événements domaine (CREATE, UPDATE, DELETE, UNLINK…)
-   `FileType` — types de fichiers
-   `IPreviewScalar` — type du scalaire Preview (utilisé dans les gqlTypes de `libs/ui`)
-   `IKeyValue` — type générique `{[key: string]: T}`
-   `Mockify<T>` — utilitaire TypeScript pour mocker un type (remplace chaque méthode par `jest.fn()`)
-   `Override<T1, T2>` — utilitaire TypeScript pour surcharger des propriétés de type
-   `IDateRangeValue`, `IEvent`, `IDbEvent`, `IPubSubEvent` — types d'événements et de valeurs

### Constantes

-   `idFormatRegex` — regex de validation des IDs LEAV
-   `endpointFormatRegex` — regex de validation des endpoints
-   `FORM_ROOT_CONTAINER_ID` — ID du conteneur racine des formulaires
