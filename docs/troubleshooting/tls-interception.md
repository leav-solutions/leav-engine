# Interception TLS et builds Docker

Que faire quand un proxy d'inspection HTTPS d'entreprise casse les builds Docker de ce repo. Le
mécanisme n'a rien de spécifique à LEAV, mais tout est rapporté ici aux Dockerfiles et aux
services du repo — c'est là que se joue le diagnostic.

> Un proxy d'inspection déchiffre le trafic HTTPS sortant et le re-signe à la volée avec une CA
> privée. Le poste de travail lui fait confiance, **pas les conteneurs** : ils n'héritent pas du
> magasin de certificats de l'hôte. D'où des builds qui échouent alors que la même requête passe
> depuis le terminal.

## Où ça casse dans ce repo

| Build                                                                           | Fichier                                           | Hôtes HTTPS contactés                                             |
| ------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------- |
| Stack locale, service `core`                                                    | `docker/DOCKERFILES/CORE/Dockerfile`              | `dl-cdn.alpinelinux.org` (`apk add perl pkgconfig`)               |
| Stack locale, service `preview-generator` (profil `automate`)                   | `docker/DOCKERFILES/PREVIEW_GENERATOR/Dockerfile` | `dl-cdn.alpinelinux.org`, `raw.githubusercontent.com` (unoconv)   |
| Image de prod `core` (CI, job `build-docker-core`)                              | `docker/DOCKERFILES/build/core.Dockerfile`        | `dl-cdn.alpinelinux.org`, `registry.yarnpkg.com` (`yarn install`) |
| Images de prod `automate-scan`, `sync-scan`, `mcp-runtime`, `preview-generator` | `docker/DOCKERFILES/build/generic.Dockerfile`     | idem + `raw.githubusercontent.com`                                |

⚠️ Les images de prod ne sont **pas** construites par `docker-compose.build.yml` — celui-ci lance
la stack locale depuis les `dist/` déjà buildés. Elles le sont en CI, ou à la main pour les
tester localement :

```shell
docker build --file docker/DOCKERFILES/build/core.Dockerfile -t leav-core:local .

docker build --file docker/DOCKERFILES/build/generic.Dockerfile \
  --build-arg APP=preview-generator --target runner-preview-generator \
  -t leav-preview-generator:local .
```

## Symptôme

```
WARNING: updating and opening https://dl-cdn.alpinelinux.org/alpine/v3.24/main/x86_64/APKINDEX.tar.gz: TLS: server certificate not trusted
2 unavailable, 0 stale
```

Toutes nos images sont Alpine, donc `apk` tombe le premier. Un `apt` sur une base Debian ne
montrerait rien : ses dépôts sont en HTTP avec signatures GPG, aucun certificat n'est validé. Ne
pas en conclure que « c'est Alpine le problème » — l'interception est la même, seul Alpine la
révèle parce qu'`apk` utilise HTTPS.

