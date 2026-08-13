# LEAV Engine - Monitoring server

Create an independent monitoring http server for any long running nodejs service.

- Setup listen port with MONITORING_SERVER_PORT env var, default is 44444.
- Routes:
    - / always return 200
    - /health execute healthCheckFunction if any and return status code 500 if false
