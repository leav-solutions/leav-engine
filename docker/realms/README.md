# Keycloak realms for local dev

## Export

```
docker exec -ti docker-keycloak-1 sh
/opt/keycloak/bin/kc.sh export --file /opt/keycloak/data/import/LEAV.json
```

## Import

Automatic during keycloak startup with `--import-realm` option in docker/docker-compose.oidc.yml
