FROM quay.io/keycloak/keycloak:23.0.5 as builder

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_DB=postgres
ENV KC_CACHE=ispn

# To import realms settings
COPY ./realms /opt/keycloak/data/import/

RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:23.0.5
COPY --from=builder /opt/keycloak/lib/quarkus/ /opt/keycloak/lib/quarkus/

WORKDIR /opt/keycloak
