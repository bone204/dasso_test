# Keycloak Service (Railway Deployment)

Base Keycloak 26 container ready for deployment on Railway and connection to Supabase PostgreSQL.

## Environment Variables required on Railway:
```env
KC_DB=postgres
KC_DB_URL=jdbc:postgresql://<SUPABASE_HOST>:5432/postgres?sslmode=require
KC_DB_USERNAME=postgres.<PROJECT_REF>
KC_DB_PASSWORD=<SUPABASE_PASSWORD>

KC_BOOTSTRAP_ADMIN_USERNAME=admin
KC_BOOTSTRAP_ADMIN_PASSWORD=admin

KC_PROXY_HEADERS=xforwarded
KC_HTTP_ENABLED=true
KC_HOSTNAME_STRICT=false
```

