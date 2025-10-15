# LEAV Engine - Logger

- Setup with env vars
    - `LOG_LEVEL`: `'error' | 'warn' | 'info' | 'log' | 'verbose' | 'debug' | 'silly'`, default `info`
    - `LOG_FILE`: if defined, path to log file, in plus of stdout/stderr
    - `LOG_USE_JSON_FORMAT`: boolean, if true output log in json format, otherwise write logs with simple formater.
    - `LOG_SILENT`: boolean, to force no log, default is false expect when test run with jest is detected
    - `LOG_ADD_TIMESTAMP`: boolean, add iso date, default is false
    - `LOG_ADD_LOCATION_INFO`: boolean, add file path and line of the logger called, default is false
    - `LOG_ADDITIONAL_META_APP`: string, add 'app' in log metadata
    - `LOG_ADDITIONAL_META_CLIENT`: string, add 'client' in log metadata
    - `LOG_ADDITIONAL_META_ENV`: string, add 'env' in log metadata
    - `LOG_ADDITIONAL_META_VERSION`: string, add 'version' in log metadata
- `configureLogger()` can be called to override setup
