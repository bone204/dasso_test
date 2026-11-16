FROM quay.io/keycloak/keycloak:26.0

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

# Standard entrypoint
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]

# Default start command for dev/testing
CMD ["start-dev", "--http-enabled=true"]

