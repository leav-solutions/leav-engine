# LEAV Engine - Logger

- Setup with env vars
    - `LOG_LEVEL`: `'error' | 'warn' | 'info' | 'log' | 'verbose' | 'debug' | 'silly'`, default `info`
    - `LOG_FILE`: if defined, path to log file, in plus of stdout/stderr
    - `LOG_USE_JSON_FORMAT`: boolean, if true output log in json format, otherwise write logs with simple formater.
- `configureLogger()` can be called to override setup
