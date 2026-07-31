# Mails transactionnels — templates et assets

Concerne les quatre templates Handlebars envoyés par le core :

| Mail               | Templates                                                       | Envoyé par                                                                         |
| ------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Notification       | `apps/core/src/domain/notification/channels/email_{fr,en}.html` | [`emailChannel.ts`](../apps/core/src/domain/notification/channels/emailChannel.ts) |
| Reset mot de passe | `apps/core/src/domain/user/resetPassword_{fr,en}.html`          | [`userDomain.ts`](../apps/core/src/domain/user/userDomain.ts)                      |

## Les assets

Les images vivent dans `assets/mail/`, à la racine du repo :

| Fichier                         | Variable de template          | Rôle                                        |
| ------------------------------- | ----------------------------- | ------------------------------------------- |
| `logo-aristid.png`              | `brandLogoUrl`                | Logo de l'éditeur, figé                     |
| `logo-product-default.png`      | `productLogoUrl` (par défaut) | Logo produit par défaut (LEAV engine)       |
| `illustration-notification.png` | `illustrationUrl`             | Illustration en tête de la carte de contenu |

> ⚠️ Tout est en **PNG** : aucun client mail ne rend le SVG.

Les trois URLs sont construites par
[`getMailTemplateAssets`](../apps/core/src/utils/helpers/getMailTemplateAssets.ts) à partir de
`config.server.publicUrl`.

## Route publique `/mail-assets`

`assets/mail/` est servi en statique par [`server.ts`](../apps/core/src/interface/server.ts),
**sans `_checkAuth`** — contrairement à `/previews`, `/exports` et `/imports` : un client mail charge
les images hors session, sans cookie ni token. Cache d'un jour.

## Résolution du logo produit

`getMailTemplateAssets({publicUrl, hasGlobalIcon})` :

- une icône est configurée (`globalSettings.icon`) → `${publicUrl}/global-icon/medium`, qui sert la
  **preview générée** du fichier (PNG/JPEG) : rendu correct en mail ;
- sinon → le PNG embarqué `logo-product-default.png`. On ne passe pas par `/global-icon` dans ce cas :
  sans icône, la route retombe sur `assets/logo-leavengine.svg`, donc du SVG.

Limite connue : si une icône est configurée mais que sa preview est absente, `/global-icon/:size` sert
`assets/favicon-leav.svg` (cf. [`globalSettingsApp.ts`](../apps/core/src/app/core/globalSettingsApp.ts))
→ image cassée dans le mail.

## Surcharger le branding d'une instance

Le dossier `assets/` est copié tel quel dans l'image core
(`COPY assets/ ./assets` dans [`core.Dockerfile`](../docker/DOCKERFILES/build/core.Dockerfile)) : au
runtime, les fichiers sont sous `/app/assets/`. Une instance surcharge le branding en **écrasant le
fichier** depuis son image dérivée — même mécanisme que l'icône et la favicon.

Exemple côté xstream (`build-scripts/core/Dockerfile`), qui n'utilise pas de `globalIcon` et affiche
donc le logo produit par défaut :

```dockerfile
COPY assets/aristid-header.svg /app/assets/logo-leavengine.svg
COPY assets/favicon.svg /app/assets/favicon-leav.svg
COPY assets/logo-campaigns-manager.png /app/assets/mail/logo-product-default.png
```

Contraintes pour un logo produit de remplacement :

- PNG à fond transparent (le mail a un fond `#f4f7ff`) ;
- affiché en `height: 40px` / `max-width: 160px` → exporter à ≥ 2× (hauteur 120 à 160 px) pour le
  rendu sur écran retina ;
- ratio ≤ 4:1, au-delà le logo est bridé par `max-width` et rétréci.

## Tester en local

Le profil `mail` de la stack Docker lance [Mailpit](http://mailpit.leav.localhost), qui capture tous
les mails sortants :

```bash
docker compose -f docker/docker-compose.yml --profile mail up -d
```

Les images doivent s'afficher directement dans Mailpit : `SERVER_PUBLIC_URL`
(`http://core.leav.localhost`) est joignable depuis le navigateur.
