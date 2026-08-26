# manage-files — CLAUDE.md

Les deux modales de gestion de fichiers d'une bibliothèque de comportement `files` /
`directories` : **`UploadFiles`** (envoyer des fichiers) et **`CreateDirectory`** (créer un
dossier). Elles sont regroupées parce qu'elles partagent réellement quelque chose : deux opérations
GraphQL, la résolution de l'arbre `files` système, l'étape « choisir une destination » et la forme
du wizard.

---

## Arborescence

```
manage-files/
├── _queries/          # les 6 opérations GraphQL du module, en .graphql
├── _types.ts
├── shared/            # ce que les deux modales partagent — et rien d'autre
│   ├── FilesWizardModal/     # coquille KitModal + KitSteps + slot de footer (+ useWizardSteps)
│   ├── DestinationStep/      # étape 0 : SelectTreeNode encadré + titre de chemin tronqué
│   ├── useFilesTreeLibraries/
│   └── useDoesFileExistAsChild/
├── upload-files/
└── create-directory/
```

Règle de frontière : un élément monte dans `shared/` **quand les deux modales l'utilisent
effectivement**, pas quand il pourrait servir un jour. `useSelectedDirectoryPath` reste dans
`upload-files/` pour cette raison — `CreateDirectory` n'affiche pas de chemin.

`FilesWizardModal` ne fait volontairement **aucun branchement** : chaque modale compose son propre
footer, parce que leurs boutons diffèrent étape par étape (3 étapes vs 2). Si la coquille se met à
accumuler des props booléennes, c'est le signal qu'il faut la réduire à `useWizardSteps` seul.

---

## Contrat d'appel

Les deux composants **n'ont pas de prop `open`** : ils sont montés conditionnellement par leur
appelant, et `onClose` démonte. Trois appelants, tous via le barrel `_ui/components` ou
`@leav/ui` :

- [`ExplorerV2/actions-primary/useCreatePrimaryAction.tsx`](../ExplorerV2/actions-primary/useCreatePrimaryAction.tsx)
- [`Explorer/actions-primary/useCreatePrimaryAction.tsx`](../Explorer/actions-primary/useCreatePrimaryAction.tsx) (legacy, strictement identique au précédent)
- `apps/app-studio/…/tree-explorer/Column/actions/DefaultActions.tsx`

Les deux `useCreatePrimaryAction` **ferment la modale dans leur `onCompleted`** : l'étape 3
d'`UploadFiles` (récapitulatif + bouton « Fermer ») n'est donc jamais visible depuis un Explorer.
Elle ne l'est que pour un appelant qui ne ferme pas lui-même.

Asymétrie assumée entre les deux : `UploadFiles` prend `defaultSelectedNode: {id, recordId}` et
affiche le chemin de destination ; `CreateDirectory` prend `defaultSelectedKey: string` et n'affiche
rien.

---

## Le piège du module : les fichiers ne sont pas des objets

Les entrées du `fileList` d'antd **sont les instances `File` du navigateur**, décorées par antd
(`uid`, `percent`, `status`). Ce ne sont jamais des objets simples. Conséquences :

- **Ne pas les spread.** `{...file}` ne copie que les propriétés ajoutées : `name`, `size` et `type`
  vivent sur `File.prototype` et disparaissent. La liste se vide de son contenu et la mutation
  d'upload, qui envoie l'instance telle quelle (`data: file`), casse.
- D'où la mise à jour **en place** dans `useUploadFiles` sur réception de la subscription de
  progression : le re-render est porté par la nouvelle identité du **tableau**, pas des items.
- D'où aussi le choix de garder les décisions « remplacer / conserver les deux » dans une map
  `uid → boolean` (`ReplaceDecisions`) plutôt que sur le fichier.

---

## Un fichier envoyé n'est pas immédiatement dans l'arbre

Les mutations `upload` et `createDirectory` **n'attachent pas** le nœud à l'arbre `files` : elles
créent le record et écrivent sur le système de fichiers. C'est `automate-scan` qui émet l'événement
FS, et le `filesManager` du core qui, en le traitant, appelle `treeDomain.addElement`. Deux
conséquences :

- **Invalider le cache Apollo à la fin de la mutation ne sert à rien** : la requête repartirait avant
  que le nœud existe. D'où le `refreshOnMount` de `DestinationStep` — on garantit « à chaque
  ouverture, l'état réel du serveur », pas « le fichier visible immédiatement ».
- En local **sans le profil docker `automate`**, le fichier n'apparaît jamais dans l'arbre, alors que
  son record existe. Symptôme trompeur quand on teste à la main : `doesFileExistAsChild` interroge
  les **enfants du nœud d'arbre**, donc la modale de conflit ne s'ouvre pas pour un nom pourtant
  présent en base.
