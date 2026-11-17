FROM quay.io/keycloak/keycloak:26.0 AS builder

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_DB=postgres

# Pre-build optimized Keycloak image during build stage (prevents runtime OOM)
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:26.0
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# Optimize JVM memory for lightweight cloud containers (avoid duplicate GC flag)
ENV JAVA_OPTS_APPEND="-Xms128m -Xmx384m -XX:MaxRAMPercentage=75"

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized", "--http-enabled=true"]