Côté Node (`yarn install` dans le conteneur, appels sortants de l'app) :
`SELF_SIGNED_CERT_IN_CHAIN` ou `UNABLE_TO_VERIFY_LEAF_SIGNATURE`.

## Diagnostic

```shell
openssl s_client -connect dl-cdn.alpinelinux.org:443 -servername dl-cdn.alpinelinux.org \
  </dev/null 2>/dev/null | openssl x509 -noout -issuer
```

Un émetteur public (Let's Encrypt, Google Trust Services…) = hôte non intercepté. Le nom de la CA
d'entreprise = hôte intercepté.

L'interception se configure **par domaine** : tester l'hôte qui échoue réellement, pas un autre
site en HTTPS. C'est le piège de ce diagnostic — un `wget` qui passe sur un site quelconque ne
prouve rien sur `dl-cdn.alpinelinux.org`.

## Correctif 1 — faire exempter le domaine

Les proxies d'inspection maintiennent une liste « do-not-decrypt ». Les CDN et registries de
paquets en sont des candidats légitimes : leur contenu est déjà signé et vérifié par le
gestionnaire de paquets, le déchiffrement n'apporte rien.

Les quatre hôtes du tableau ci-dessus sont aujourd'hui exemptés. Si un nouveau apparaît — CDN
d'une nouvelle dépendance, registry privé, endpoint S3 — demander l'exemption à l'équipe qui
administre le proxy. C'est le seul correctif qui ne touche pas le repo et qui profite à toute
l'équipe : à tenter en premier.

## Correctif 2 — CA au build, en local uniquement

En dépannage, monter le bundle de l'hôte en **secret de build** sur les `RUN` qui sortent sur le
réseau :

```dockerfile
RUN --mount=type=secret,id=cacerts,target=/etc/ssl/certs/ca-certificates.crt \
    apk --update add perl pkgconfig
```

```shell
docker build --secret id=cacerts,src=/etc/ssl/certs/ca-certificates.crt \
  --file docker/DOCKERFILES/build/core.Dockerfile -t leav-core:local .
```

Un mount de type `secret` est **optionnel par défaut** : si le secret n'est pas fourni — en CI, ou
chez un collègue qui n'est pas derrière un tel proxy — le montage est ignoré et le magasin
d'origine de l'image reste intact. L'instruction est donc inerte partout sauf sur le poste qui en
a besoin, et il n'y a rien à commiter.

Pour la stack locale, déclarer le secret dans un `docker/docker-compose.override.yml`
**gitignoré** :

```yaml
services:
    core:
        build:
            secrets: [cacerts]
secrets:
    cacerts:
        file: /etc/ssl/certs/ca-certificates.crt
```

Trois points qui coûtent une heure si on ne les connaît pas :

- **Compose ne charge pas l'override automatiquement quand on passe un `-f` explicite.** La
  commande documentée étant `docker compose -f docker/docker-compose.yml up -d`, il faut passer
  les deux fichiers ou définir `COMPOSE_FILE`.
- **Sur macOS, `/etc/ssl/certs/ca-certificates.crt` n'existe pas.** `/etc/ssl/cert.pem` existe
  mais c'est le bundle statique d'Apple : il ne contient pas une CA ajoutée au trousseau système.
  Il faut l'exporter :
    ```shell
    security find-certificate -a -p /System/Library/Keychains/SystemRootCertificates.keychain  > ca-bundle.pem
    security find-certificate -a -p /Library/Keychains/System.keychain                        >> ca-bundle.pem
    ```
    Les secrets de build sont lus côté client, donc n'importe quel chemin lisible convient — pas
    besoin de partage de fichiers avec la VM Docker Desktop / OrbStack.
- **Ne jamais graver une CA d'entreprise dans `docker/DOCKERFILES/build/*.Dockerfile`** via un
  `COPY`. Ces images tournent en staging/recette/preprod/prod, où le proxy n'est pas dans le
  chemin : elles feraient confiance à une CA sans aucun bénéfice, pour de la surface d'attaque en
  plus. Le secret de build, lui, ne laisse rien dans l'image.

## Correctif 3 — au runtime de la stack locale

Plutôt que de graver la CA dans les images de dev, la monter dans le même override gitignoré :

```yaml
services:
    core:
        volumes:
            - /etc/ssl/certs/ca-certificates.crt:/etc/ssl/certs/ca-certificates.crt:ro
        environment:
            NODE_EXTRA_CA_CERTS: /etc/ssl/certs/ca-certificates.crt
```

`NODE_EXTRA_CA_CERTS` n'est pas décoratif : **Node embarque ses propres racines et ignore
`/etc/ssl/certs`**. Patcher le bundle système répare `apk`, `curl` et `wget`, pas `yarn`. C'est ce
`yarn` qui compte ici : le service `core` lance `yarn install` au démarrage en mode build
(cf. `docker-compose.build.yml`).

Attention aussi : un bind mount dont la source n'existe pas sur l'hôte est créé comme
**répertoire vide** — le bundle du conteneur devient un dossier et tout le TLS casse avec un
message incompréhensible. Toujours pointer un fichier existant.

## Pourquoi le contexte de build de la stack locale est minuscule

`docker/DOCKERFILES/CORE/` et `docker/DOCKERFILES/PREVIEW_GENERATOR/` servent de contexte de build
à leur propre image. Ces images ne portent aucun code applicatif — le monorepo entier est monté
sur `/app` au runtime (`x-mount_point-repo: ../:/app`) — donc il n'y a rien à envoyer au daemon et
le transfert de contexte fait 2 octets.

Pointer le contexte sur `apps/core` à la place remonterait ~138 Mo à chaque build
(`apps/core/applications` pèse à lui seul 107 Mo), **sans** que le `.dockerignore` de la racine
s'applique : Docker le cherche à la racine du _contexte_, pas du dépôt. C'est délibéré, ne pas
« corriger » ces chemins.
