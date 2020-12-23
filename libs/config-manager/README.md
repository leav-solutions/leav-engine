# Configuration manager

Module to load project configuration, allowing config overrides based on environment.
Given a directory containing all config files, it will load appropriate config for current environment.

All files must be JS files exporting the configuration in an object. Working with JS objects allow to use env variables if needed.

File example:

```javascript
module.exports = {
  server: {
    host: "localhost",
    port: 4001,
  },
  db: {
    url: process.env.DB_URL,
    name: process.env.DB_NAME,
  },
};
```

## How it works?

Given the path and current env, the module will look for three files:

- `default.js`: this file contains the exhaustivity of all possible settings with their default value. Default value might be a `process.env` value
- `[env].js`: file containing **specific** values for this environment. It doesn't have to contain all possible values, only those who needs to be overriden.
- `local.js`: file containing some values specific to where the program is being run. This file is not supposed to be versioned as it's really user specific. It can be useful for development but it's not meant to be used in production for sensitive settings like DB credentials. Use env variables instead.

None of these files are mandatory. If file is not present, the module will just ignore it silently.

## Usage

```javascript
import { loadConfig } from "@leav/config-manager";

const conf = await loadConfig(
  "/absolute/path/to/config/folder",
  process.env.NODE_ENV
);
```

Configuration type can be optionnaly specified:

```js
loadConfig<IConfig>()
```
